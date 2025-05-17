import {
  Box,
  Heading,
  Text,
  Code,
  Link,
  List,
  Tag,
  IconButton,
} from "@chakra-ui/react";
import {
  GetPostsQuery,
  useAddPostFavoriteMutation,
  useRemovePostFavoriteMutation,
} from "../generated/graphql";
import dayjs from "dayjs";
import ReactMarkdown from "react-markdown";
import { MdOutlineStar, MdOutlineStarBorder } from "react-icons/md";

import { toaster } from "../components/ui/toaster";

// 日付をフォーマットする関数
export const formatDate = (dateString: any | null | undefined) => {
  if (!dateString) return "";
  return dayjs(dateString).tz().format("YYYY-MM-DD HH:mm");
};

// 記事アイテムコンポーネント
export const PostItem = ({
  post,
}: {
  post: GetPostsQuery["posts"]["posts"][0];
}) => {
  return (
    <Box mb={4} p={4} borderWidth="1px" borderRadius="md">
      <Box pb={0}>
        <Link
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          _hover={{ textDecoration: "none" }}
        >
          <Heading size="lg">{post.title}</Heading>
        </Link>
      </Box>
      <Box py={2}>
        {post.summary?.summary ? (
          <>
            <ReactMarkdown
              components={{
                h1: (props) => <Heading as="h1" size="sm" my={3} {...props} />,
                h2: (props) => <Heading as="h2" size="sm" my={3} {...props} />,
                h3: (props) => (
                  <Heading
                    as="h3"
                    size="xs"
                    my={2}
                    fontWeight="semibold"
                    {...props}
                  />
                ),
                h4: (props) => (
                  <Heading
                    as="h4"
                    size="xs"
                    my={2}
                    fontWeight="medium"
                    {...props}
                  />
                ),
                h5: (props) => (
                  <Heading
                    as="h5"
                    size="xs"
                    my={1}
                    fontWeight="normal"
                    {...props}
                  />
                ),
                h6: (props) => (
                  <Heading
                    as="h6"
                    size="xs"
                    my={1}
                    fontWeight="normal"
                    fontStyle="italic"
                    {...props}
                  />
                ),
                p: (props) => <Text my={2} {...props} />,
                ul: (props) => <List.Root my={2} pl={4} {...props} />,
                ol: (props) => <List.Root as="ol" my={2} pl={4} {...props} />,
                li: (props) => <List.Item {...props} />,
                code: (props) => <Code p={2} {...props} />,
                a: (props) => (
                  <Link
                    color="blue.500"
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                  />
                ),
              }}
            >
              {post.summary.summary}
            </ReactMarkdown>
            <Tag.Root>
              <Tag.Label>{post.summary.summarizeMethod}</Tag.Label>
            </Tag.Root>
          </>
        ) : post.description ? (
          <Text>{post.description}</Text>
        ) : null}
      </Box>
      <Box
        pt={0}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Text fontSize="sm" color="gray.500">
          {post.author && `${post.author} - `}
          {formatDate(post.postedAt)}
        </Text>
        <FavoriteButton post={post} />
      </Box>
    </Box>
  );
};

// お気に入りボタンコンポーネント
const FavoriteButton = ({
  post,
}: {
  post: GetPostsQuery["posts"]["posts"][0];
}) => {
  const [addPostFavorite, { loading: addLoading }] = useAddPostFavoriteMutation(
    {
      onCompleted: () => {
        toaster.create({
          title: "お気に入りに追加しました",
          type: "success",
        });
      },
      onError: (error) => {
        toaster.create({
          title: "エラーが発生しました",
          description: error.message,
          type: "error",
        });
      },
      update: (cache, { data }) => {
        if (!data) return;

        // キャッシュからデータを取得
        const cacheId = cache.identify({
          __typename: "Post",
          postId: post.postId,
        });

        // キャッシュを更新
        cache.modify({
          id: cacheId,
          fields: {
            favorite: () => ({
              __typename: "PostFavorite",
              postFavoriteId: data.addPostFavorite.postFavoriteId,
              postId: data.addPostFavorite.postId,
              addedAt: new Date().toISOString(),
            }),
          },
        });
      },
    }
  );

  const handleAddFavorite = async () => {
    if (post.favorite) return;

    await addPostFavorite({
      variables: {
        input: {
          postId: post.postId,
        },
      },
    });
  };

  const [removePostFavorite, { loading: removeLoading }] =
    useRemovePostFavoriteMutation({
      onCompleted: () => {
        toaster.create({
          title: "お気に入りから削除しました",
          type: "success",
        });
      },
      onError: (error) => {
        toaster.create({
          title: "エラーが発生しました",
          description: error.message,
          type: "error",
        });
      },
      update: (cache, { data }) => {
        if (!data) return;

        // キャッシュからデータを取得
        const cacheId = cache.identify({
          __typename: "Post",
          postId: post.postId,
        });

        // キャッシュを更新
        cache.modify({
          id: cacheId,
          fields: {
            favorite: () => null,
          },
        });
      },
    });

  const handleRemoveFavorite = async () => {
    if (!post.favorite) return;

    await removePostFavorite({
      variables: {
        input: {
          postFavoriteId: post.favorite.postFavoriteId,
        },
      },
    });
  };

  // すでにお気に入り済みの場合は黄色で表示し、クリックで削除
  if (post.favorite) {
    return (
      <IconButton
        aria-label="お気に入りから削除"
        size="lg"
        onClick={handleRemoveFavorite}
        loading={removeLoading}
        variant="ghost"
      >
        <MdOutlineStar />
      </IconButton>
    );
  }

  return (
    <IconButton
      aria-label="お気に入りに追加"
      size="lg"
      onClick={handleAddFavorite}
      loading={addLoading}
      variant="ghost"
    >
      <MdOutlineStarBorder />
    </IconButton>
  );
};
