import {
  Box,
  Heading,
  Text,
  Spinner,
  Center,
  Button,
  HStack,
  Flex,
  IconButton,
  Dialog,
  Portal,
  Stack,
  Input,
  Field,
} from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { LuTrash, LuPencil } from "react-icons/lu";

import { PostItem } from "./post-item";
import { GetPostsQuery } from "../generated/graphql";

type PostListProps = {
  title: string;
  posts: GetPostsQuery["posts"]["posts"];
  totalCount: number;
  loading: boolean;
  error?: Error | null;
  baseUrl: string;
  currentPage: number;
  itemsPerPage?: number;
  showDeleteButton?: boolean;
  showEditButton?: boolean;
  feedUrl?: string;
  onDeleteClick?: () => void;
  onEditClick?: (newTitle: string) => void;
};

export const PostList = ({
  title,
  feedUrl,
  posts,
  totalCount,
  loading,
  error,
  baseUrl,
  currentPage,
  itemsPerPage = 10,
  showDeleteButton = false,
  showEditButton = false,
  onDeleteClick,
  onEditClick,
}: PostListProps) => {
  const [editTitle, setEditTitle] = useState(title);
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  return (
    <Box>
      <Stack gap={0}>
        <Flex alignItems="center">
          <Heading size="md">{title}</Heading>
          {showEditButton && (
            <Dialog.Root lazyMount>
              <Dialog.Trigger asChild>
                <IconButton
                  aria-label="フィードタイトルを変更"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditTitle(typeof title === "string" ? title : "");
                  }}
                >
                  <LuPencil />
                </IconButton>
              </Dialog.Trigger>
              <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                  <Dialog.Content>
                    <Dialog.Header>
                      <Dialog.Title>フィードタイトルの変更</Dialog.Title>
                      <Dialog.CloseTrigger />
                    </Dialog.Header>
                    <Dialog.Body>
                      <Field.Root>
                        <Field.Label>新しいタイトル</Field.Label>
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="新しいタイトルを入力"
                        />
                      </Field.Root>
                    </Dialog.Body>
                    <Dialog.Footer>
                      <Dialog.ActionTrigger asChild>
                        <Button variant="outline">キャンセル</Button>
                      </Dialog.ActionTrigger>
                      <Dialog.ActionTrigger asChild>
                        <Button
                          colorScheme="blue"
                          onClick={() => onEditClick?.(editTitle)}
                        >
                          変更
                        </Button>
                      </Dialog.ActionTrigger>
                    </Dialog.Footer>
                  </Dialog.Content>
                </Dialog.Positioner>
              </Portal>
            </Dialog.Root>
          )}
          {showDeleteButton && (
            <Dialog.Root lazyMount>
              <Dialog.Trigger asChild>
                <IconButton
                  aria-label="フィードを削除"
                  colorScheme="red"
                  variant="ghost"
                  size="sm"
                >
                  <LuTrash />
                </IconButton>
              </Dialog.Trigger>
              <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                  <Dialog.Content>
                    <Dialog.Header>
                      <Dialog.Title>フィードを削除</Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body>
                      このフィードを削除してもよろしいですか？この操作は取り消せません。
                    </Dialog.Body>
                    <Dialog.Footer>
                      <Dialog.ActionTrigger asChild>
                        <Button variant="outline">キャンセル</Button>
                      </Dialog.ActionTrigger>
                      <Button colorScheme="red" onClick={onDeleteClick}>
                        削除
                      </Button>
                    </Dialog.Footer>
                  </Dialog.Content>
                </Dialog.Positioner>
              </Portal>
            </Dialog.Root>
          )}
        </Flex>
        {feedUrl && (
          <Text color="gray.500" fontSize="xs">
            <Link to={feedUrl} target="_blank" rel="noopener noreferrer">
              {feedUrl}
            </Link>
          </Text>
        )}
      </Stack>

      <Text my={4} color="gray.500">
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
        <>
          <Stack gap={4}>
            {posts.map((post) => (
              <PostItem key={post.postId} post={post} />
            ))}
          </Stack>

          {totalPages > 1 && (
            <Box mt={8} mb={4}>
              <HStack gap={2} justifyContent="center">
                {/* 前のページへのリンク */}
                {currentPage > 1 ? (
                  <Link
                    to={baseUrl}
                    search={{
                      page: currentPage - 1,
                    }}
                  >
                    <Button size="sm" variant="outline">
                      前へ
                    </Button>
                  </Link>
                ) : (
                  <Button size="sm" variant="outline" disabled>
                    前へ
                  </Button>
                )}

                {/* ページ番号 */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // 表示するページ番号を計算
                  let pageNum;
                  if (totalPages <= 5) {
                    // 5ページ以下なら全て表示
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    // 現在のページが前半にある場合
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    // 現在のページが後半にある場合
                    pageNum = totalPages - 4 + i;
                  } else {
                    // 現在のページが中央にある場合
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Link
                      key={pageNum}
                      to={baseUrl}
                      search={{
                        page: pageNum,
                      }}
                    >
                      <Button
                        size="sm"
                        colorScheme={pageNum === currentPage ? "blue" : "gray"}
                        variant={pageNum === currentPage ? "solid" : "outline"}
                      >
                        {pageNum}
                      </Button>
                    </Link>
                  );
                })}

                {/* 次のページへのリンク */}
                {currentPage < totalPages ? (
                  <Link
                    to={baseUrl}
                    search={{
                      page: currentPage + 1,
                    }}
                  >
                    <Button size="sm" variant="outline">
                      次へ
                    </Button>
                  </Link>
                ) : (
                  <Button size="sm" variant="outline" disabled>
                    次へ
                  </Button>
                )}
              </HStack>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};
