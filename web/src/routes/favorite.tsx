import { createFileRoute } from "@tanstack/react-router";
import { useGetPostsQuery, PostsInputOrder } from "../generated/graphql";
import { PostList } from "../components/post-list";

// 検索パラメータの型定義
interface FavoriteSearch {
  page: number;
}

export const Route = createFileRoute("/favorite")({
  validateSearch: (search: Record<string, unknown>): FavoriteSearch => {
    return {
      page: Number(search?.page || 1),
    };
  },
  component: Favorite,
});

function Favorite() {
  // 検索パラメータを取得
  const { page } = Route.useSearch();
  const itemsPerPage = 10;

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
      title="お気に入り"
      posts={posts}
      totalCount={totalCount}
      loading={postsLoading}
      error={postsError}
      baseUrl="/favorite"
      currentPage={page}
      itemsPerPage={itemsPerPage}
    />
  );
}
