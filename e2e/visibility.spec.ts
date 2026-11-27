import { expect, test } from "@playwright/test";

test("the game pauses when the page is hidden", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(
    page
      .getByRole("region", { name: "ゲーム盤" })
      .locator('[data-state="active"]')
      .first()
  ).toBeVisible();

  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { get: () => true });
    document.dispatchEvent(new Event("visibilitychange"));
  });

  await expect(page.getByRole("button", { name: "再開" })).toBeVisible();
});
