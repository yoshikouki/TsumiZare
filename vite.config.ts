import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import rsc from "@vitejs/plugin-rsc";
import { defineConfig } from "vite";

export default defineConfig({
  define: {
    "process.env.SATORI_STANDALONE": JSON.stringify("0"),
    "process.env.JEST_WORKER_ID": "undefined",
  },
  plugins: [
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    rsc(),
  ],
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
      "@yoshikouki/hono-file-router": new URL(
        "./node_modules/@yoshikouki/hono-file-router/packages/hono-file-router/src/index.ts",
        import.meta.url,
      ).pathname,
      "@yoshikouki/hono-rsc-renderer/entry.browser": new URL(
        "./node_modules/@yoshikouki/hono-rsc-renderer/packages/hono-rsc-renderer/src/entry.browser.ts",
        import.meta.url,
      ).pathname,
      "@yoshikouki/hono-rsc-renderer/entry.ssr": new URL(
        "./node_modules/@yoshikouki/hono-rsc-renderer/packages/hono-rsc-renderer/src/entry.ssr.ts",
        import.meta.url,
      ).pathname,
      "@yoshikouki/hono-rsc-renderer": new URL(
        "./node_modules/@yoshikouki/hono-rsc-renderer/packages/hono-rsc-renderer/src/index.ts",
        import.meta.url,
      ).pathname,
    },
  },
  environments: {
    ssr: {
      resolve: { conditions: ["workerd", "module", "development|production"] },
    },
    rsc: { build: { rollupOptions: { input: { index: "./src/index.tsx" } } } },
    client: {
      build: {
        rollupOptions: {
          input: { index: "@yoshikouki/hono-rsc-renderer/entry.browser" },
        },
      },
    },
  },
});
