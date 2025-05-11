import { Box, Heading, Text, Code, Link, List } from "@chakra-ui/react";
import { Post } from "../generated/graphql";
import dayjs from "dayjs";
import ReactMarkdown from "react-markdown";

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
        <Heading size="lg">{post.title}</Heading>
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
            <Text fontSize="xs" color="gray.500" mt={1}>
              要約方法: {post.summary.summarizeMethod}
            </Text>
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
