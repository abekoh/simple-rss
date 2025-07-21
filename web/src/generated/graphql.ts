import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  Time: { input: any; output: any };
};

export type AddPostFavoriteInput = {
  postId: Scalars["ID"]["input"];
};

export type AddPostFavoritePayload = {
  __typename?: "AddPostFavoritePayload";
  postFavoriteId: Scalars["ID"]["output"];
  postId: Scalars["ID"]["output"];
};

export type DeleteFeedInput = {
  feedId: Scalars["ID"]["input"];
};

export type DeleteFeedPayload = {
  __typename?: "DeleteFeedPayload";
  feedId: Scalars["ID"]["output"];
};

export type Feed = {
  __typename?: "Feed";
  description?: Maybe<Scalars["String"]["output"]>;
  feedId: Scalars["ID"]["output"];
  idx: Scalars["Int"]["output"];
  lastFetchedAt?: Maybe<Scalars["Time"]["output"]>;
  registeredAt: Scalars["Time"]["output"];
  tags: Array<Scalars["String"]["output"]>;
  title: Scalars["String"]["output"];
  url: Scalars["String"]["output"];
};

export type FeedFetch = {
  __typename?: "FeedFetch";
  feedFetchId: Scalars["ID"]["output"];
  feedId: Scalars["ID"]["output"];
  fetchedAt: Scalars["Time"]["output"];
  message?: Maybe<Scalars["String"]["output"]>;
  status: FeedFetchStatus;
};

export enum FeedFetchStatus {
  Failure = "Failure",
  Success = "Success",
}

export type FeedPostsInput = {
  limit?: Scalars["Int"]["input"];
  offset?: Scalars["Int"]["input"];
  order?: PostsInputOrder;
};

export type Mutation = {
  __typename?: "Mutation";
  addPostFavorite: AddPostFavoritePayload;
  deleteFeed: DeleteFeedPayload;
  rearrangeFeed: RearrangeFeedPayload;
  registerFeed: RegisterFeedPayload;
  removePostFavorite: RemovePostFavoritePayload;
  renameFeedTitle: RenameFeedTitlePayload;
  replaceFeedTags: ReplaceFeedTagsPayload;
};

export type MutationAddPostFavoriteArgs = {
  input: AddPostFavoriteInput;
};

export type MutationDeleteFeedArgs = {
  input: DeleteFeedInput;
};

export type MutationRearrangeFeedArgs = {
  input: RearrangeFeedInput;
};

export type MutationRegisterFeedArgs = {
  input: RegisterFeedInput;
};

export type MutationRemovePostFavoriteArgs = {
  input: RemovePostFavoriteInput;
};

export type MutationRenameFeedTitleArgs = {
  input: RenameFeedTitleInput;
};

export type MutationReplaceFeedTagsArgs = {
  input: ReplaceFeedTagsInput;
};

