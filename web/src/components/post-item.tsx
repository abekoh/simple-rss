import { Box, Heading, Text } from "@chakra-ui/react";
import { Post } from "../generated/graphql";
import dayjs from "dayjs";

// 日付をフォーマットする関数
export const formatDate = (dateString: any | null | undefined) => {
  if (!dateString) return "";
  return dayjs(dateString).format("YYYY年MM月DD日 HH:mm");
};

// 記事アイテムコンポーネント
export const PostItem = ({ post }: { post: Post }) => {
  return (
    <Box mb={4} p={4} borderWidth="1px" borderRadius="md">
      <Box pb={0}>
        <Heading size="md">{post.title}</Heading>
      </Box>
      <Box py={2}>
        <Text>{post.description}</Text>
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
        <Box
          as="button"
          px={3}
          py={1}
          borderWidth="1px"
          borderRadius="md"
          fontSize="sm"
        >
          詳細を見る
        </Box>
      </Box>
    </Box>
  );
};
