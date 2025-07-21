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
  Tag,
} from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { LuTrash, LuPencil, LuTags } from "react-icons/lu";

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
  showTagEditButton?: boolean;
  feedUrl?: string;
  feedTags?: Array<{ name: string; special: boolean }>;
  onDeleteClick?: () => void;
  onEditClick?: (newTitle: string) => void;
  onTagsEdit?: (newTags: string[]) => void;
};

export const PostList = ({
  title,
  feedUrl,
  feedTags,
  posts,
  totalCount,
  loading,
  error,
  baseUrl,
  currentPage,
  itemsPerPage = 10,
  showDeleteButton = false,
  showEditButton = false,
  showTagEditButton = false,
  onDeleteClick,
  onEditClick,
  onTagsEdit,
}: PostListProps) => {
  const [editTitle, setEditTitle] = useState(title);
  const [editTags, setEditTags] = useState(feedTags?.map(tag => tag.name).join(", ") || "");
  const [tagValidationError, setTagValidationError] = useState<string>("");

  // タグバリデーション関数
  const validateTags = (tagsString: string) => {
    const tags = tagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    // 重複を除去
    const uniqueTags = Array.from(new Set(tags));

    for (const tag of uniqueTags) {
      if (tag.length > 20) {
        return {
          isValid: false,
          error: `タグ '${tag}' は20文字以下にしてください`,
          tags: [],
        };
      }
      if (!/^[a-zA-Z0-9-]+$/.test(tag)) {
        return {
          isValid: false,
          error: `タグ '${tag}' は英数字とハイフンのみ使用できます`,
          tags: [],
        };
      }
    }

    return { isValid: true, error: "", tags: uniqueTags };
  };

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
        {((feedTags && feedTags.length > 0) || showTagEditButton) && (
          <HStack gap={1} alignItems="center" flexWrap="wrap" mt={1}>
            {feedTags && feedTags.length > 0 && (
              <>
                {feedTags.map((tag, index) => (
                  <Tag.Root
                    key={index}
                    size="sm"
                    colorScheme="blue"
                    variant="subtle"
                  >
                    <Tag.Label fontStyle={tag.special ? "italic" : "normal"}>{tag.name}</Tag.Label>
                  </Tag.Root>
                ))}
              </>
            )}
            {showTagEditButton && (
              <Dialog.Root lazyMount>
                <Dialog.Trigger asChild>
                  <IconButton
                    aria-label="タグを編集"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditTags(feedTags?.map(tag => tag.name).join(", ") || "");
                    }}
                  >
                    <LuTags />
                  </IconButton>
                </Dialog.Trigger>
                <Portal>
                  <Dialog.Backdrop />
                  <Dialog.Positioner>
                    <Dialog.Content>
                      <Dialog.Header>
                        <Dialog.Title>タグの編集</Dialog.Title>
                        <Dialog.CloseTrigger />
                      </Dialog.Header>
                      <Dialog.Body>
                        <Field.Root invalid={!!tagValidationError}>
                          <Field.Label>タグ (カンマ区切り)</Field.Label>
                          <Input
                            value={editTags}
                            onChange={(e) => {
                              setEditTags(e.target.value);
                              setTagValidationError("");
                            }}
                            placeholder=""
                          />
                          <Field.HelperText>
                            英数字とハイフンのみ、各タグ最大20文字
                          </Field.HelperText>
                          {tagValidationError && (
                            <Field.ErrorText>
                              {tagValidationError}
                            </Field.ErrorText>
                          )}
                        </Field.Root>
                      </Dialog.Body>
                      <Dialog.Footer>
                        <Dialog.ActionTrigger asChild>
                          <Button variant="outline">キャンセル</Button>
                        </Dialog.ActionTrigger>
                        <Dialog.ActionTrigger asChild>
                          <Button
                            colorScheme="blue"
                            onClick={() => {
                              const validation = validateTags(editTags);
                              if (!validation.isValid) {
                                setTagValidationError(validation.error);
                                return;
                              }
                              onTagsEdit?.(validation.tags);
                              setTagValidationError("");
                            }}
                          >
                            更新
                          </Button>
                        </Dialog.ActionTrigger>
                      </Dialog.Footer>
                    </Dialog.Content>
                  </Dialog.Positioner>
                </Portal>
              </Dialog.Root>
            )}
          </HStack>
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
