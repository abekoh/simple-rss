import { createFileRoute } from "@tanstack/react-router";
import { useGetPostsQuery, PostsInputOrder } from "../../generated/graphql";
import { PostList } from "../../components/post-list";

export const Route = createFileRoute("/feeds/$feedId")({
  component: FeedDetail,
});

function FeedDetail() {
  const { feedId } = Route.useParams();

  // フィードの記事一覧を取得
  const {
    loading: postsLoading,
    error: postsError,
    data: postsData,
  } = useGetPostsQuery({
    variables: {
      input: {
        feedIds: [feedId],
        limit: 20,
        offset: 0,
        order: PostsInputOrder.PostedAtDesc,
      },
    },
  });

  const posts = postsData?.posts?.posts || [];
  const totalCount = postsData?.posts?.totalCount || 0;

  // 最初の記事からフィード情報を取得
  const feedTitle = posts.length > 0 ? posts[0].feed.title : "フィード";

  return (
    <PostList
      title={feedTitle}
      posts={posts}
      totalCount={totalCount}
      loading={postsLoading}
      error={postsError}
    />
  );
}
