import type { GameRunner } from "blocky-game";
import { type RefObject, useEffect } from "react";

const FALL_EASING =
  "linear(0, 0.049 15%, 0.25 34%, 0.54 50%, 1 68%, 0.965 78%, 0.955 82%, 0.965 86%, 1 94%, 1)";

export function useLineClear(
  runner: GameRunner,
  boardRef: RefObject<HTMLDivElement | null>
) {
  useEffect(() => {
    const board = boardRef.current;
    if (!board) {
      return;
    }

    const motion = matchMedia("(prefers-reduced-motion: no-preference)");
    let previous = runner.getGame();
    const unsubscribe = runner.subscribe((game, events) => {
      const oldRows = previous.rows;
      previous = game;
      if (
        !(motion.matches && events.some((event) => event.type === "cleared"))
      ) {
        return;
      }

      const destinations = new Map(game.rows.map((row, y) => [row.id, y]));
      const elements = new Map(
        Array.from(
          board.querySelectorAll<HTMLElement>("[data-row-id]"),
          (row) => [row.dataset.rowId, row]
        )
      );

      for (const [oldIndex, row] of oldRows.entries()) {
        const newIndex = destinations.get(row.id);
        if (newIndex === undefined || newIndex <= oldIndex) {
          continue;
        }

        // An index gains one position for each cleared row below it, even
        // when the runner delivers several clears in one update.
        const distance = newIndex - oldIndex;
        elements
          .get(row.id)
          ?.animate(
            [
              { translate: `0 calc(var(--row-pitch) * ${-distance})` },
              { translate: "0 0" },
            ],
            {
              composite: "add",
              duration: 320 + 30 * (distance - 1),
              easing: FALL_EASING,
            }
          );
      }
    });

    const stopMotion = () => {
      if (!motion.matches) {
        for (const row of board.querySelectorAll("[data-row-id]")) {
          for (const animation of row.getAnimations()) {
            animation.cancel();
          }
        }
      }
    };
    motion.addEventListener("change", stopMotion);
    return () => {
      unsubscribe();
      motion.removeEventListener("change", stopMotion);
    };
  }, [boardRef, runner]);
}
