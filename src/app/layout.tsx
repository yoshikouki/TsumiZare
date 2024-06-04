import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Footer } from "./footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TsumiZare - 無料で遊べるテトリス風のブロック落としゲーム",
  description:
    "TsumiZare 積戯は、テトリス風のブロック落としゲームです。ブラウザでゲームを楽しもう！",
  keywords: [
    "TsumiZare",
    "積戯",
    "つみざれ",
    "ツミザレ",
    "ブロック落としゲーム",
    "ブロックゲーム",
    "Block Game",
  ],
  authors: { name: "yoshikouki", url: "https://yoshikouki.com/" },
  icons: [
    {
      url: "/logo.svg",
      type: "image/svg+xml",
      sizes: "512x512",
      color: "#F0F9F9",
      fetchPriority: "auto",
    },
  ],
  robots: "index, follow",
  openGraph: {
    title: "TsumiZare - 無料で遊べるテトリス風のブロック落としゲーム",
    description:
      "TsumiZare 積戯は、テトリス風のブロック落としゲームです。ブラウザでゲームを楽しもう！",
    images: [
      {
        url: "/logo.svg",
        alt: "TsumiZare - 無料で遊べるテトリス風のブロック落としゲーム",
        width: 1200,
        height: 1200,
      },
    ],
  },
  twitter: {
    card: "summary",
    site: "@yoshikouki_",
    creator: "@yoshikouki_",
    title: "TsumiZare - 無料で遊べるテトリス風のブロック落としゲーム",
    description:
      "TsumiZare 積戯は、テトリス風のブロック落としゲームです。ブラウザでゲームを楽しもう！",
    images: [
      {
        url: "/logo.svg",
        alt: "TsumiZare - 無料で遊べるテトリス風のブロック落としゲーム",
        width: 1200,
        height: 1200,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Footer />
      </body>
    </html>
  );
}
