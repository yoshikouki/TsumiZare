import { expect, test } from "bun:test";
import {
  BLOCKS,
  cellVariant,
  type Command,
  createGame,
  type Game,
  msUntilNextStep,
  step,
} from "../index";

const start = (game: Game) => step(game, { type: "start" }).game;
const advance = (game: Game, ms: number) => step(game, { type: "advance", ms });
const move = (game: Game, direction: "left" | "right" | "down" | "up") =>
  step(game, { type: "move", direction }).game;

function activePiece(game: Game) {
  if (!game.piece) {
    throw new Error("Expected an active piece");
  }
  return game.piece;
}

test("gravity spawns, moves down and locks on its own deadlines", () => {
  const ready = createGame({ cols: 4, rows: 3, shapes: [[[1]]] }, 0);
  const playing = start(ready);
  expect(msUntilNextStep(ready)).toBeNull();
  expect(advance(playing, 332).game.piece).toBeNull();

  const spawned = advance(playing, 333);
  expect(spawned.events).toEqual([
    { type: "spawned", block: activePiece(spawned.game) },
  ]);
  expect(spawned.game.piece?.position.y).toBe(0);
  expect(advance(spawned.game, 333).game.piece?.position.y).toBe(1);

  const grounded = advance(spawned.game, 666).game;
  expect(grounded.piece?.position.y).toBe(2);
  const waiting = advance(grounded, 499);
  expect(waiting.events).toEqual([]);
  expect(msUntilNextStep(waiting.game)).toBe(1);

  const locked = advance(waiting.game, 1);
  expect(locked.events).toEqual([
    { type: "locked", block: activePiece(grounded) },
  ]);
  expect(cellVariant(locked.game, 0, 2)).toBe("filled");
  expect(locked.game.piece).toBeNull();
  expect(advance(locked.game, 166).events.map((event) => event.type)).toEqual([
    "spawned",
  ]);
});

test("successful grounded moves and rotations restart the lock wait", () => {
  const game = start(createGame({ cols: 4, rows: 1, shapes: [[[1]]] }, 0));
  const grounded = advance(game, 333).game;
  const shifted = move(advance(grounded, 400).game, "right");
  const rotated = step(advance(shifted, 400).game, { type: "rotate" }).game;
  expect(advance(rotated, 499).events).toEqual([]);
  expect(advance(rotated, 500).events.map((event) => event.type)).toEqual([
    "locked",
  ]);
});

test("failed moves keep the lock deadline and lifting off cancels it", () => {
  const game = start(createGame({ cols: 4, rows: 2, shapes: [[[1]]] }, 0));
  const grounded = advance(game, 666).game;
  const waiting = advance(grounded, 400).game;
  const failed = move(waiting, "left");
  expect(advance(failed, 100).events.map((event) => event.type)).toEqual([
    "locked",
  ]);

  const lifted = move(waiting, "up");
  expect(advance(lifted, 100).events).toEqual([]);
  const dropped = advance(lifted, 266).game;
  expect(dropped.piece?.position.y).toBe(1);
  expect(advance(dropped, 499).events).toEqual([]);
  expect(advance(dropped, 500).events.map((event) => event.type)).toEqual([
    "locked",
  ]);
});

test("advance processes multiple deadlines in order and stops at game over", () => {
  const game = start(
    createGame(
      { cols: 4, rows: 1, gravity: 100, lockDelay: 100, shapes: [[[1]]] },
      0
    )
  );
  const result = advance(game, 10_000);
  expect(result.events.map((event) => event.type)).toEqual([
    "spawned",
    "locked",
    "finished",
  ]);
  expect(result.game.status).toBe("finished");
  expect(msUntilNextStep(result.game)).toBeNull();
});

test("pause freezes both deadlines and finish cancels them", () => {
  const game = start(createGame({ cols: 4, rows: 1, shapes: [[[1]]] }, 0));
  const waiting = advance(game, 633).game;
  const paused = step(waiting, { type: "pause" }).game;
  expect(paused.status).toBe("paused");
  expect(msUntilNextStep(paused)).toBeNull();
  expect(advance(paused, 2000)).toEqual({ game: paused, events: [] });

  const resumed = step(paused, { type: "resume" }).game;
  expect(msUntilNextStep(resumed)).toBe(33);
  expect(advance(resumed, 199).events).toEqual([]);
  expect(advance(resumed, 200).events.map((event) => event.type)).toEqual([
    "locked",
  ]);

  const finished = step(paused, { type: "finish" });
  expect(finished.game.piece).toBeNull();
  expect(finished.game.status).toBe("finished");
  expect(finished.events).toEqual([{ type: "finished" }]);
});

