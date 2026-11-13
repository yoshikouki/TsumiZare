import assert from "node:assert/strict";

const [baseUrl, expectedGitSha, expectedVersionId] = process.argv.slice(2);
assert(
  baseUrl,
  "Usage: bun run scripts/smoke-deployment.ts <base-url> [git-sha] [version-id]"
);

async function get(path: string, headers: Record<string, string> = {}) {
  const response = await fetch(new URL(path, baseUrl), {
    headers: {
      "User-Agent": "Mozilla/5.0 TsumiZare-Deployment-Check",
      ...headers,
    },
    signal: AbortSignal.timeout(10_000),
  });
  assert.equal(response.status, 200, `${path}: HTTP ${response.status}`);
  return response;
}

async function verifyDeployment() {
  const health = await (await get("/healthz")).json();
  assert.equal(health.status, "ok");
  if (expectedGitSha) {
    assert.equal(health.gitSha, expectedGitSha);
  }
  if (expectedVersionId) {
    assert.equal(health.versionId, expectedVersionId);
  }

  await Promise.all(
    ["/", "/modes/no-tick"].map(async (path) => {
      const html = await get(path);
      assert(html.headers.get("content-type")?.includes("text/html"));
      const body = await html.text();
      assert(body.includes("TsumiZare"));
      const assets = [
        ...body.matchAll(/["'](?<asset>\/assets\/[^"' ]+\.(?:js|css))["']/gu),
      ];
      assert(assets.length > 0, "Missing fingerprinted assets");
      await Promise.all(
        assets.map((match) => {
          assert(match.groups);
          return get(match.groups.asset);
        })
      );
      const flight = await get(path, { RSC: "1" });
      assert(flight.headers.get("content-type")?.includes("text/x-component"));
      assert(flight.headers.get("vary")?.includes("RSC"));
      assert(flight.headers.get("cache-control")?.includes("no-store"));
      assert((await flight.text()).includes("BlockyGameProvider"));
    })
  );

  const manifest = await (await get("/manifest.webmanifest")).json();
  assert.equal(manifest.name, "TsumiZare");
  await Promise.all(
    manifest.icons.map((icon: { src: string }) => get(icon.src))
  );
  await get("/fonts/Inter-Black.ttf");
  console.log(
    `Verified ${baseUrl}: ${health.gitSha ?? "local"} (${health.versionId ?? "local"})`
  );
}

// Worker code and static assets can finish propagating at different times.
for (let attempt = 0; ; attempt += 1) {
  try {
    // biome-ignore lint/performance/noAwaitInLoops: Retry only after the preceding check fails; deployment propagation needs a delay between attempts.
    await verifyDeployment();
    break;
  } catch (error) {
    if (attempt === 15) {
      throw error;
    }
    await Bun.sleep(2000);
  }
}
