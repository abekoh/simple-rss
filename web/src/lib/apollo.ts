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
