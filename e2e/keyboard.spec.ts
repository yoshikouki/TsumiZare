import { expect, type Page, test } from "@playwright/test";

async function openGame(page: Page, path: string) {
  // The server renders the ready screen before the client installs its keyboard listener.
  await page.goto(path, { waitUntil: "networkidle" });
}

test("keyboard starts, pauses, and resumes standard mode", async ({ page }) => {
  await openGame(page, "/");
  const play = page.getByRole("button", { name: "Play", exact: true });
  const resume = page.getByRole("button", { name: "再開" });
  const board = page.getByRole("region", { name: "ゲーム盤" });
  await expect(play).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(board.locator('[data-state="active"]').first()).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(resume).toBeVisible();
  await page.keyboard.press("Shift+p");
  await expect(resume).toHaveCount(0);

  await page.keyboard.press("Escape");
  await expect(resume).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(resume).toHaveCount(0);
});

test("Enter places a block in stacking mode", async ({ page }) => {
  await openGame(page, "/modes/no-tick");
  const board = page.getByRole("region", { name: "ゲーム盤" });
  const filled = board.locator('[data-state="filled"]');
  await page.keyboard.press("Enter");
  await expect(board.locator('[data-state="active"]').first()).toBeVisible();
  await expect(filled).toHaveCount(0);
  // Move below the spawn area before placing the block.
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(filled.first()).toBeVisible();
});

test("Enter starts a fresh game after the stack reaches the spawn area", async ({
  page,
}) => {
  // The first two pieces from this seed are identical, so placing the first
  // piece in the spawn area ends the game.
  await page.addInitScript(() => {
    Math.random = () => 1_591_684 / 2 ** 32;
  });
  await openGame(page, "/modes/no-tick");
  const board = page.getByRole("region", { name: "ゲーム盤" });
  const active = board.locator('[data-state="active"]');
  const playAgain = page.getByRole("button", { name: "もう一度遊ぶ" });

  await page.keyboard.press("Enter");
  await expect(active.first()).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(playAgain).toBeVisible();

  await page.keyboard.press("Enter");
  await expect(active.first()).toBeVisible();
  await expect(board.locator('[data-state="filled"]')).toHaveCount(0);
  await expect(playAgain).toHaveCount(0);
});

test("Enter activates a focused link while the game stays ready", async ({
  context,
  page,
}) => {
  const contact = "https://yoshikouki.com/contact?topic=tsumizare";
  await context.route(contact, (route) => route.fulfill({ body: "Contact" }));
  await openGame(page, "/");
  const link = page.getByRole("link", { name: "フィードバックを送る" });
  await link.focus();
  await expect(link).toBeFocused();

  const popup = page.waitForEvent("popup");
  await page.keyboard.press("Enter");
  await expect(await popup).toHaveURL(contact);
  await expect(
    page.getByRole("button", { name: "Play", exact: true })
  ).toBeVisible();
});
