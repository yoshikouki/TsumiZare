import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/index.ts"],
  dts: true,
  splitting: false,
  minify: false,
  format: ["esm", "cjs"],
  bundle: true,
  platform: "neutral",
  external: ["react", "react-dom"],
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";',
    };
  },
});
