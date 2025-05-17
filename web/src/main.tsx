import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ApolloProvider } from "@apollo/client";
import { Auth0Provider } from "@auth0/auth0-react";
import { ThemeProvider } from "next-themes";
import React from "react";
import ReactDOM from "react-dom/client";
import { apolloClient } from "./lib/apollo";
import { Toaster } from "./components/ui/toaster";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

const router = createRouter({ routeTree });

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Tokyo");

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
      <ChakraProvider value={defaultSystem}>
        <ThemeProvider attribute="class" disableTransitionOnChange>
          <Auth0Provider
            domain="abekoh.jp.auth0.com"
            clientId="EDFWOm1bAdIFu92nTu14yv8K7gqmrECX"
            authorizationParams={{
              redirect_uri: window.location.origin,
            }}
          >
            <RouterProvider router={router} />
            <Toaster />
          </Auth0Provider>
        </ThemeProvider>
      </ChakraProvider>
    </ApolloProvider>
  </React.StrictMode>
);