test("stacking spawns immediately and only place locks a piece", () => {
  const ready = createGame(
    { cols: 4, rows: 4, gravity: null, shapes: [[[1]]] },
    0
  );
  const started = step(ready, { type: "start" });
  expect(started.events).toEqual([
    { type: "spawned", block: activePiece(started.game) },
  ]);
  const skipped = step(started.game, { type: "skip" });
  expect(skipped.events).toEqual([
    { type: "spawned", block: started.game.queue[0] },
  ]);
  const grounded = move(move(move(skipped.game, "down"), "down"), "down");
  expect(msUntilNextStep(grounded)).toBeNull();
  expect(advance(grounded, 10_000)).toEqual({ game: grounded, events: [] });

  const placed = step(grounded, { type: "place" });
  expect(placed.events).toEqual([
    { type: "locked", block: activePiece(grounded) },
    { type: "spawned", block: grounded.queue[0] },
  ]);
  expect(cellVariant(placed.game, 0, 3)).toBe("filled");
  expect(cellVariant(placed.game, 0, 0)).toBe("active");
  expect(cellVariant(placed.game, 0, 1)).toBe("belowActiveBlock");
  expect(cellVariant(placed.game, 1, 1)).toBe("empty");
  const reset = step(placed.game, { type: "reset" }).game;
  expect(reset.status).toBe("ready");
  expect(reset.piece).toBeNull();
  expect(cellVariant(reset, 0, 3)).toBe("empty");
});

test("clears report old row indexes, preserve surviving row identities and score", () => {
  const ready = createGame(
    { cols: 2, rows: 4, gravity: null, shapes: [BLOCKS.O] },
    0
  );
  const game = start(ready);
  const atBottom = move(move(game, "down"), "down");
  const cleared = step(atBottom, { type: "place" });
  expect(cleared.events).toEqual([
    { type: "locked", block: activePiece(atBottom) },
    { type: "cleared", rows: [2, 3] },
    { type: "spawned", block: atBottom.queue[0] },
  ]);
  expect(cleared.game.rows.slice(2)).toEqual(game.rows.slice(0, 2));
  const rowIds = new Set(
    [...game.rows, ...cleared.game.rows.slice(0, 2)].map((row) => row.id)
  );
  expect(rowIds.size).toBe(6);
  expect(cleared.game.result).toEqual({ score: 8, filledRowsNumber: 2 });
  expect(step(cleared.game, { type: "place" }).game.result).toEqual({
    score: 40,
    filledRowsNumber: 4,
  });
});

test("custom board bounds govern movement and default wall kicks still apply", () => {
  const game = start(
    createGame({ cols: 12, rows: 22, gravity: null, shapes: [BLOCKS.I] }, 0)
  );
  const vertical = step(game, { type: "rotate" }).game;
  let atWall = vertical;
  for (let count = 0; count < 22; count += 1) {
    atWall = move(move(atWall, "right"), "down");
  }
  expect(atWall.piece?.position).toEqual({ x: 11, y: 18 });
  const kicked = step(atWall, { type: "rotate" }).game;
  expect(kicked.piece?.position).toEqual({ x: 8, y: 18 });
  expect(kicked.piece?.shape).toEqual(BLOCKS.I);
});

test("fixed seeds replay blocks and IDs with default spawn column three", () => {
  const commands: Command[] = [
    { type: "start" },
    { type: "advance", ms: 333 },
    { type: "rotate" },
    { type: "move", direction: "down" },
    { type: "place" },
    { type: "reset" },
    { type: "start" },
    { type: "advance", ms: 333 },
  ];
  const replay = (seed: number) => {
    let game = createGame({}, seed);
    return commands.map((command) => {
      const result = step(game, command);
      ({ game } = result);
      return result;
    });
  };
  expect(replay(123)).toEqual(replay(123));
  expect(replay(123)[1].game.queue.map((block) => block.shape)).not.toEqual(
    replay(123_456)[1].game.queue.map((block) => block.shape)
  );
  expect(replay(123)[1].game.piece?.position.x).toBe(3);
});
