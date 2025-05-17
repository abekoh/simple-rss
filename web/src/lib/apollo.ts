import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

// バックエンドのGraphQLエンドポイントURL
const httpLink = new HttpLink({
  uri: `${import.meta.env.VITE_API_URL}/query`,
});

// Apollo Clientの設定
export const apolloClient = new ApolloClient({
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
