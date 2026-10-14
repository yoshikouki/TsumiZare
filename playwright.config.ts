import { defineConfig, devices } from "@playwright/test";

const worker = process.env.TEST_TARGET === "worker";
const baseURL = worker ? "http://127.0.0.1:8787" : "http://127.0.0.1:5173";

export default defineConfig({
  testDir: "./e2e",
  use: { baseURL, ...devices["Desktop Chrome"] },
  webServer: {
    command: worker ? "bun run preview" : "bun run dev --host 127.0.0.1",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
