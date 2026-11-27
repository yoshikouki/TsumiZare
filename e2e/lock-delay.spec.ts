import { expect, type Page, test } from "@playwright/test";

// Moves every 150ms, well inside the 666ms lock wait.
const STEER_INTERVAL = 150;

const cells = (page: Page, state: "active" | "filled") =>
  page
    .getByRole("region", { name: "ゲーム盤" })
    .locator(`[data-state="${state}"]`);
const filled = (page: Page) => cells(page, "filled");

const steer = (page: Page, times: number) =>
  Array.from({ length: times }).reduce<Promise<void>>(
    (previous, _, index) =>
      previous.then(async () => {
        await page.keyboard.press(index % 2 ? "ArrowRight" : "ArrowLeft");
        await page.waitForTimeout(STEER_INTERVAL);
      }),
    Promise.resolve()
  );

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(cells(page, "active").first()).toBeVisible();
  await Array.from({ length: 25 }).reduce<Promise<void>>(
    (previous) => previous.then(() => page.keyboard.press("ArrowDown")),
    Promise.resolve()
  );
});

test("moving a grounded block keeps it from locking, and it locks once left alone", async ({
  page,
}) => {
  await steer(page, 8);
  await expect(filled(page)).toHaveCount(0);
  await expect(filled(page).first()).toBeVisible();
});
