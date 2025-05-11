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
        summary {
          summary
          summarizeMethod
          summarizedAt
        }
        feed {
          feedId
          title
          url
          registeredAt
        }
        favorite {
          postFavoriteId
          addedAt
        }
      }
    }
  }
`;

// フィードを登録するミューテーション
export const REGISTER_FEED = gql`
  mutation RegisterFeed($input: RegisterFeedInput!) {
    registerFeed(input: $input) {
      feedIds
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

// 記事をお気に入りに追加するミューテーション
export const ADD_POST_FAVORITE = gql`
  mutation AddPostFavorite($input: AddPostFavoriteInput!) {
    addPostFavorite(input: $input) {
      postId
      postFavoriteId
    }
  }
`;

// 記事をお気に入りから削除するミューテーション
export const REMOVE_POST_FAVORITE = gql`
  mutation RemovePostFavorite($input: RemovePostFavoriteInput!) {
    removePostFavorite(input: $input) {
      postFavoriteId
    }
  }
`;
