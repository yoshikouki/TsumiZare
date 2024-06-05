import type { MetadataRoute } from "next";
import { description } from "./metadata";

export default function manifest(): MetadataRoute.Manifest {
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
