import type { Block, GameRunner } from "blocky-game";
import { type RefObject, useEffect, useState } from "react";

const FALL_EASING =
  "linear(0, 0.049 15%, 0.25 34%, 0.54 50%, 1 68%, 0.965 78%, 0.955 82%, 0.965 86%, 1 94%, 1)";
// The clear spreads from where the block landed, one cell per step.
const WAVE_STEP = 30;
// Surviving rows wait this long so the wave is under way when they fall.
const FALL_DELAY = 140;
const INVERTED = "invert(1) hue-rotate(180deg)";

interface Flash {
  id: number;
  rowIndex: number;
  // Steps from the landing point to each cell of the row.
  steps: number[];
}

const centerOf = ({ position, shape }: Block) => ({
  x: position.x + (shape[0].length - 1) / 2,
  y: position.y + (shape.length - 1) / 2,
});

export function useLineClear(
  runner: GameRunner,
  boardRef: RefObject<HTMLDivElement | null>
) {
  const [flashes, setFlashes] = useState<Flash[]>([]);

  useEffect(() => {
    const board = boardRef.current;
    if (!board) {
      return;
    }

    const motion = matchMedia("(prefers-reduced-motion: no-preference)");
    let previous = runner.getGame();
    let nextFlashId = 0;
    const unsubscribe = runner.subscribe((game, events) => {
      const oldRows = previous.rows;
      previous = game;
      if (!motion.matches) {
        return;
      }
      const cleared = events.flatMap((event) =>
        event.type === "cleared" ? event.rows : []
      );
      if (cleared.length === 0) {
        return;
      }

      // A clear always follows the lock that completed the rows.
      const landed = events.findLast((event) => event.type === "locked");
      const origin = landed
        ? centerOf(landed.block)
        : { x: (game.rules.cols - 1) / 2, y: cleared[0] };
      const afterimages = cleared.map((rowIndex, index) => ({
        id: nextFlashId + index,
        rowIndex,
        steps: Array.from(
          { length: game.rules.cols },
          (_, x) => Math.abs(x - origin.x) + Math.abs(rowIndex - origin.y)
        ),
      }));
      nextFlashId += afterimages.length;
      setFlashes((current) => [...current, ...afterimages]);

      if (cleared.length >= 3) {
        document.documentElement.animate(
          { filter: [INVERTED, INVERTED] },
          { duration: 80 }
        );
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
              delay: FALL_DELAY,
              duration: 320 + 30 * (distance - 1),
              easing: FALL_EASING,
              fill: "backwards",
            }
          );
      }
    });

    const stopMotion = () => {
      if (!motion.matches) {
        setFlashes([]);
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

  function removeFlash(id: Flash["id"]) {
    setFlashes((current) => current.filter((flash) => flash.id !== id));
  }

  return { flashes, removeFlash, waveStep: WAVE_STEP };
}
