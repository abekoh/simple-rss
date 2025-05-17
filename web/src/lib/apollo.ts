import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

export const initializeApolloClient = ({ token }: { token?: string }) => {
  // バックエンドのGraphQLエンドポイントURL
  const httpLink = new HttpLink({
    uri: `${import.meta.env.VITE_API_URL}/query`,
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "network-only",
        errorPolicy: "all",
      },
      query: {
        fetchPolicy: "network-only",
        errorPolicy: "all",
      },
      mutate: {
        errorPolicy: "all",
      },
    },
  });
};
