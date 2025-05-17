import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

export const initializeApolloClient = ({ token }: { token?: string }) => {
  // バックエンドのGraphQLエンドポイントURL
  const httpLink = new HttpLink({
    uri: `${import.meta.env.VITE_API_URL}/query`,
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  // キャッシュの設定
  const cache = new InMemoryCache({
    typePolicies: {
      Post: {
        // postIdをキーフィールドとして設定
        keyFields: ["postId"],
      },
      Feed: {
        // feedIdをキーフィールドとして設定
        keyFields: ["feedId"],
      },
      PostFavorite: {
        // postFavoriteIdをキーフィールドとして設定
        keyFields: ["postFavoriteId"],
      },
    },
  });

  return new ApolloClient({
    link: httpLink,
    cache,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "cache-and-network",
        errorPolicy: "all",
      },
      query: {
        fetchPolicy: "cache-first",
        errorPolicy: "all",
      },
      mutate: {
        errorPolicy: "all",
      },
    },
  });
};

export const setToken = (client: ApolloClient<any>, token: string) => {
  client.setLink(
    new HttpLink({
      uri: `${import.meta.env.VITE_API_URL}/query`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  );
};
