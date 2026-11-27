import { expect, type Page, test } from "@playwright/test";

const instrument = () => {
  // generateRandomBlock picks BLOCKS[floor(random * 7)], so values just above
  // 0 always pick the I block. Each call still differs, so ids stay unique.
  let calls = 0;
  const onlyIBlocks = () => {
    calls += 1;
    return 0.01 + (calls % 100_000) * 1e-6;
  };
  Math.random = onlyIBlocks;
  const transitions: {
    types: string[];
    moves: number[];
    images: string[];
    animating: boolean;
  }[] = [];
  const activeFrames: number[][] = [];
  const clicks: { button: string; animating: boolean }[] = [];
  Object.assign(window, { transitions, activeFrames, clicks });
  document.addEventListener(
    "click",
    (event) => {
      const target = event.target as Element;
      clicks.push({
        button:
          target.closest("button")?.getAttribute("aria-label") ??
          target.tagName,
        animating: transitions.at(-1)?.animating ?? false,
      });
    },
    true
  );
  const start = Document.prototype.startViewTransition;
  Document.prototype.startViewTransition = function (
    this: Document,
    options: StartViewTransitionOptions
  ) {
    const record = {
      types: [...(options.types ?? [])],
      moves: [] as number[],
      images: [] as string[],
      animating: false,
    };
    transitions.push(record);
    const transition = start.call(this, options);
    transition.finished.then(() => {
      record.animating = false;
    });
    transition.ready.then(() => {
      record.animating = true;
      for (const animation of document.getAnimations()) {
        const effect = animation.effect as KeyframeEffect;
        // React captures the root too and hides it, so only row images count.
        const pseudo = effect.pseudoElement ?? "";
        const isImage =
          pseudo.startsWith("::view-transition-old(") ||
          pseudo.startsWith("::view-transition-new(");
        if (isImage && !pseudo.endsWith("(root)")) {
          record.images.push(pseudo);
        }
        if (!effect.pseudoElement?.startsWith("::view-transition-group")) {
          continue;
        }
        const keyframes = effect.getKeyframes();
        const y = (transform: unknown) =>
          new DOMMatrix(String(transform ?? "none")).f;
        record.moves.push(
          y(keyframes.at(-1)?.transform) - y(keyframes[0]?.transform)
        );
      }
    });
    return transition;
  };
  const sample = () => {
    const cells = [
      ...document.querySelectorAll(
        "section[aria-label='ゲーム盤'] [data-state]"
      ),
    ];
    activeFrames.push(
      cells.flatMap((cell, index) =>
        cell.getAttribute("data-state") === "active" ? [index] : []
      )
    );
    requestAnimationFrame(sample);
  };
  requestAnimationFrame(sample);
};

const activeCells = (page: Page) =>
  page.evaluate(() =>
    [
      ...document.querySelectorAll(
        "section[aria-label='ゲーム盤'] [data-state]"
      ),
    ].flatMap((cell, index) =>
      cell.getAttribute("data-state") === "active" ? [index] : []
    )
  );

const pressAndWait = async (page: Page, key: string) => {
  const before = (await activeCells(page)).join();
  await page.keyboard.press(key);
  await expect
    .poll(async () => (await activeCells(page)).join())
    .not.toBe(before);
};

const place = async (page: Page, keys: string[], rows: number) => {
  const presses = [...keys, ...Array.from({ length: rows }, () => "ArrowDown")];
  await presses.reduce<Promise<void>>(
    (previous, key) => previous.then(() => pressAndWait(page, key)),
    Promise.resolve()
  );
  const placed = (await activeCells(page)).join();
  const from = await page.evaluate(() => window.activeFrames.length);
  await page.getByRole("button", { name: "ブロックを置く" }).click();
  return { placed, from };
};

const rotate = " ";
const TOP_FOUR_ROWS = 40;
const right = (times: number) =>
  Array.from({ length: times }, () => "ArrowRight");
