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
} from "@chakra-ui/react";
import { ColorModeToggle } from "./components/color-mode-toggle";
import { useState } from "react";
import dayjs from "dayjs";

// モックデータ
const mockFeeds = [
  {
    feedId: "1",
    url: "https://example.com/feed1",
    title: "テックニュース",
    description: "最新のテクノロジーニュース",
    registeredAt: "2025-05-01T00:00:00Z",
    lastFetchedAt: "2025-05-10T00:00:00Z",
  },
  {
    feedId: "2",
    url: "https://example.com/feed2",
    title: "プログラミングブログ",
    description: "プログラミングに関する記事",
    registeredAt: "2025-05-02T00:00:00Z",
    lastFetchedAt: "2025-05-10T00:00:00Z",
  },
  {
    feedId: "3",
    url: "https://example.com/feed3",
    title: "デザインニュース",
    description: "デザインに関する最新情報",
    registeredAt: "2025-05-03T00:00:00Z",
    lastFetchedAt: "2025-05-10T00:00:00Z",
  },
];

const mockPosts = [
  {
    postId: "1",
    feedId: "1",
    url: "https://example.com/post1",
    title: "最新のAI技術動向",
    description:
      "AIの最新技術動向についての記事です。機械学習の進化と今後の展望について解説します。",
    author: "山田太郎",
    status: "Summarized",
    postedAt: "2025-05-10T10:00:00Z",
    lastFetchedAt: "2025-05-10T12:00:00Z",
  },
  {
    postId: "2",
    feedId: "1",
    url: "https://example.com/post2",
    title: "Webフロントエンドの最新トレンド",
    description:
      "Webフロントエンド開発の最新トレンドについて解説します。ReactやVueの最新機能や、新しいフレームワークの動向を紹介します。",
    author: "佐藤次郎",
    status: "Fetched",
    postedAt: "2025-05-09T15:00:00Z",
    lastFetchedAt: "2025-05-10T12:00:00Z",
  },
  {
    postId: "3",
    feedId: "2",
    url: "https://example.com/post3",
    title: "Goによる高速なバックエンド開発",
    description:
      "Goを使った高速なバックエンド開発の方法について解説します。Goの特徴や、効率的な開発手法を紹介します。",
    author: "鈴木三郎",
    status: "Summarized",
    postedAt: "2025-05-08T09:00:00Z",
    lastFetchedAt: "2025-05-10T12:00:00Z",
  },
  {
    postId: "4",
    feedId: "3",
    url: "https://example.com/post4",
    title: "UIデザインの基本原則",
    description:
      "UIデザインの基本原則について解説します。ユーザビリティを向上させるためのデザイン手法や、効果的なカラーパレットの選び方を紹介します。",
    author: "田中四郎",
    status: "Fetched",
    postedAt: "2025-05-07T14:00:00Z",
    lastFetchedAt: "2025-05-10T12:00:00Z",
  },
  {
    postId: "5",
    feedId: "3",
    url: "https://example.com/post5",
    title: "レスポンシブデザインの実践テクニック",
    description:
      "レスポンシブデザインの実践テクニックについて解説します。様々なデバイスに対応するためのデザイン手法や、効率的な実装方法を紹介します。",
    author: "高橋五郎",
    status: "Summarized",
    postedAt: "2025-05-06T11:00:00Z",
    lastFetchedAt: "2025-05-10T12:00:00Z",
  },
];

// 日付をフォーマットする関数
const formatDate = (dateString: string) => {
  return dayjs(dateString).format("YYYY年MM月DD日 HH:mm");
};

// フィードアイテムコンポーネント
const FeedItem = ({
  feed,
  isSelected,
  onSelect,
}: {
  feed: (typeof mockFeeds)[0];
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
const PostItem = ({ post }: { post: (typeof mockPosts)[0] }) => {
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

  // 選択されたフィードに基づいて記事をフィルタリング
  const filteredPosts = selectedFeedId
    ? mockPosts.filter((post) => post.feedId === selectedFeedId)
    : mockPosts;

  // 新しいフィードを追加する処理（モック）
  const handleAddFeed = () => {
    if (newFeedUrl.trim()) {
      console.log(`新しいフィードを追加: ${newFeedUrl}`);
      setNewFeedUrl("");
      // 実際にはここでGraphQLミューテーションを呼び出す
    }
  };

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
              {mockFeeds.map((feed) => (
                <FeedItem
                  key={feed.feedId}
                  feed={feed}
                  isSelected={selectedFeedId === feed.feedId}
                  onSelect={() => setSelectedFeedId(feed.feedId)}
                />
              ))}
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
                />
                <Button onClick={handleAddFeed}>追加</Button>
              </Flex>
            </Box>
          </Box>
        </Stack>
      </GridItem>

      {/* メインコンテンツ */}
      <GridItem area="main" p={6} overflowY="auto">
        <Heading size="lg" mb={4}>
          {selectedFeedId
            ? mockFeeds.find((feed) => feed.feedId === selectedFeedId)?.title ||
              "記事一覧"
            : "すべての記事"}
        </Heading>
        <Text mb={4} color="gray.500">
          {filteredPosts.length}件の記事
        </Text>
        {filteredPosts.map((post) => (
          <PostItem key={post.postId} post={post} />
        ))}
      </GridItem>
    </Grid>
  );
}
