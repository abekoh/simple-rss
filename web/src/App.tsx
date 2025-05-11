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
import { toaster } from "./components/ui/toaster";
import { ColorModeToggle } from "./components/color-mode-toggle";
import { useState } from "react";
import dayjs from "dayjs";
import {
  useGetFeedsQuery,
  useGetPostsQuery,
  useRegisterFeedMutation,
  Feed,
  Post,
  PostStatus,
  PostsInputOrder,
} from "./generated/graphql";

// 日付をフォーマットする関数
const formatDate = (dateString: any | null | undefined) => {
  if (!dateString) return "";
  return dayjs(dateString).format("YYYY年MM月DD日 HH:mm");
};

// フィードアイテムコンポーネント
const FeedItem = ({
  feed,
  isSelected,
  onSelect,
}: {
  feed: Feed;
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

// 記事アイテムコンポーネント
const PostItem = ({ post }: { post: Post }) => {
  return (
    <Box mb={4} p={4} borderWidth="1px" borderRadius="md">
      <Box pb={0}>
        <Heading size="md">{post.title}</Heading>
      </Box>
      <Box py={2}>
        <Text>{post.description}</Text>
      </Box>
      <Flex pt={0} justifyContent="space-between" alignItems="center">
        <Text fontSize="sm" color="gray.500">
          {post.author && `${post.author} - `}
          {formatDate(post.postedAt)}
        </Text>
        <Button size="sm" variant="outline">
          詳細を見る
        </Button>
      </Flex>
    </Box>
  );
};

export default function App() {
  const [selectedFeedId, setSelectedFeedId] = useState<string | null>(null);
  const [newFeedUrl, setNewFeedUrl] = useState("");

  // フィード一覧を取得
  const {
    loading: feedsLoading,
    error: feedsError,
    data: feedsData,
    refetch: refetchFeeds,
  } = useGetFeedsQuery();

  // 記事一覧を取得
  const {
    loading: postsLoading,
    error: postsError,
    data: postsData,
    refetch: refetchPosts,
  } = useGetPostsQuery({
    variables: {
      input: {
        feedIds: selectedFeedId ? [selectedFeedId] : [],
        limit: 20,
        offset: 0,
        order: PostsInputOrder.PostedAtDesc,
      },
    },
  });

  // フィード登録ミューテーション
  const [registerFeed, { loading: registerLoading }] = useRegisterFeedMutation({
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
  const posts = postsData?.posts?.posts || [];
  const totalCount = postsData?.posts?.totalCount || 0;

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
                <Text fontWeight={selectedFeedId === null ? "bold" : "normal"}>
                  すべての記事
                </Text>
              </Box>
              <Box
                p={2}
                bg="transparent"
                _dark={{ bg: "transparent" }}
                borderRadius="md"
                cursor="pointer"
              >
                <Text>お気に入り</Text>
              </Box>

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
                <FeedItem
                  key={feed.feedId}
                  feed={feed}
                  isSelected={selectedFeedId === feed.feedId}
                  onSelect={() => setSelectedFeedId(feed.feedId)}
                />
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
        <Heading size="lg" mb={4}>
          {selectedFeedId
            ? feeds.find((feed) => feed.feedId === selectedFeedId)?.title ||
              "記事一覧"
            : "すべての記事"}
        </Heading>
        <Text mb={4} color="gray.500">
          {totalCount}件の記事
        </Text>

        {postsLoading ? (
          <Center py={10}>
            <Spinner size="lg" />
          </Center>
        ) : postsError ? (
          <Text color="red.500">
            記事の取得中にエラーが発生しました: {postsError.message}
          </Text>
        ) : posts.length === 0 ? (
          <Text>記事がありません</Text>
        ) : (
          posts.map((post) => <PostItem key={post.postId} post={post} />)
        )}
      </GridItem>
    </Grid>
  );
}