export type Post = {
  __typename?: "Post";
  author?: Maybe<Scalars["String"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  favorite?: Maybe<PostFavorite>;
  feed: Feed;
  feedId: Scalars["ID"]["output"];
  lastFetchedAt?: Maybe<Scalars["Time"]["output"]>;
  postId: Scalars["ID"]["output"];
  postedAt?: Maybe<Scalars["Time"]["output"]>;
  status: PostStatus;
  summary?: Maybe<PostSummary>;
  title: Scalars["String"]["output"];
  url: Scalars["String"]["output"];
};

export type PostFavorite = {
  __typename?: "PostFavorite";
  addedAt: Scalars["Time"]["output"];
  postFavoriteId: Scalars["ID"]["output"];
  postId: Scalars["ID"]["output"];
};

export type PostFetch = {
  __typename?: "PostFetch";
  fetchedAt: Scalars["Time"]["output"];
  message?: Maybe<Scalars["String"]["output"]>;
  postFetchId: Scalars["ID"]["output"];
  postId: Scalars["ID"]["output"];
  status: PostFetchStatus;
};

export enum PostFetchStatus {
  Failure = "Failure",
  Success = "Success",
}

export enum PostStatus {
  Fetched = "Fetched",
  Registered = "Registered",
  Summarized = "Summarized",
}

export type PostSummary = {
  __typename?: "PostSummary";
  postId: Scalars["ID"]["output"];
  postSummaryId: Scalars["ID"]["output"];
  summarizeMethod: Scalars["String"]["output"];
  summarizedAt: Scalars["Time"]["output"];
  summary: Scalars["String"]["output"];
};

export type PostsInput = {
  feedIds?: Array<Scalars["ID"]["input"]>;
  limit?: Scalars["Int"]["input"];
  offset?: Scalars["Int"]["input"];
  onlyHaveFavorites?: Scalars["Boolean"]["input"];
  order?: PostsInputOrder;
};

export enum PostsInputOrder {
  PostedAtAsc = "PostedAtAsc",
  PostedAtDesc = "PostedAtDesc",
}

export type PostsPayload = {
  __typename?: "PostsPayload";
  posts: Array<Post>;
  totalCount: Scalars["Int"]["output"];
};

export type Query = {
  __typename?: "Query";
  feeds: Array<Feed>;
  posts: PostsPayload;
};

export type QueryPostsArgs = {
  input: PostsInput;
};

export type RearrangeFeedInput = {
  feedId: Scalars["ID"]["input"];
  newIndex: Scalars["Int"]["input"];
};

export type RearrangeFeedPayload = {
  __typename?: "RearrangeFeedPayload";
  feedId: Scalars["ID"]["output"];
};

export type RegisterFeedInput = {
  tags: Array<Scalars["String"]["input"]>;
  url: Scalars["String"]["input"];
};

export type RegisterFeedPayload = {
  __typename?: "RegisterFeedPayload";
  feedIds: Array<Scalars["ID"]["output"]>;
};

export type RemovePostFavoriteInput = {
  postFavoriteId: Scalars["ID"]["input"];
};

export type RemovePostFavoritePayload = {
  __typename?: "RemovePostFavoritePayload";
  postFavoriteId: Scalars["ID"]["output"];
};

export type RenameFeedTitleInput = {
  feedId: Scalars["ID"]["input"];
  newTitle: Scalars["String"]["input"];
};

export type RenameFeedTitlePayload = {
  __typename?: "RenameFeedTitlePayload";
  feedId: Scalars["ID"]["output"];
};

export type ReplaceFeedTagsInput = {
  feedId: Scalars["ID"]["input"];
  tags: Array<Scalars["String"]["input"]>;
};

export type ReplaceFeedTagsPayload = {
  __typename?: "ReplaceFeedTagsPayload";
  feedId: Scalars["ID"]["output"];
};

export type GetFeedsQueryVariables = Exact<{ [key: string]: never }>;

export type GetFeedsQuery = {
  __typename?: "Query";
  feeds: Array<{
    __typename?: "Feed";
    feedId: string;
    url: string;
    title: string;
    description?: string | null;
    registeredAt: any;
    lastFetchedAt?: any | null;
    tags: Array<string>;
  }>;
};

export type GetPostsQueryVariables = Exact<{
  input: PostsInput;
}>;

export type GetPostsQuery = {
  __typename?: "Query";
  posts: {
    __typename?: "PostsPayload";
    totalCount: number;
    posts: Array<{
      __typename?: "Post";
      postId: string;
      feedId: string;
      url: string;
      title: string;
      description?: string | null;
      author?: string | null;
      status: PostStatus;
      postedAt?: any | null;
      lastFetchedAt?: any | null;
      summary?: {
        __typename?: "PostSummary";
        summary: string;
        summarizeMethod: string;
        summarizedAt: any;
      } | null;
      feed: {
        __typename?: "Feed";
        feedId: string;
        title: string;
        url: string;
        registeredAt: any;
        tags: Array<string>;
      };
      favorite?: {
        __typename?: "PostFavorite";
        postFavoriteId: string;
        addedAt: any;
      } | null;
    }>;
  };
};

export type RegisterFeedMutationVariables = Exact<{
  input: RegisterFeedInput;
}>;

export type RegisterFeedMutation = {
  __typename?: "Mutation";
  registerFeed: { __typename?: "RegisterFeedPayload"; feedIds: Array<string> };
};

export type DeleteFeedMutationVariables = Exact<{
  input: DeleteFeedInput;
}>;

export type DeleteFeedMutation = {
  __typename?: "Mutation";
  deleteFeed: { __typename?: "DeleteFeedPayload"; feedId: string };
};

export type AddPostFavoriteMutationVariables = Exact<{
  input: AddPostFavoriteInput;
}>;

export type AddPostFavoriteMutation = {
  __typename?: "Mutation";
  addPostFavorite: {
    __typename?: "AddPostFavoritePayload";
    postId: string;
    postFavoriteId: string;
  };
};

export type RemovePostFavoriteMutationVariables = Exact<{
  input: RemovePostFavoriteInput;
}>;

export type RemovePostFavoriteMutation = {
  __typename?: "Mutation";
  removePostFavorite: {
    __typename?: "RemovePostFavoritePayload";
    postFavoriteId: string;
  };
};

export type RenameFeedTitleMutationVariables = Exact<{
  input: RenameFeedTitleInput;
}>;

export type RenameFeedTitleMutation = {
  __typename?: "Mutation";
  renameFeedTitle: { __typename?: "RenameFeedTitlePayload"; feedId: string };
};

export type ReplaceFeedTagsMutationVariables = Exact<{
  input: ReplaceFeedTagsInput;
}>;

export type ReplaceFeedTagsMutation = {
  __typename?: "Mutation";
  replaceFeedTags: { __typename?: "ReplaceFeedTagsPayload"; feedId: string };
};

export const GetFeedsDocument = gql`
  query GetFeeds {
    feeds {
      feedId
      url
      title
      description
      registeredAt
      lastFetchedAt
      tags
    }
  }
`;

/**
 * __useGetFeedsQuery__
 *
 * To run a query within a React component, call `useGetFeedsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFeedsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFeedsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetFeedsQuery(
  baseOptions?: Apollo.QueryHookOptions<GetFeedsQuery, GetFeedsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetFeedsQuery, GetFeedsQueryVariables>(
    GetFeedsDocument,
    options
  );
}
export function useGetFeedsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetFeedsQuery,
    GetFeedsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetFeedsQuery, GetFeedsQueryVariables>(
    GetFeedsDocument,
    options
  );
}
export function useGetFeedsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetFeedsQuery, GetFeedsQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetFeedsQuery, GetFeedsQueryVariables>(
    GetFeedsDocument,
    options
  );
}
export type GetFeedsQueryHookResult = ReturnType<typeof useGetFeedsQuery>;
export type GetFeedsLazyQueryHookResult = ReturnType<
  typeof useGetFeedsLazyQuery
>;
export type GetFeedsSuspenseQueryHookResult = ReturnType<
  typeof useGetFeedsSuspenseQuery
>;
export type GetFeedsQueryResult = Apollo.QueryResult<
  GetFeedsQuery,
  GetFeedsQueryVariables
>;
export const GetPostsDocument = gql`
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
          tags
        }
        favorite {
          postFavoriteId
          addedAt
        }
      }
    }
  }
`;

/**
 * __useGetPostsQuery__
 *
 * To run a query within a React component, call `useGetPostsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPostsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPostsQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useGetPostsQuery(
  baseOptions: Apollo.QueryHookOptions<GetPostsQuery, GetPostsQueryVariables> &
    ({ variables: GetPostsQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetPostsQuery, GetPostsQueryVariables>(
    GetPostsDocument,
    options
  );
}
export function useGetPostsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetPostsQuery,
    GetPostsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetPostsQuery, GetPostsQueryVariables>(
    GetPostsDocument,
    options
  );
}
export function useGetPostsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetPostsQuery, GetPostsQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetPostsQuery, GetPostsQueryVariables>(
    GetPostsDocument,
    options
  );
}
export type GetPostsQueryHookResult = ReturnType<typeof useGetPostsQuery>;
export type GetPostsLazyQueryHookResult = ReturnType<
  typeof useGetPostsLazyQuery
>;
export type GetPostsSuspenseQueryHookResult = ReturnType<
  typeof useGetPostsSuspenseQuery
>;
export type GetPostsQueryResult = Apollo.QueryResult<
  GetPostsQuery,
  GetPostsQueryVariables
>;
export const RegisterFeedDocument = gql`
  mutation RegisterFeed($input: RegisterFeedInput!) {
    registerFeed(input: $input) {
      feedIds
    }
  }
`;
export type RegisterFeedMutationFn = Apollo.MutationFunction<
  RegisterFeedMutation,
  RegisterFeedMutationVariables
>;

/**
 * __useRegisterFeedMutation__
 *
 * To run a mutation, you first call `useRegisterFeedMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRegisterFeedMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [registerFeedMutation, { data, loading, error }] = useRegisterFeedMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRegisterFeedMutation(
  baseOptions?: Apollo.MutationHookOptions<
    RegisterFeedMutation,
    RegisterFeedMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    RegisterFeedMutation,
    RegisterFeedMutationVariables
  >(RegisterFeedDocument, options);
}
export type RegisterFeedMutationHookResult = ReturnType<
  typeof useRegisterFeedMutation
>;
export type RegisterFeedMutationResult =
  Apollo.MutationResult<RegisterFeedMutation>;
export type RegisterFeedMutationOptions = Apollo.BaseMutationOptions<
  RegisterFeedMutation,
  RegisterFeedMutationVariables
>;
export const DeleteFeedDocument = gql`
  mutation DeleteFeed($input: DeleteFeedInput!) {
    deleteFeed(input: $input) {
      feedId
    }
  }
`;
export type DeleteFeedMutationFn = Apollo.MutationFunction<
  DeleteFeedMutation,
  DeleteFeedMutationVariables
>;

/**
 * __useDeleteFeedMutation__
 *
 * To run a mutation, you first call `useDeleteFeedMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteFeedMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteFeedMutation, { data, loading, error }] = useDeleteFeedMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteFeedMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteFeedMutation,
    DeleteFeedMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<DeleteFeedMutation, DeleteFeedMutationVariables>(
    DeleteFeedDocument,
    options
  );
}
export type DeleteFeedMutationHookResult = ReturnType<
  typeof useDeleteFeedMutation
>;
export type DeleteFeedMutationResult =
  Apollo.MutationResult<DeleteFeedMutation>;
export type DeleteFeedMutationOptions = Apollo.BaseMutationOptions<
  DeleteFeedMutation,
  DeleteFeedMutationVariables
>;
export const AddPostFavoriteDocument = gql`
  mutation AddPostFavorite($input: AddPostFavoriteInput!) {
    addPostFavorite(input: $input) {
      postId
      postFavoriteId
    }
  }
`;
export type AddPostFavoriteMutationFn = Apollo.MutationFunction<
  AddPostFavoriteMutation,
  AddPostFavoriteMutationVariables
>;

/**
 * __useAddPostFavoriteMutation__
 *
 * To run a mutation, you first call `useAddPostFavoriteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddPostFavoriteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addPostFavoriteMutation, { data, loading, error }] = useAddPostFavoriteMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddPostFavoriteMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AddPostFavoriteMutation,
    AddPostFavoriteMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    AddPostFavoriteMutation,
    AddPostFavoriteMutationVariables
  >(AddPostFavoriteDocument, options);
}
export type AddPostFavoriteMutationHookResult = ReturnType<
  typeof useAddPostFavoriteMutation
>;
export type AddPostFavoriteMutationResult =
  Apollo.MutationResult<AddPostFavoriteMutation>;
export type AddPostFavoriteMutationOptions = Apollo.BaseMutationOptions<
  AddPostFavoriteMutation,
  AddPostFavoriteMutationVariables
>;
export const RemovePostFavoriteDocument = gql`
  mutation RemovePostFavorite($input: RemovePostFavoriteInput!) {
    removePostFavorite(input: $input) {
      postFavoriteId
    }
  }
`;
export type RemovePostFavoriteMutationFn = Apollo.MutationFunction<
  RemovePostFavoriteMutation,
  RemovePostFavoriteMutationVariables
>;

/**
 * __useRemovePostFavoriteMutation__
 *
 * To run a mutation, you first call `useRemovePostFavoriteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemovePostFavoriteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removePostFavoriteMutation, { data, loading, error }] = useRemovePostFavoriteMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRemovePostFavoriteMutation(
  baseOptions?: Apollo.MutationHookOptions<
    RemovePostFavoriteMutation,
    RemovePostFavoriteMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    RemovePostFavoriteMutation,
    RemovePostFavoriteMutationVariables
  >(RemovePostFavoriteDocument, options);
}
export type RemovePostFavoriteMutationHookResult = ReturnType<
  typeof useRemovePostFavoriteMutation
>;
export type RemovePostFavoriteMutationResult =
  Apollo.MutationResult<RemovePostFavoriteMutation>;
export type RemovePostFavoriteMutationOptions = Apollo.BaseMutationOptions<
  RemovePostFavoriteMutation,
  RemovePostFavoriteMutationVariables
>;
export const RenameFeedTitleDocument = gql`
  mutation RenameFeedTitle($input: RenameFeedTitleInput!) {
    renameFeedTitle(input: $input) {
      feedId
    }
  }
`;
export type RenameFeedTitleMutationFn = Apollo.MutationFunction<
  RenameFeedTitleMutation,
  RenameFeedTitleMutationVariables
>;

/**
 * __useRenameFeedTitleMutation__
 *
 * To run a mutation, you first call `useRenameFeedTitleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRenameFeedTitleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [renameFeedTitleMutation, { data, loading, error }] = useRenameFeedTitleMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRenameFeedTitleMutation(
  baseOptions?: Apollo.MutationHookOptions<
    RenameFeedTitleMutation,
    RenameFeedTitleMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    RenameFeedTitleMutation,
    RenameFeedTitleMutationVariables
  >(RenameFeedTitleDocument, options);
}
export type RenameFeedTitleMutationHookResult = ReturnType<
  typeof useRenameFeedTitleMutation
>;
export type RenameFeedTitleMutationResult =
  Apollo.MutationResult<RenameFeedTitleMutation>;
export type RenameFeedTitleMutationOptions = Apollo.BaseMutationOptions<
  RenameFeedTitleMutation,
  RenameFeedTitleMutationVariables
>;
export const ReplaceFeedTagsDocument = gql`
  mutation ReplaceFeedTags($input: ReplaceFeedTagsInput!) {
    replaceFeedTags(input: $input) {
      feedId
    }
  }
`;
export type ReplaceFeedTagsMutationFn = Apollo.MutationFunction<
  ReplaceFeedTagsMutation,
  ReplaceFeedTagsMutationVariables
>;

/**
 * __useReplaceFeedTagsMutation__
 *
 * To run a mutation, you first call `useReplaceFeedTagsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useReplaceFeedTagsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [replaceFeedTagsMutation, { data, loading, error }] = useReplaceFeedTagsMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useReplaceFeedTagsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    ReplaceFeedTagsMutation,
    ReplaceFeedTagsMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    ReplaceFeedTagsMutation,
    ReplaceFeedTagsMutationVariables
  >(ReplaceFeedTagsDocument, options);
}
export type ReplaceFeedTagsMutationHookResult = ReturnType<
  typeof useReplaceFeedTagsMutation
>;
export type ReplaceFeedTagsMutationResult =
  Apollo.MutationResult<ReplaceFeedTagsMutation>;
export type ReplaceFeedTagsMutationOptions = Apollo.BaseMutationOptions<
  ReplaceFeedTagsMutation,
  ReplaceFeedTagsMutationVariables
>;
