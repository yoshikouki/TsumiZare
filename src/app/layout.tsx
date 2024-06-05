import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Footer } from "./footer";
import { description, title } from "./metadata";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "TsumiZare",
    "積戯",
    "つみざれ",
    "ツミザレ",
    "パズルゲーム",
    "ブロック落としゲーム",
    "ブロックゲーム",
    "Block Game",
  ],
  authors: { name: "yoshikouki", url: "https://yoshikouki.com/" },
  icons: [
    {
      url: "/logo.svg",
      sizes: "1200x1200",
      type: "image/svg+xml",
      color: "#F7F6F3",
      fetchPriority: "high",
    },
    {
      url: "/icons/icon-192x192.png",
      sizes: "192x192",
      type: "image/png",
      color: "#F7F6F3",
      fetchPriority: "auto",
    },
    {
      url: "/icons/icon-512x512.png",
      sizes: "512x512",
      type: "image/png",
      color: "#F7F6F3",
      fetchPriority: "auto",
    },
  ],
  robots: "index, follow",
  openGraph: {
    url: "https://tsumizare.app/",
    title,
    description,
    images: [
      {
        url: "https://tsumizare.app/logo.svg",
        alt: title,
        width: 1200,
        height: 1200,
      },
    ],
  },
  twitter: {
    card: "summary",
    site: "@yoshikouki_",
    creator: "@yoshikouki_",
    title,
    description,
    images: "https://tsumizare.app/logo.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#F7F6F3",
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
