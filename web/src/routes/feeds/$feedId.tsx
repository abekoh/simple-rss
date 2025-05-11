import { createFileRoute } from "@tanstack/react-router";
import { useGetPostsQuery, PostsInputOrder } from "../../generated/graphql";
import { PostList } from "../../components/post-list";

// 検索パラメータの型定義
interface FeedDetailSearch {
  page: number;
}

export const Route = createFileRoute("/feeds/$feedId")({
  validateSearch: (search: Record<string, unknown>): FeedDetailSearch => {
    return {
      page: Number(search?.page || 1),
    };
  },
  component: FeedDetail,
});

function FeedDetail() {
  const { feedId } = Route.useParams();
  // 検索パラメータを取得
  const { page } = Route.useSearch();
  const itemsPerPage = 10;

  // フィードの記事一覧を取得
  const {
    loading: postsLoading,
    error: postsError,
    data: postsData,
  } = useGetPostsQuery({
    variables: {
      input: {
        feedIds: [feedId],
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
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
      baseUrl={`/feeds/${feedId}`}
      currentPage={page}
      itemsPerPage={itemsPerPage}
    />
  );
}
