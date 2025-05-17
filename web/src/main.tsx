import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ApolloProvider } from "@apollo/client";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { ThemeProvider } from "next-themes";
import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "./components/ui/toaster";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { initializeApolloClient } from "./lib/apollo";

const router = createRouter({ routeTree });

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Tokyo");

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const Root2: React.FC = () => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [token, setToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isAuthenticated) return;
    getAccessTokenSilently().then((token) => {
      setToken(token);
    });
  }, [isAuthenticated, getAccessTokenSilently]);

  const apolloClient = initializeApolloClient({ token: token ?? undefined });

  return (
    <ApolloProvider client={apolloClient}>
      <RouterProvider router={router} />
      <Toaster />
    </ApolloProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider value={defaultSystem}>
      <ThemeProvider attribute="class" disableTransitionOnChange>
        <Auth0Provider
          domain="abekoh.jp.auth0.com"
          clientId="EDFWOm1bAdIFu92nTu14yv8K7gqmrECX"
          authorizationParams={{
            redirect_uri: window.location.origin,
            audience: "https://reader-api.abekoh.dev/",
            scope: "write",
          }}
        >
          <Root2 />
        </Auth0Provider>
      </ThemeProvider>
    </ChakraProvider>
  </React.StrictMode>
);
