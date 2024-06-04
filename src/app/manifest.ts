import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TsumiZare",
    short_name: "TsumiZare",
    description:
      "TsumiZare 積戯は、テトリス風のブロック落としゲームです。ブラウザでゲームを楽しもう！",
    start_url: "/",
    display: "standalone",
    background_color: "#F0F9F9",
    theme_color: "#F0F9F9",
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
