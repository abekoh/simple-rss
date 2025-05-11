import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Time: { input: any; output: any; }
};

export type DeleteFeedInput = {
  feedId: Scalars['ID']['input'];
};

export type DeleteFeedPayload = {
  __typename?: 'DeleteFeedPayload';
  feedId: Scalars['ID']['output'];
};

export type Feed = {
  __typename?: 'Feed';
  description?: Maybe<Scalars['String']['output']>;
  feedId: Scalars['ID']['output'];
  lastFetchedAt?: Maybe<Scalars['Time']['output']>;
  registeredAt: Scalars['Time']['output'];
  title: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type FeedFetch = {
  __typename?: 'FeedFetch';
  feedFetchId: Scalars['ID']['output'];
  feedId: Scalars['ID']['output'];
  fetchedAt: Scalars['Time']['output'];
  message?: Maybe<Scalars['String']['output']>;
  status: FeedFetchStatus;
};

export enum FeedFetchStatus {
  Failure = 'Failure',
  Success = 'Success'
}

export type FeedPostsInput = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  order?: PostsInputOrder;
};

export type Mutation = {
  __typename?: 'Mutation';
  deleteFeed: DeleteFeedPayload;
  registerFeed: RegisterFeedPayload;
};


export type MutationDeleteFeedArgs = {
  input: DeleteFeedInput;
};


export type MutationRegisterFeedArgs = {
  input: RegisterFeedInput;
};

