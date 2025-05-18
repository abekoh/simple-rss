import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "icons/*.webp"],
      manifest: {
        name: "Simple RSS",
        short_name: "Simple RSS",
        icons: [
          {
            src: "icons/icon-48x48.webp",
            sizes: "48x48",
            type: "image/webp",
          },
          {
            src: "icons/icon-72x72.webp",
            sizes: "72x72",
            type: "image/webp",
          },
          {
            src: "icons/icon-96x96.webp",
            sizes: "96x96",
            type: "image/webp",
          },
          {
            src: "icons/icon-128x128.webp",
            sizes: "128x128",
            type: "image/webp",
          },
          {
            src: "icons/icon-144x144.webp",
            sizes: "144x144",
            type: "image/webp",
          },
          {
            src: "icons/icon-152x152.webp",
            sizes: "152x152",
            type: "image/webp",
          },
          {
            src: "icons/icon-192x192.webp",
            sizes: "192x192",
            type: "image/webp",
          },
          {
            src: "icons/icon-256x256.webp",
            sizes: "256x256",
            type: "image/webp",
          },
          {
            src: "icons/icon-384x384.webp",
            sizes: "384x384",
            type: "image/webp",
          },
          {
            src: "icons/icon-512x512.webp",
            sizes: "512x512",
            type: "image/webp",
          },
        ],
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#000000",
      },
    }),
  ],
});
