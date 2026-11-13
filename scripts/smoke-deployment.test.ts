import { expect, test } from "bun:test";
import { serve, spawn } from "bun";
import { NativeResponse as Response } from "../src/tests/setup";

function waitForPair() {
  const { promise, resolve } = Promise.withResolvers<void>();
  let count = 0;
  return async () => {
    count += 1;
    if (count === 2) {
      resolve();
    }
    await promise;
  };
}

test.each([false, true])(
  "deployment check fetches independent resources concurrently (retry: %p)",
  async (retry) => {
    const waitForPages = waitForPair();
    const waitForHomeAssets = waitForPair();
    const waitForModeAssets = waitForPair();
    const waitForIcons = waitForPair();
    const requested: string[] = [];
    let healthChecks = 0;
    const server = serve({
      hostname: "127.0.0.1",
      port: 0,
      async fetch(request) {
        const { pathname } = new URL(request.url);
        const flight = request.headers.get("RSC") === "1";
        requested.push(`${pathname}${flight ? "?flight" : ""}`);
        switch (pathname) {
          case "/healthz":
            healthChecks += 1;
            return Response.json({
              status: "ok",
              gitSha: retry && healthChecks === 1 ? "old-sha" : "expected-sha",
              versionId: "expected-version",
            });
          case "/":
          case "/modes/no-tick": {
            if (flight) {
              return new Response("BlockyGameProvider", {
                headers: {
                  "content-type": "text/x-component",
                  vary: "RSC",
                  "cache-control": "no-store",
                },
              });
            }
            await waitForPages();
            const name = pathname === "/" ? "home" : "mode";
            return new Response(
              `TsumiZare <script src="/assets/${name}.js"></script><link href='/assets/${name}.css'>`,
              { headers: { "content-type": "text/html" } }
            );
          }
          case "/assets/home.js":
          case "/assets/home.css":
            await waitForHomeAssets();
            return new Response("asset");
          case "/assets/mode.js":
          case "/assets/mode.css":
            await waitForModeAssets();
            return new Response("asset");
          case "/manifest.webmanifest":
            return Response.json({
              name: "TsumiZare",
              icons: [{ src: "/icons/one.png" }, { src: "/icons/two.png" }],
            });
          case "/icons/one.png":
          case "/icons/two.png":
            await waitForIcons();
            return new Response("icon");
          case "/fonts/Inter-Black.ttf":
            return new Response("font");
          default:
            return new Response("missing", { status: 404 });
        }
      },
    });
    const child = spawn({
      cmd: [
        process.execPath,
        "run",
        new URL("./smoke-deployment.ts", import.meta.url).pathname,
        server.url.href,
        "expected-sha",
        "expected-version",
      ],
      stdout: "pipe",
      stderr: "pipe",
    });
    // A sequential implementation cannot pass the pair barriers; bound its lifetime.
    const timeout = setTimeout(() => child.kill(), 5000);
    try {
      const [exitCode, stdout, stderr] = await Promise.all([
        child.exited,
        new Response(child.stdout).text(),
        new Response(child.stderr).text(),
      ]);
      expect(stderr).toBe("");
      expect(exitCode).toBe(0);
      expect(stdout).toContain("Verified");
      expect(healthChecks).toBe(retry ? 2 : 1);
      expect(requested.toSorted()).toEqual(
        [
          ...Array.from({ length: retry ? 2 : 1 }, () => "/healthz"),
          "/",
          "/modes/no-tick",
          "/assets/home.js",
          "/assets/home.css",
          "/assets/mode.js",
          "/assets/mode.css",
          "/?flight",
          "/modes/no-tick?flight",
          "/manifest.webmanifest",
          "/icons/one.png",
          "/icons/two.png",
          "/fonts/Inter-Black.ttf",
        ].toSorted()
      );
    } finally {
      clearTimeout(timeout);
      child.kill();
      server.stop(true);
    }
  },
  10_000
);
