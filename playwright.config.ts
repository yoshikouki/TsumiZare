import { defineConfig, devices } from "@playwright/test";

const worker = process.env.TEST_TARGET === "worker";
const externalURL = process.env.TEST_BASE_URL;
const devURL = "http://127.0.0.1:5173";
const webServer = worker
  ? {
      // Bind a fresh port so the test always serves this worktree's build.
      command: "bun run preview --ip 127.0.0.1 --port 0",
      wait: {
        stdout:
          /\[wrangler:info\] Ready on (?<PLAYWRIGHT_TEST_BASE_URL>http:\/\/127\.0\.0\.1:\d+)\r?\n/u,
      },
    }
  : {
      command: "bun run dev --host 127.0.0.1",
      url: devURL,
      reuseExistingServer: !process.env.CI,
    };

export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: externalURL || (worker ? undefined : devURL),
    ...devices["Desktop Chrome"],
  },
  webServer: externalURL ? undefined : webServer,
});
