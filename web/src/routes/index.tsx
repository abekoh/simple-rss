import { createFileRoute } from "@tanstack/react-router";
import { useGetPostsQuery, PostsInputOrder } from "../generated/graphql";
import { PostList } from "../components/post-list";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  // 記事一覧を取得
  const {
    loading: postsLoading,
    error: postsError,
    data: postsData,
  } = useGetPostsQuery({
    variables: {
      input: {
        feedIds: [],
        limit: 20,
        offset: 0,
        order: PostsInputOrder.PostedAtDesc,
      },
    },
  });

  const posts = postsData?.posts?.posts || [];
  const totalCount = postsData?.posts?.totalCount || 0;

  return (
    <PostList
      title="すべての記事"
      posts={posts}
      totalCount={totalCount}
      loading={postsLoading}
      error={postsError}
    />
  );
}