const left = (times: number) =>
  Array.from({ length: times }, () => "ArrowLeft");

const fillBottomRow = async (page: Page) => {
  await place(page, [rotate, ...right(5)], 16);
  await place(page, [rotate, ...right(6)], 16);
  await place(page, left(3), 19);
  await expect
    .poll(() => page.evaluate(() => window.transitions.length))
    .toBe(0);
  return place(page, right(1), 19);
};

declare global {
  interface Window {
    transitions: {
      types: string[];
      moves: number[];
      images: string[];
      animating: boolean;
    }[];
    activeFrames: number[][];
    clicks: { button: string; animating: boolean }[];
  }
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(instrument);
  await page.goto("/modes/no-tick");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(page.locator('[data-state="active"]').first()).toBeVisible();
});

test("rows above a cleared row fall into place, and moves never animate", async ({
  page,
}) => {
  await fillBottomRow(page);
  await expect
    .poll(() => page.evaluate(() => window.transitions.length))
    .toBe(1);
  const [transition] = await page.evaluate(() => window.transitions);
  expect(transition.types).toEqual(["line-clear"]);
  const rowPitch = await page.evaluate(() => {
    const cells = document.querySelectorAll(
      "section[aria-label='ゲーム盤'] [data-state]"
    );
    return (
      cells[10].getBoundingClientRect().top -
      cells[0].getBoundingClientRect().top
    );
  });
  // Every row above the cleared one falls, empty rows included. Group
  // transforms snap to whole pixels.
  await expect
    .poll(() =>
      page.evaluate(
        (pitch) =>
          window.transitions[0].moves.filter(
            (move) => Math.abs(move - pitch) < 1
          ).length,
        rowPitch
      )
    )
    .toBe(19);
  // Only the groups move. An old image would still show the placed block as
  // active next to the next block.
  expect(await page.evaluate(() => window.transitions[0].images)).toEqual([]);
});

test("ArrowUp right after a line clear never brings the placed block back", async ({
  page,
}) => {
  const { placed, from } = await fillBottomRow(page);
  // The first ArrowUp cannot move a block in the top row. Each later key
  // changes where the next block ends, so a dropped key shows.
  await ["ArrowUp", "ArrowDown", "ArrowDown", "ArrowUp", "ArrowLeft"].reduce<
    Promise<void>
  >(
    (previous, key) => previous.then(() => page.keyboard.press(key)),
    Promise.resolve()
  );
  await expect
    .poll(() => page.evaluate(() => window.transitions.length))
    .toBe(1);
  await expect(page.locator('[data-state="filled"]')).toHaveCount(6);
  await page.waitForTimeout(500);
  const frames = await page.evaluate(
    (start) => window.activeFrames.slice(start),
    from
  );
  const firstNext = frames.findIndex((cells) => cells.join() !== placed);
  expect(firstNext).toBeGreaterThanOrEqual(0);
  for (const cells of frames.slice(firstNext)) {
    expect(cells.every((index) => index < TOP_FOUR_ROWS)).toBe(true);
  }
  expect(await activeCells(page)).toEqual([12, 13, 14, 15]);
});

test("a click during the line clear animation reaches the button under it", async ({
  page,
}) => {
  const pause = await page
    .getByRole("button", { name: "一時停止" })
    .boundingBox();
  if (!pause) {
    throw new Error("The pause button is not visible");
  }
  await fillBottomRow(page);
  await expect
    .poll(() => page.evaluate(() => window.transitions[0]?.animating), {
      intervals: [5],
    })
    .toBe(true);
  await page.mouse.click(pause.x + pause.width / 2, pause.y + pause.height / 2);
  expect(await page.evaluate(() => window.clicks.at(-1))).toEqual({
    button: "一時停止",
    animating: true,
  });
  await expect(
    page.getByRole("button", { name: "再開", exact: true })
  ).toBeVisible();
});
