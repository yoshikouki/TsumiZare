import { expect, type Page, test } from "@playwright/test";

const BOARD = 'section[aria-label="ゲーム盤"]';
const ROW = "[data-row-id]";
const ACTIVE = '[data-state="active"]';
const FILLED = '[data-state="filled"]';
const FLASH = ".board-clear-flash";

// The first seven pieces from this seed are I pieces. The real runner still
// spawns, moves, locks and clears them through the game's controls.
const I_PIECE_SEED = 1_591_684;

const placeButton = (page: Page) =>
  page.getByRole("button", { name: "ブロックを置く" });

async function start(page: Page, path = "/modes/no-tick") {
  await page.addInitScript((seed) => {
    Math.random = () => seed / 2 ** 32;
  }, I_PIECE_SEED);
  await page.goto(path);
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(page.locator(BOARD).locator(ACTIVE)).toHaveCount(4);
}

function keysTo(x: number, y: number, vertical = false) {
  return [
    ...(vertical ? [" "] : []),
    ...Array.from({ length: Math.abs(x - 3) }, () =>
      x < 3 ? "ArrowLeft" : "ArrowRight"
    ),
    ...Array.from({ length: y }, () => "ArrowDown"),
  ];
}

async function steer(page: Page, x: number, y: number, vertical = false) {
  await page.evaluate(
    (keys) => {
      for (const key of keys) {
        window.dispatchEvent(new KeyboardEvent("keydown", { key }));
      }
    },
    keysTo(x, y, vertical)
  );
}

async function place(page: Page, x: number, y: number, vertical = false) {
  await steer(page, x, y, vertical);
  await placeButton(page).click();
}

async function prepareTwoLineClear(page: Page) {
  await place(page, 0, 18);
  await place(page, 4, 18);
  await place(page, 0, 17);
  await place(page, 4, 17);
  await place(page, 8, 16, true);
  await steer(page, 9, 16, true);
  await expect(page.locator(BOARD).locator(FILLED)).toHaveCount(20);
}

test("surviving rows fall two pitches and the next piece moves on the first frame", async ({
  page,
}) => {
  await start(page);
  await prepareTwoLineClear(page);
  const board = page.locator(BOARD);
  const oldRows = await board.locator(ROW).evaluateAll((rows) =>
    rows.map((row) => ({
      id: row.getAttribute("data-row-id"),
      top: row.getBoundingClientRect().top,
    }))
  );

  const frame = await placeButton(page).evaluate(
    async (button, { active, filled, rows, flash, boardSelector }) => {
      if (!(button instanceof HTMLButtonElement)) {
        throw new Error("Place button is missing");
      }
      button.click();
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
      await new Promise(requestAnimationFrame);

      const boardElement = document.querySelector(boardSelector);
      if (!boardElement) {
        throw new Error("Game board is missing");
      }
      const movingRows = [...boardElement.querySelectorAll(rows)].map((row) => {
        const fall = row
          .getAnimations()
          .find(
            ({ effect }) =>
              effect instanceof KeyframeEffect &&
              effect.getKeyframes().some((keyframe) => "translate" in keyframe)
          );
        if (fall) {
          fall.pause();
          fall.currentTime = 0;
        }
        const startTop = row.getBoundingClientRect().top;
        fall?.finish();
        return {
          id: row.getAttribute("data-row-id"),
          startTop,
          endTop: row.getBoundingClientRect().top,
          duration: Number(fall?.effect?.getComputedTiming().duration ?? 0),
        };
      });

      return {
        movingRows,
        filled: boardElement.querySelectorAll(filled).length,
        flashes: [...boardElement.querySelectorAll(flash)].map(
          (bar) => getComputedStyle(bar).gridRowStart
        ),
        pieces: [...boardElement.querySelectorAll(active)].map((piece) => ({
          column: Number(getComputedStyle(piece).gridColumnStart),
          isOutsideRows: piece.closest(rows) === null,
          row: Number(getComputedStyle(piece).gridRowStart),
        })),
      };
    },
    {
      active: ACTIVE,
      filled: FILLED,
      rows: ROW,
      flash: FLASH,
      boardSelector: BOARD,
    }
  );

  const pitch = oldRows[1].top - oldRows[0].top;
  const above = oldRows.slice(0, 17);
  const animated = frame.movingRows.filter((row) => row.duration > 0);
  expect(animated.map((row) => row.id)).toEqual(above.map((row) => row.id));
  for (const [index, row] of animated.entries()) {
    expect(row.duration).toBe(350);
    expect(Math.abs(row.startTop - above[index].top)).toBeLessThan(0.1);
    expect(Math.abs(row.endTop - row.startTop - pitch * 2)).toBeLessThan(0.1);
  }
  const below = frame.movingRows.at(-1);
  expect(below).toMatchObject({ id: oldRows[19].id, duration: 0 });
  expect(below?.endTop).toBe(oldRows[19].top);
  expect(frame.filled).toBe(4);
  expect(frame.flashes).toEqual(["18", "19"]);
  expect(frame.pieces).toEqual(
    [3, 4, 5, 6].map((column) => ({ column, isOutsideRows: true, row: 1 }))
  );
  await expect(board.locator(FLASH)).toHaveCount(0);
});

