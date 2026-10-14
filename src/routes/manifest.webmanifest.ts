import { Hono } from "hono";
import { description } from "@/config/site";

function manifest() {
  return {
    name: "TsumiZare",
    short_name: "TsumiZare",
    description,
    start_url: "/",
    display: "standalone",
    background_color: "#F7F6F3",
    theme_color: "#F7F6F3",
    icons: [
      {
        src: "/logo.svg",
        sizes: "600x600",
        type: "image/svg+xml",
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}

export default new Hono().get("/", (c) =>
  c.body(JSON.stringify(manifest()), 200, {
    "Content-Type": "application/manifest+json",
  }),
);
