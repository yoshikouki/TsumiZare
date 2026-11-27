import type {
  Block,
  Direction,
  Game,
  GameEvent,
  GameRunner,
} from "blocky-game";
import { type RefObject, useEffect } from "react";

const NUDGES: Record<Direction, string> = {
  left: "-2px 0",
  right: "2px 0",
  down: "0 2px",
  up: "0 -2px",
};

const cellsOf = ({ position, shape }: Block) =>
  shape.flatMap((line, dy) =>
    line.flatMap((cell, dx) =>
      cell === 1 ? [{ x: position.x + dx, y: position.y + dy }] : []
    )
  );

// Every cell squashes toward the bottom centre of the block, so the block
// deforms as one piece.
function squash(board: HTMLElement, block: Block, rows: Game["rows"]) {
  const bottom = block.position.y + block.shape.length - 1;
  const center = block.position.x + (block.shape[0].length - 1) / 2;
  for (const { x, y } of cellsOf(block)) {
    const rise = bottom - y;
    const side = x - center;
    const shift = (wide: number, tall: number) =>
      `calc(var(--row-pitch) * ${side * wide}) calc(var(--row-pitch) * ${rise * tall})`;
    board.querySelector(`[data-row-id="${rows[y].id}"]`)?.children[x]?.animate(
      {
        transformOrigin: ["50% 100%", "50% 100%"],
        scale: ["0.9", "1.04 0.93", "0.99 1.02", "1"],
        translate: ["0 0", shift(0.04, 0.07), shift(-0.01, -0.02), "0 0"],
      },
      { duration: 320, easing: "ease-out" }
    );
  }
}

function land(board: HTMLElement, events: GameEvent[], rows: Game["rows"]) {
  const landed = events.findLast((event) => event.type === "locked");
  if (!landed) {
    return;
  }
  const clearedRows = events.reduce(
    (count, event) =>
      event.type === "cleared" ? count + event.rows.length : count,
    0
  );
  if (clearedRows === 0) {
    squash(board, landed.block, rows);
  }
  // Two or more rows at once sink the whole board.
  if (clearedRows >= 2) {
    board.animate(
      { translate: ["0 0", "0 7px", "0 -2px", "0 0"] },
      { composite: "add", duration: 260, easing: "ease-out" }
    );
  }
}

// Feedback for what the falling piece does: a nudge of the board when a move
// is blocked, a squash when it lands, and a sink when it clears several rows.
export function usePieceFeedback(
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
    let nudge: Animation | undefined;
    const unsubscribe = runner.subscribe((game, events) => {
      const before = previous;
      previous = game;
      if (!motion.matches) {
        return;
      }

      for (const event of events) {
        // A held key repeats the blocked move. One nudge plays out before
        // the next, and it adds to a sink instead of replacing it.
        if (event.type === "blocked" && nudge?.playState !== "running") {
          nudge = board.animate(
            { translate: ["0 0", NUDGES[event.direction], "0 0"] },
            { composite: "add", duration: 180, easing: "ease-out" }
          );
        }
      }
      land(board, events, before.rows);
    });

    const stopMotion = () => {
      if (!motion.matches) {
        for (const animation of board.getAnimations({ subtree: true })) {
          animation.cancel();
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
