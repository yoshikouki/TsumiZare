import type { ReactNode } from "react";
import { appUrl, description, keywords, title } from "@/config/site";
import stylesheet from "@/globals.css?url";
import { Footer } from "./site/footer";

export function Document({
  children,
  pathname,
  analytics,
}: {
  children: ReactNode;
  pathname: string;
  analytics: boolean;
}) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#F7F6F3" />
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords.join(", ")} />
        <link rel="author" href="https://yoshikouki.com/" />
        <meta name="author" content="yoshikouki" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${appUrl}${pathname}`} />
        <link rel="stylesheet" href={stylesheet} />
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <link
          rel="icon"
          href="/icons/icon-192x192.png"
          sizes="192x192"
          type="image/png"
        />
        <link
          rel="icon"
          href="/icons/icon-512x512.png"
          sizes="512x512"
          type="image/png"
        />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${appUrl}${pathname}`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={`${appUrl}/logo.svg`} />
        <meta property="og:image:alt" content={title} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="1200" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@yoshikouki_" />
        <meta name="twitter:creator" content="@yoshikouki_" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={`${appUrl}/logo.svg`} />
      </head>
      <body>
        {children}
        <Footer />
        {analytics && (
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({
              token: "d15d033a2ea2465e9b6dfe96c3d6efe1",
            })}
          />
        )}
      </body>
    </html>
  );
}
