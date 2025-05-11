import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import {
  Box,
  Button,
  ClientOnly,
  Flex,
  Grid,
  GridItem,
  Heading,
  Input,
  Skeleton,
  Text,
  Stack,
  HStack,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { ColorModeToggle } from "../components/color-mode-toggle";
import { useState } from "react";
import {
  useGetFeedsQuery,
  useRegisterFeedMutation,
} from "../generated/graphql";
import { toaster } from "../components/ui/toaster";

// フィードアイテムコンポーネント
const FeedItem = ({
  feed,
  isSelected,
  onSelect,
}: {
  feed: any;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  return (
    <Box
      p={2}
      bg={isSelected ? "blue.50" : "transparent"}
      _dark={{ bg: isSelected ? "blue.900" : "transparent" }}
      borderRadius="md"
      cursor="pointer"
      onClick={onSelect}
      mb={1}
    >
      <Text fontWeight={isSelected ? "bold" : "normal"}>{feed.title}</Text>
    </Box>
  );
};

export const Route = createRootRoute({
  component: () => {
    const [selectedFeedId, setSelectedFeedId] = useState<string | null>(null);
    const [newFeedUrl, setNewFeedUrl] = useState("");

    // フィード一覧を取得
    const {
      loading: feedsLoading,
      error: feedsError,
      data: feedsData,
      refetch: refetchFeeds,
    } = useGetFeedsQuery();

    // フィード登録ミューテーション
    const [registerFeed, { loading: registerLoading }] =
      useRegisterFeedMutation({
        onCompleted: () => {
          toaster.create({
            title: "フィードを追加しました",
            type: "success",
          });
          setNewFeedUrl("");
          refetchFeeds();
        },
        onError: (error) => {
          toaster.create({
            title: "エラーが発生しました",
            description: error.message,
            type: "error",
          });
        },
      });

    // 新しいフィードを追加する処理
    const handleAddFeed = () => {
      if (newFeedUrl.trim()) {
        registerFeed({
          variables: {
            input: {
              url: newFeedUrl.trim(),
            },
          },
        });
      }
    };

    // データ取得中の表示
    if (feedsLoading && !feedsData) {
      return (
        <Center h="100vh">
          <Spinner size="xl" />
        </Center>
      );
    }

    // エラー表示
    if (feedsError) {
      return (
        <Center h="100vh">
          <Text>エラーが発生しました: {feedsError.message}</Text>
        </Center>
      );
    }

    const feeds = feedsData?.feeds || [];

    return (
      <Grid
        templateAreas={`
          "header header"
          "sidebar main"
        `}
        gridTemplateRows={"60px 1fr"}
        gridTemplateColumns={"250px 1fr"}
        h="100vh"
        gap={0}
      >
        {/* ヘッダー */}
        <GridItem area="header" bg="blue.500" _dark={{ bg: "blue.800" }} px={4}>
          <Flex h="100%" alignItems="center" justifyContent="space-between">
            <Heading size="lg" color="white">
              Simple RSS
            </Heading>
            <ClientOnly fallback={<Skeleton w="10" h="10" rounded="md" />}>
              <ColorModeToggle />
            </ClientOnly>
          </Flex>
        </GridItem>

        {/* サイドバー */}
        <GridItem
          area="sidebar"
          borderRight="1px"
          borderColor="gray.200"
          _dark={{ borderColor: "gray.700" }}
          p={4}
        >
          <Stack align="stretch" gap={4} h="100%">
            <Box>
              <Heading size="md" mb={2}>
                フィード
              </Heading>
              <Stack gap={1}>
                {/* システムフィード */}
                <Link to="/">
                  <Box
                    p={2}
                    bg={selectedFeedId === null ? "blue.50" : "transparent"}
                    _dark={{
                      bg: selectedFeedId === null ? "blue.900" : "transparent",
                    }}
                    borderRadius="md"
                    cursor="pointer"
                    onClick={() => setSelectedFeedId(null)}
                  >
                    <Text
                      fontWeight={selectedFeedId === null ? "bold" : "normal"}
                    >
                      すべての記事
                    </Text>
                  </Box>
                </Link>
                <Link to="/favorite">
                  <Box
                    p={2}
                    bg="transparent"
                    _dark={{ bg: "transparent" }}
                    borderRadius="md"
                    cursor="pointer"
                  >
                    <Text>お気に入り</Text>
                  </Box>
                </Link>

                {/* 罫線 */}
                <Box
                  borderTopWidth="1px"
                  borderColor="gray.200"
                  _dark={{ borderColor: "gray.700" }}
                  my={2}
                />

                {/* RSSフィード */}
                <Text fontSize="sm" color="gray.500" mb={1}>
                  RSSフィード
                </Text>
                {feeds.map((feed) => (
                  <Link
                    key={feed.feedId}
                    to="/feeds/$feedId"
                    params={{ feedId: feed.feedId }}
                  >
                    <FeedItem
                      feed={feed}
                      isSelected={selectedFeedId === feed.feedId}
                      onSelect={() => setSelectedFeedId(feed.feedId)}
                    />
                  </Link>
                ))}
                {feedsLoading && (
                  <Center py={2}>
                    <Spinner size="sm" />
                  </Center>
                )}
              </Stack>
            </Box>

            <Box
              borderTopWidth="1px"
              borderColor="gray.200"
              _dark={{ borderColor: "gray.700" }}
              pt={4}
            >
              <Heading size="md" mb={2}>
                フィードを追加
              </Heading>
              <Box>
                <Text mb={2}>フィードURL</Text>
                <Flex>
                  <Input
                    value={newFeedUrl}
                    onChange={(e) => setNewFeedUrl(e.target.value)}
                    placeholder="https://example.com/feed"
                    mr={2}
                    disabled={registerLoading}
                  />
                  <Button
                    onClick={handleAddFeed}
                    loading={registerLoading}
                    loadingText="追加中"
                  >
                    追加
                  </Button>
                </Flex>
              </Box>
            </Box>
          </Stack>
        </GridItem>

        {/* メインコンテンツ */}
        <GridItem area="main" p={6} overflowY="auto">
          <Outlet />
          <TanStackRouterDevtools />
        </GridItem>
      </Grid>
    );
  },
});