export type Post = {
  __typename?: 'Post';
  author?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  feed: Feed;
  feedId: Scalars['ID']['output'];
  lastFetchedAt?: Maybe<Scalars['Time']['output']>;
  postId: Scalars['ID']['output'];
  postedAt?: Maybe<Scalars['Time']['output']>;
  status: PostStatus;
  summary?: Maybe<PostSummary>;
  title: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type PostFetch = {
  __typename?: 'PostFetch';
  fetchedAt: Scalars['Time']['output'];
  message?: Maybe<Scalars['String']['output']>;
  postFetchId: Scalars['ID']['output'];
  postId: Scalars['ID']['output'];
  status: PostFetchStatus;
};

export enum PostFetchStatus {
  Failure = 'Failure',
  Success = 'Success'
}

export enum PostStatus {
  Fetched = 'Fetched',
  Registered = 'Registered',
  Summarized = 'Summarized'
}

export type PostSummary = {
  __typename?: 'PostSummary';
  postId: Scalars['ID']['output'];
  postSummaryId: Scalars['ID']['output'];
  summarizeMethod: Scalars['String']['output'];
  summarizedAt: Scalars['Time']['output'];
  summary: Scalars['String']['output'];
};

export type PostsInput = {
  feedIds?: Array<Scalars['ID']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  order?: PostsInputOrder;
};

export enum PostsInputOrder {
  PostedAtAsc = 'PostedAtAsc',
  PostedAtDesc = 'PostedAtDesc'
}

export type PostsPayload = {
  __typename?: 'PostsPayload';
  posts: Array<Post>;
  totalCount: Scalars['Int']['output'];
};

export type Query = {
  __typename?: 'Query';
  feeds: Array<Feed>;
  posts: PostsPayload;
};


export type QueryPostsArgs = {
  input: PostsInput;
};

export type RegisterFeedInput = {
  url: Scalars['String']['input'];
};

export type RegisterFeedPayload = {
  __typename?: 'RegisterFeedPayload';
  feedId: Scalars['ID']['output'];
};

export type GetFeedsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetFeedsQuery = { __typename?: 'Query', feeds: Array<{ __typename?: 'Feed', feedId: string, url: string, title: string, description?: string | null, registeredAt: any, lastFetchedAt?: any | null }> };

export type GetPostsQueryVariables = Exact<{
  input: PostsInput;
}>;


export type GetPostsQuery = { __typename?: 'Query', posts: { __typename?: 'PostsPayload', totalCount: number, posts: Array<{ __typename?: 'Post', postId: string, feedId: string, url: string, title: string, description?: string | null, author?: string | null, status: PostStatus, postedAt?: any | null, lastFetchedAt?: any | null, feed: { __typename?: 'Feed', feedId: string, title: string, url: string, registeredAt: any } }> } };

export type RegisterFeedMutationVariables = Exact<{
  input: RegisterFeedInput;
}>;


export type RegisterFeedMutation = { __typename?: 'Mutation', registerFeed: { __typename?: 'RegisterFeedPayload', feedId: string } };

export type DeleteFeedMutationVariables = Exact<{
  input: DeleteFeedInput;
}>;


export type DeleteFeedMutation = { __typename?: 'Mutation', deleteFeed: { __typename?: 'DeleteFeedPayload', feedId: string } };


export const GetFeedsDocument = gql`
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
export function useGetFeedsQuery(baseOptions?: Apollo.QueryHookOptions<GetFeedsQuery, GetFeedsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFeedsQuery, GetFeedsQueryVariables>(GetFeedsDocument, options);
      }
export function useGetFeedsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFeedsQuery, GetFeedsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFeedsQuery, GetFeedsQueryVariables>(GetFeedsDocument, options);
        }
export function useGetFeedsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFeedsQuery, GetFeedsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetFeedsQuery, GetFeedsQueryVariables>(GetFeedsDocument, options);
        }
export type GetFeedsQueryHookResult = ReturnType<typeof useGetFeedsQuery>;
export type GetFeedsLazyQueryHookResult = ReturnType<typeof useGetFeedsLazyQuery>;
export type GetFeedsSuspenseQueryHookResult = ReturnType<typeof useGetFeedsSuspenseQuery>;
export type GetFeedsQueryResult = Apollo.QueryResult<GetFeedsQuery, GetFeedsQueryVariables>;
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
export function useGetPostsQuery(baseOptions: Apollo.QueryHookOptions<GetPostsQuery, GetPostsQueryVariables> & ({ variables: GetPostsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPostsQuery, GetPostsQueryVariables>(GetPostsDocument, options);
      }
export function useGetPostsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPostsQuery, GetPostsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPostsQuery, GetPostsQueryVariables>(GetPostsDocument, options);
        }
export function useGetPostsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPostsQuery, GetPostsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetPostsQuery, GetPostsQueryVariables>(GetPostsDocument, options);
        }
export type GetPostsQueryHookResult = ReturnType<typeof useGetPostsQuery>;
export type GetPostsLazyQueryHookResult = ReturnType<typeof useGetPostsLazyQuery>;
export type GetPostsSuspenseQueryHookResult = ReturnType<typeof useGetPostsSuspenseQuery>;
export type GetPostsQueryResult = Apollo.QueryResult<GetPostsQuery, GetPostsQueryVariables>;
export const RegisterFeedDocument = gql`
    mutation RegisterFeed($input: RegisterFeedInput!) {
  registerFeed(input: $input) {
    feedId
  }
}
    `;
export type RegisterFeedMutationFn = Apollo.MutationFunction<RegisterFeedMutation, RegisterFeedMutationVariables>;

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
export function useRegisterFeedMutation(baseOptions?: Apollo.MutationHookOptions<RegisterFeedMutation, RegisterFeedMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RegisterFeedMutation, RegisterFeedMutationVariables>(RegisterFeedDocument, options);
      }
export type RegisterFeedMutationHookResult = ReturnType<typeof useRegisterFeedMutation>;
export type RegisterFeedMutationResult = Apollo.MutationResult<RegisterFeedMutation>;
export type RegisterFeedMutationOptions = Apollo.BaseMutationOptions<RegisterFeedMutation, RegisterFeedMutationVariables>;
export const DeleteFeedDocument = gql`
    mutation DeleteFeed($input: DeleteFeedInput!) {
  deleteFeed(input: $input) {
    feedId
  }
}
    `;
export type DeleteFeedMutationFn = Apollo.MutationFunction<DeleteFeedMutation, DeleteFeedMutationVariables>;

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
export function useDeleteFeedMutation(baseOptions?: Apollo.MutationHookOptions<DeleteFeedMutation, DeleteFeedMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteFeedMutation, DeleteFeedMutationVariables>(DeleteFeedDocument, options);
      }
export type DeleteFeedMutationHookResult = ReturnType<typeof useDeleteFeedMutation>;
export type DeleteFeedMutationResult = Apollo.MutationResult<DeleteFeedMutation>;
export type DeleteFeedMutationOptions = Apollo.BaseMutationOptions<DeleteFeedMutation, DeleteFeedMutationVariables>;