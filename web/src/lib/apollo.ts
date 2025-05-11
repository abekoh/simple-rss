import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

// バックエンドのGraphQLエンドポイントURL
const httpLink = new HttpLink({
  uri: "http://localhost:8080/query", // バックエンドのURLに合わせて変更する必要があるかもしれません
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
