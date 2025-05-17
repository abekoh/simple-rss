import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

// バックエンドのGraphQLエンドポイントURL
const httpLink = new HttpLink({
  uri: `${import.meta.env.VITE_API_URL}/query`,
});

export const initializeApolloClient = ({ token }: { token?: string }) => {
  return new ApolloClient({
    link: httpLink,
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
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
