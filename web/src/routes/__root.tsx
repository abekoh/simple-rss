import { useAuth0 } from "@auth0/auth0-react";
import {
  Box,
  Button,
  ClientOnly,
  Drawer,
  Flex,
  Grid,
  GridItem,
  Heading,
  IconButton,
  Input,
  Portal,
  Skeleton,
  Text,
  Stack,
  Spinner,
  Center,
  useBreakpointValue,
  Container,
  StackSeparator,
} from "@chakra-ui/react";
import {
  createRootRoute,
  Link,
  Outlet,
  useMatches,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useMemo, useState } from "react";
import { LuMenu } from "react-icons/lu";

import { ColorModeToggle } from "../components/color-mode-toggle";
import { toaster } from "../components/ui/toaster";
import {
  useGetFeedsQuery,
  useRegisterFeedMutation,
} from "../generated/graphql";

// レイアウトに関する定数
const LAYOUT = {
  // ブレークポイント
  breakpoints: {
    mobile: "base",
    desktop: "lg",
  },
  // サイズ
  sizes: {
    headerHeight: "50px",
    sidebarWidth: "250px",
  },
};

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
    >
      <Text
        fontWeight={isSelected ? "bold" : "normal"}
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
      >
        {feed.title}
      </Text>
    </Box>
  );
};

// ルートコンポーネント
const RootComponent = () => {
  const matches = useMatches();
  const [newFeedUrl, setNewFeedUrl] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const {
    user,
    isAuthenticated,
    isLoading: isAuth0Loading,
    loginWithRedirect,
    logout,
  } = useAuth0();

  const currentMatch = useMemo(() => {
    return matches.find((match) => match.id !== "__root__");
  }, [matches]);

  // ブレイクポイントに基づいてサイドバーの表示/非表示を決定
  const isMobile = useBreakpointValue({
    [LAYOUT.breakpoints.mobile]: true,
    [LAYOUT.breakpoints.desktop]: false,
  });

  // フィード一覧を取得
  const {
    loading: feedsLoading,
    error: feedsError,
    data: feedsData,
    refetch: refetchFeeds,
  } = useGetFeedsQuery();

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
  if (isAuth0Loading || (feedsLoading && !feedsData)) {
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

  const isTopSelected = currentMatch?.routeId === "/";
  const isFavoriteSelected = currentMatch?.routeId === "/favorite";

  const SidebarContent = () => (
    <Stack align="stretch" gap={4} h="100%" separator={<StackSeparator />}>
      <Box>
        <Stack gap={1}>
          <Link to="/" search={{ page: 1 }}>
            <Box
              p={2}
              bg={isTopSelected ? "blue.50" : "transparent"}
              _dark={{
                bg: isTopSelected ? "blue.900" : "transparent",
              }}
              borderRadius="md"
              cursor="pointer"
              onClick={() => {
                if (isMobile) setDrawerOpen(false);
              }}
            >
              <Text fontWeight={isTopSelected ? "bold" : "normal"}>
                すべての記事
              </Text>
            </Box>
          </Link>
          <Link to="/favorite" search={{ page: 1 }}>
            <Box
              p={2}
              bg={isFavoriteSelected ? "blue.50" : "transparent"}
              _dark={{
                bg: isFavoriteSelected ? "blue.900" : "transparent",
              }}
              borderRadius="md"
              cursor="pointer"
              onClick={() => {
                if (isMobile) setDrawerOpen(false);
              }}
            >
              <Text fontWeight={isFavoriteSelected ? "bold" : "normal"}>
                お気に入り
              </Text>
            </Box>
          </Link>
        </Stack>
      </Box>

      {feeds.length > 0 && (
        <Box>
          {feeds.map((feed) => (
            <Link
              key={feed.feedId}
              to="/feeds/$feedId"
              params={{ feedId: feed.feedId }}
              search={{ page: 1 }}
            >
              <FeedItem
                feed={feed}
                isSelected={
                  currentMatch?.routeId === "/feeds/$feedId" &&
                  currentMatch.params.feedId === feed.feedId
                }
                onSelect={() => {
                  if (isMobile) setDrawerOpen(false);
                }}
              />
            </Link>
          ))}
        </Box>
      )}

      <Box>
        <Heading size="md" mb={2}>
          フィードを追加
        </Heading>
        <Flex mb={4}>
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
        {isAuthenticated ? (
          <Stack gap={1} alignItems="flex-start">
            <Text>ログイン中{user?.email ? `(${user.email})` : ""}</Text>
            <Button onClick={() => logout()}>ログアウト</Button>
          </Stack>
        ) : (
          <Button onClick={() => loginWithRedirect()}>ログイン</Button>
        )}

        <Box mt={4}>
          <ClientOnly fallback={<Skeleton w="10" h="10" rounded="md" />}>
            <ColorModeToggle />
          </ClientOnly>
        </Box>
      </Box>
    </Stack>
  );

  return (
    <Container>
      <Grid
        templateAreas={{
          [LAYOUT.breakpoints.mobile]: `"header" "main"`,
          [LAYOUT.breakpoints.desktop]: `"header header" "main sidebar"`,
        }}
        gridTemplateRows={{
          [LAYOUT.breakpoints.mobile]: `${LAYOUT.sizes.headerHeight} 1fr`,
          [LAYOUT.breakpoints.desktop]: `${LAYOUT.sizes.headerHeight} 1fr`,
        }}
        gridTemplateColumns={{
          [LAYOUT.breakpoints.mobile]: "1fr",
          [LAYOUT.breakpoints.desktop]: `1fr ${LAYOUT.sizes.sidebarWidth}`,
        }}
        h="100vh"
        gap={0}
      >
        {/* ヘッダー */}
        <GridItem area="header">
          <Flex h="100%" alignItems="center" justifyContent="space-between">
            <Heading size="lg">
              <Link
                to="/"
                search={{
                  page: 1,
                }}
              >
                Simple RSS
              </Link>
            </Heading>
            {isMobile && (
              <IconButton
                variant="ghost"
                aria-label="メニューを開く"
                onClick={() => setDrawerOpen(true)}
              >
                <LuMenu />
              </IconButton>
            )}
          </Flex>
        </GridItem>

        {/* メインコンテンツ */}
        <GridItem area="main" overflowY="auto" scrollbarWidth="none">
          <Outlet />
          <TanStackRouterDevtools />
        </GridItem>

        {/* PC用サイドバー - モバイルでは非表示 */}
        {!isMobile && (
          <GridItem
            area="sidebar"
            borderLeft="1px"
            borderColor="gray.200"
            overflowY="auto"
            _dark={{ borderColor: "gray.700" }}
            p={4}
            scrollbarWidth="none"
          >
            <SidebarContent />
          </GridItem>
        )}

        {/* モバイル用Drawer - 右側に表示 */}
        {isMobile && (
          <Drawer.Root
            open={drawerOpen}
            onOpenChange={(e) => setDrawerOpen(e.open)}
          >
            <Portal>
              <Drawer.Backdrop />
              <Drawer.Positioner>
                <Drawer.Content>
                  <Drawer.Body>
                    <SidebarContent />
                  </Drawer.Body>
                </Drawer.Content>
              </Drawer.Positioner>
            </Portal>
          </Drawer.Root>
        )}
      </Grid>
    </Container>
  );
};

export const Route = createRootRoute({
  component: RootComponent,
});