test("a second clear preserves the position of every row still falling", async ({
  page,
}) => {
  await start(page);
  await place(page, 8, 16, true);
  await place(page, 9, 16, true);
  await place(page, 0, 19);
  await place(page, 0, 18);
  await steer(page, 4, 19);

  const overlap = await placeButton(page).evaluate(
    async (button, { boardSelector, rows, flash, keys }) => {
      const board = document.querySelector(boardSelector);
      if (!(button instanceof HTMLButtonElement && board)) {
        throw new Error("Game controls are missing");
      }

      const sample = () =>
        [...board.querySelectorAll(rows)].map((row) => ({
          id: row.getAttribute("data-row-id"),
          top: row.getBoundingClientRect().top,
          falls: row
            .getAnimations()
            .filter(
              ({ effect }) =>
                effect instanceof KeyframeEffect &&
                effect
                  .getKeyframes()
                  .some((keyframe) => "translate" in keyframe)
            ).length,
        }));

      const initial = sample();
      button.click();
      await new Promise(requestAnimationFrame);
      for (const animation of board.getAnimations({ subtree: true })) {
        animation.updatePlaybackRate(0.25);
      }
      await new Promise(requestAnimationFrame);
      const before = sample();

      for (const key of keys) {
        window.dispatchEvent(new KeyboardEvent("keydown", { key }));
      }
      button.click();
      await new Promise(requestAnimationFrame);
      const after = sample();

      return {
        before,
        after,
        flashes: board.querySelectorAll(flash).length,
        pitch: initial[1].top - initial[0].top,
      };
    },
    { boardSelector: BOARD, rows: ROW, flash: FLASH, keys: keysTo(4, 19) }
  );

  expect(overlap.flashes).toBe(2);
  const survivors = overlap.after.filter(({ falls }) => falls === 2);
  expect(survivors).toHaveLength(18);
  for (const row of survivors) {
    const previousRow = overlap.before.find(({ id }) => id === row.id);
    expect(previousRow?.falls).toBe(1);
    expect(
      Math.abs(row.top - (previousRow?.top ?? Number.POSITIVE_INFINITY))
    ).toBeLessThan(overlap.pitch / 4);
  }
  await expect(page.locator(BOARD).locator(FILLED)).toHaveCount(4);
  await expect(page.locator(BOARD).locator(FLASH)).toHaveCount(0);
});

test("gravity mode updates the score and cells on the first clear frame", async ({
  page,
}) => {
  await start(page, "/");
  const board = page.locator(BOARD);
  const filled = board.locator(FILLED);
  const lock = async (x: number, filledCount: number, vertical = false) => {
    await steer(page, x, 19, vertical);
    await expect(filled).toHaveCount(filledCount);
    await expect(board.locator(ACTIVE)).toHaveCount(4);
  };
  await lock(8, 4, true);
  await lock(9, 8, true);
  await lock(0, 12);

  const scoreValue = page
    .getByText("0", { exact: true })
    .and(page.locator(':not([aria-hidden="true"] *)'));
  const firstChange = await scoreValue.evaluate(
    (score, { boardSelector, filledSelector, flash, rows, keys }) => {
      const boardElement = document.querySelector(boardSelector);
      if (!boardElement) {
        throw new Error("Game board is missing");
      }
      for (const key of keys) {
        window.dispatchEvent(new KeyboardEvent("keydown", { key }));
      }
      return new Promise((resolve) => {
        const sample = () => {
          const count = boardElement.querySelectorAll(filledSelector).length;
          if (count === 12 && score.textContent === "0") {
            requestAnimationFrame(sample);
            return;
          }
          resolve({
            score: score.textContent,
            filled: count,
            flashes: boardElement.querySelectorAll(flash).length,
            falling: [...boardElement.querySelectorAll(rows)].some((row) =>
              row
                .getAnimations()
                .some(
                  ({ effect }) =>
                    effect instanceof KeyframeEffect &&
                    effect
                      .getKeyframes()
                      .some((keyframe) => "translate" in keyframe)
                )
            ),
          });
        };
        requestAnimationFrame(sample);
      });
    },
    {
      boardSelector: BOARD,
      filledSelector: FILLED,
      flash: FLASH,
      rows: ROW,
      keys: keysTo(4, 19),
    }
  );

  expect(firstChange).toEqual({
    score: "10",
    filled: 6,
    flashes: 1,
    falling: true,
  });
});

test("reduced motion clears lines without animating the board", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await start(page);
  await prepareTwoLineClear(page);
  await placeButton(page).click();

  const board = page.locator(BOARD);
  await expect(board.locator(FILLED)).toHaveCount(4);
  await expect(board.locator(ACTIVE)).toHaveCount(4);
  await expect(board.locator(FLASH)).toHaveCount(0);
  expect(
    await board.evaluate(
      (element) => element.getAnimations({ subtree: true }).length
    )
  ).toBe(0);
});
