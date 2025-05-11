import { createFileRoute } from "@tanstack/react-router";
import { useGetPostsQuery, PostsInputOrder } from "../generated/graphql";
import { PostList } from "../components/post-list";

export const Route = createFileRoute("/favorite")({
  component: Favorite,
});

function Favorite() {
  // お気に入り記事一覧を取得
  // TODO: お気に入り機能が実装されたら、お気に入りのみを取得するように修正する
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
      title="お気に入り"
      posts={posts}
      totalCount={totalCount}
      loading={postsLoading}
      error={postsError}
    />
  );
}
