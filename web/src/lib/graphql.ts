import { gql } from "@apollo/client";

// フィード一覧を取得するクエリ
export const GET_FEEDS = gql`
  query GetFeeds {
    feeds {
      feedId
      url
      title
      description
      registeredAt
      lastFetchedAt
    }
  }
`;

// 記事一覧を取得するクエリ
export const GET_POSTS = gql`
  query GetPosts($input: PostsInput!) {
    posts(input: $input) {
      totalCount
      posts {
        postId
        feedId
        url
        title
        description
        author
        status
        postedAt
        lastFetchedAt
        feed {
          feedId
          title
          url
          registeredAt
        }
      }
    }
  }
`;

// フィードを登録するミューテーション
export const REGISTER_FEED = gql`
  mutation RegisterFeed($input: RegisterFeedInput!) {
    registerFeed(input: $input) {
      feedId
    }
  }
`;

// フィードを削除するミューテーション
export const DELETE_FEED = gql`
  mutation DeleteFeed($input: DeleteFeedInput!) {
    deleteFeed(input: $input) {
      feedId
    }
  }
`;
