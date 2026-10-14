import {
  createFileRouter,
  type HonoRouteSource,
} from "@yoshikouki/hono-file-router";
import { rscRenderer } from "@yoshikouki/hono-rsc-renderer";
import { Hono } from "hono";
import { Document } from "@/components/document";
import type { AppEnv } from "@/lib/app-env";

const app = new Hono<AppEnv>({ strict: false });

app.use(
  "*",
  rscRenderer<AppEnv>(
    (props, c) => (
      <Document
        pathname={c.req.path}
        analytics={new URL(c.req.url).hostname === "tsumizare.app"}
      >
        {props.children}
      </Document>
    ),
    { onError: (error) => console.error(error) },
  ),
);

app.route(
  "/",
  createFileRouter({
    sources: [
      {
        files: import.meta.glob<HonoRouteSource<AppEnv>>("./**/*.{ts,tsx}", {
          base: "./routes",
          eager: true,
        }),
      },
    ],
    strict: false,
  }),
);

app.notFound((c) => {
  c.status(404);
  return c.render(
    <main>
      <h1>ページが見つかりません</h1>
      <a href="/">TsumiZareへ戻る</a>
    </main>,
  );
});

export default app.fetch;

if (import.meta.hot) import.meta.hot.accept();
