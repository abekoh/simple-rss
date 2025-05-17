import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { PostList } from "../../components/post-list";
import { toaster } from "../../components/ui/toaster";
import {
  useGetPostsQuery,
  PostsInputOrder,
  useDeleteFeedMutation,
} from "../../generated/graphql";

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
  const navigate = useNavigate();

  // フィード削除ミューテーション
  const [deleteFeed, { loading: deleteLoading }] = useDeleteFeedMutation({
    onCompleted: () => {
      toaster.create({
        title: "フィードを削除しました",
        type: "success",
      });
      // ホームページにリダイレクト
      navigate({ to: "/", search: { page: 1 } });
    },
    onError: (error) => {
      toaster.create({
        title: "フィードの削除に失敗しました",
        description: error.message,
        type: "error",
      });
    },
  });

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

  // フィード削除ハンドラー
  const handleDeleteFeed = () => {
    deleteFeed({
      variables: {
        input: {
          feedId,
        },
      },
      update: (cache) => {
        const cacheId = cache.identify({
          __typename: "Feed",
          feedId,
        });
        cache.evict({ id: cacheId });
      },
    });
  };

  return (
    <PostList
      title={feedTitle}
      posts={posts}
      totalCount={totalCount}
      loading={postsLoading || deleteLoading}
      error={postsError}
      baseUrl={`/feeds/${feedId}`}
      currentPage={page}
      itemsPerPage={itemsPerPage}
      showDeleteButton={true}
      onDeleteClick={handleDeleteFeed}
    />
  );
}
