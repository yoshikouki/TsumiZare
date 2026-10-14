import { readFile } from "node:fs/promises";
import { devices, expect, test } from "@playwright/test";

test("HTML, Flight, metadata and static assets are served on both game routes", async ({
  request,
}) => {
  for (const path of ["/", "/modes/no-tick"]) {
    const html = await request.get(path);
    expect(html.status()).toBe(200);
    expect(html.headers()["content-type"]).toContain("text/html");
    const body = await html.text();
    expect(body).toContain('<html lang="ja">');
    expect(body).toContain(`href="https://tsumizare.app${path}"`);
    const css = body.match(
      /href="([^"]+)" rel="stylesheet"|rel="stylesheet" href="([^"]+)"/,
    );
    expect(css).not.toBeNull();
    const style = await request.get(css?.[1] || css?.[2] || "", {
      headers: { Accept: "text/css" },
    });
    expect(style.status()).toBe(200);
    expect(style.headers()["content-type"]).toContain("text/css");
    for (const headers of [
      { RSC: "1" },
      { Accept: "text/x-component" },
    ] as Record<string, string>[]) {
      const flight = await request.get(path, { headers });
      expect(flight.status()).toBe(200);
      expect(flight.headers()["content-type"]).toContain("text/x-component");
      expect(flight.headers().vary).toContain("RSC");
      expect(flight.headers()["cache-control"]).toContain("no-store");
      expect(await flight.text()).toContain("BlockyGameProvider");
    }
  }
  const manifest = await request.get("/manifest.webmanifest");
  expect(manifest.headers()["content-type"]).toContain(
    "application/manifest+json",
  );
  const data = await manifest.json();
  expect(data.name).toBe("TsumiZare");
  for (const icon of data.icons)
    expect((await request.get(icon.src)).status()).toBe(200);
  expect((await request.get("/fonts/Inter-Black.ttf")).status()).toBe(200);
  expect((await request.get("/missing")).status()).toBe(404);
});

for (const path of ["/", "/modes/no-tick"]) {
  test(`${path}: play, move, pause, resume, finish and save a result image`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => {
      errors.push(error.message);
      console.error(error.message);
    });
    page.on("console", (message) => {
      if (message.type() === "error") console.error(message.text());
    });
    await page.goto(path);
    const board = page.getByRole("region", { name: "ゲーム盤" });
    const active = board.locator('[data-state="active"]');
    await page.getByRole("button", { name: "Play", exact: true }).click();
    await expect(active.first()).toBeVisible();
    const before = await active
      .first()
      .evaluate((cell) =>
        Array.from(cell.parentElement?.children || []).indexOf(cell),
      );
    await page.keyboard.press("ArrowLeft");
    await expect
      .poll(() =>
        active
          .first()
          .evaluate((cell) =>
            Array.from(cell.parentElement?.children || []).indexOf(cell),
          ),
      )
      .not.toBe(before);
    if (path === "/modes/no-tick") {
      await page.getByRole("button", { name: "ブロックを置く" }).click();
      await expect(
        board.locator('[data-state="filled"]').first(),
      ).toBeVisible();
    }
    await page.getByRole("button", { name: "一時停止" }).click();
    await expect(
      page.getByRole("button", { name: "再開", exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "再開", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "再開", exact: true }),
    ).toHaveCount(0);
    await page.getByRole("button", { name: "一時停止" }).click();
    await page.getByRole("button", { name: "終了", exact: true }).click();
    const downloaded = page.waitForEvent("download");
    await page.getByRole("button", { name: "結果画像を保存" }).click();
    const download = await downloaded;
    expect(download.suggestedFilename()).toMatch(/^TsumiZare-result-.*\.png$/);
    const file = await download.path();
    expect(file).not.toBeNull();
    const png = await readFile(file as string);
    expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(1200);
    await page.getByRole("button", { name: "ゲーム選択に戻る" }).click();
    await expect(
      page.getByRole("button", { name: "Play", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "結果画像を保存" }),
    ).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}

test.describe("touch controls", () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: devices["Pixel 7"].viewport,
  });

  test("a swipe moves the block in stacking mode", async ({
    page,
    context,
  }) => {
    await page.goto("/modes/no-tick");
    await page.getByRole("button", { name: "Play", exact: true }).click();
    const board = page.getByRole("region", { name: "ゲーム盤" });
    const active = board.locator('[data-state="active"]');
    await expect(active.first()).toBeVisible();
    const before = await active
      .first()
      .evaluate((cell) =>
        Array.from(cell.parentElement?.children || []).indexOf(cell),
      );
    const bounds = await board.boundingBox();
    if (!bounds) throw new Error("The game board is not visible");
    const x = bounds.x + bounds.width / 2;
    const y = bounds.y + bounds.height / 2;
    const touch = await context.newCDPSession(page);
    await touch.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y }],
    });
    await touch.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: bounds.x + bounds.width / 4, y }],
    });
    await touch.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await expect
      .poll(() =>
        active
          .first()
          .evaluate((cell) =>
            Array.from(cell.parentElement?.children || []).indexOf(cell),
          ),
      )
      .toBe(before - 1);
  });
});
