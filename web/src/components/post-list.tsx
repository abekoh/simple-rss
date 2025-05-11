import { Box, Heading, Text, Spinner, Center } from "@chakra-ui/react";
import { PostItem } from "./post-item";
import { Post } from "../generated/graphql";

interface PostListProps {
  title: string;
  posts: Post[];
  totalCount: number;
  loading: boolean;
  error?: Error | null;
}

export const PostList = ({
  title,
  posts,
  totalCount,
  loading,
  error,
}: PostListProps) => {
  return (
    <Box>
      <Heading size="lg" mb={4}>
        {title}
      </Heading>
      <Text mb={4} color="gray.500">
        {totalCount}件の記事
      </Text>

      {loading ? (
        <Center py={10}>
          <Spinner size="lg" />
        </Center>
      ) : error ? (
        <Text color="red.500">
          記事の取得中にエラーが発生しました: {error.message}
        </Text>
      ) : posts.length === 0 ? (
        <Text>記事がありません</Text>
      ) : (
        posts.map((post) => <PostItem key={post.postId} post={post} />)
      )}
    </Box>
  );
};
