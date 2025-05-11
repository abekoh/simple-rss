import { createFileRoute } from "@tanstack/react-router";
import { useGetPostsQuery, PostsInputOrder } from "../generated/graphql";
import { PostList } from "../components/post-list";

// 検索パラメータの型定義
interface IndexSearch {
  page: number;
}

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): IndexSearch => {
    return {
      page: Number(search?.page || 1),
    };
  },
  component: Index,
});

function Index() {
  // 検索パラメータを取得
  const { page } = Route.useSearch();
  const itemsPerPage = 10;

  // 記事一覧を取得
  const {
    loading: postsLoading,
    error: postsError,
    data: postsData,
  } = useGetPostsQuery({
    variables: {
      input: {
        feedIds: [],
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
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
      baseUrl="/"
      currentPage={page}
      itemsPerPage={itemsPerPage}
    />
  );
}
