import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/index.ts"],
  clean: true,
  splitting: false,
  format: ["esm"],
  platform: "neutral",
  external: ["react", "react-dom"],
  banner: { js: '"use client";' },
});
