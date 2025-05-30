import { ApolloProvider } from "@apollo/client";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { ThemeProvider } from "next-themes";
import React, { useRef } from "react";
import ReactDOM from "react-dom/client";

import { Toaster } from "./components/ui/toaster";
import { initializeApolloClient, setToken } from "./lib/apollo";
import { routeTree } from "./routeTree.gen";

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
  const apolloClientRef = useRef(initializeApolloClient({}));

  React.useEffect(() => {
    if (!isAuthenticated) return;
    getAccessTokenSilently().then((token) => {
      setToken(apolloClientRef.current, token);
    });
  }, [isAuthenticated, getAccessTokenSilently, apolloClientRef]);

  return (
    <ApolloProvider client={apolloClientRef.current}>
      <ChakraProvider value={defaultSystem}>
        <ThemeProvider attribute="class" disableTransitionOnChange>
          <RouterProvider router={router} />
          <Toaster />
        </ThemeProvider>
      </ChakraProvider>
    </ApolloProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
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
  </React.StrictMode>
);
