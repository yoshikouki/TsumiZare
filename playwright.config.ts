import { defineConfig, devices } from "@playwright/test";

const worker = process.env.TEST_TARGET === "worker";
const externalURL = process.env.TEST_BASE_URL;

// Each run binds a fresh port and reads its URL from the server output, so a
// server left running from another worktree is never tested by mistake.
const webServer = worker
  ? {
      command: "bun run preview --ip 127.0.0.1 --port 0",
      wait: {
        stdout:
          /\[wrangler:info\] Ready on (?<PLAYWRIGHT_TEST_BASE_URL>http:\/\/127\.0\.0\.1:\d+)\r?\n/u,
      },
    }
  : {
      command: "bun run dev --host 127.0.0.1 --port 0",
      // Playwright forces colors, which would wrap Vite's port in escape codes.
      env: { NO_COLOR: "1" },
      wait: {
        stdout:
          /Local:\s+(?<PLAYWRIGHT_TEST_BASE_URL>http:\/\/127\.0\.0\.1:\d+)\//u,
      },
    };

export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: externalURL },
  projects: [
    { name: "chromium", use: devices["Desktop Chrome"] },
    {
      name: "webkit",
      testMatch: "**/line-clear.spec.ts",
      use: devices["Desktop Safari"],
    },
    {
      name: "firefox",
      testMatch: "**/line-clear.spec.ts",
      use: devices["Desktop Firefox"],
    },
  ],
  webServer: externalURL ? undefined : webServer,
});
