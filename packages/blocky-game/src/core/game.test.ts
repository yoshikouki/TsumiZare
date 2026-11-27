import { describe, expect, it } from "bun:test";
import { BLOCKS, type Block } from "./block";
import { type Board, initBoard } from "./board";
import { type Game, type GameAction, gameReducer } from "./game";

const block = (id: string, shape: number[][], x: number, y: number): Block => ({
  id,
  shape,
  position: { x, y },
});

const boardWith = (bottomRows: string[]): Board => {
  const board = { ...initBoard(), status: "playing" as const };
  const offset = board.rows.length - bottomRows.length;
  bottomRows.forEach((line, index) => {
    board.rows[offset + index].cells.forEach((cell, x) => {
      cell.blockId = line[x] === "#" ? "old" : null;
    });
  });
  return board;
};

const draw = (board: Board, rows = 3) =>
  board.rows
    .slice(-rows)
    .map((row) => row.cells.map((cell) => (cell.blockId ? "#" : ".")).join(""));

const playing = (game: Partial<Game> & { board: Board }): Game => ({
  activeBlock: null,
  queuedBlocks: [],
  ...game,
});

const run = (game: Game, ...actions: GameAction[]) =>
  actions.reduce(gameReducer, game);

describe("gameReducer", () => {
  it("moves the active block until a wall or a filled cell stops it", () => {
    const game = playing({
      board: boardWith(["#........."]),
      activeBlock: block("a", BLOCKS.O, 1, 17),
    });
    const left = run(game, { type: "move", direction: "left" });
    expect(left.activeBlock?.position).toEqual({ x: 0, y: 17 });
    const blocked = run(left, { type: "move", direction: "down" });
    expect(blocked.activeBlock?.position).toEqual({ x: 0, y: 17 });
    // A move that fails returns the same game, so the lock timer keeps running.
    expect(run(left, { type: "move", direction: "left" })).toBe(left);
  });

  it("kicks a rotated I block off the right wall", () => {
    const game = playing({
      board: boardWith([]),
      activeBlock: block("a", [[1], [1], [1], [1]], 9, 5),
    });
    const rotated = run(game, { type: "rotate" });
    expect(rotated.activeBlock?.shape).toEqual([[1, 1, 1, 1]]);
    expect(rotated.activeBlock?.position).toEqual({ x: 6, y: 5 });
  });

  it("keeps a grounded block on a tick and lands it on lock", () => {
    const game = playing({
      board: boardWith([]),
      activeBlock: block("a", BLOCKS.I, 0, 19),
    });
    const ticked = run(game, {
      type: "tick",
      nextBlock: block("n", BLOCKS.O, 3, 0),
    });
    expect(ticked).toBe(game);
    const landed = run(ticked, { type: "lock" });
    expect(landed.activeBlock).toBeNull();
    expect(draw(landed.board, 1)).toEqual(["####......"]);
  });

  it("ignores a lock once the block has moved off the ground", () => {
    const game = playing({
      board: boardWith(["##........"]),
      activeBlock: block("a", BLOCKS.O, 0, 17),
    });
    const offTheLedge = run(
      game,
      { type: "move", direction: "right" },
      { type: "move", direction: "right" }
    );
    expect(offTheLedge.activeBlock?.position).toEqual({ x: 2, y: 17 });
    expect(run(offTheLedge, { type: "lock" })).toEqual(offTheLedge);
  });

  it("activates the next queued block on a tick and queues the new one", () => {
    const queued = block("q", BLOCKS.T, 3, 0);
    const next = block("n", BLOCKS.O, 3, 0);
    const game = playing({ board: boardWith([]), queuedBlocks: [queued] });
    const activated = run(game, { type: "tick", nextBlock: next });
    expect(activated.activeBlock).toEqual(queued);
    expect(activated.queuedBlocks).toEqual([next]);
  });

  it("clears a filled row, drops the rows above and scores it once", () => {
    const queued = block("q", BLOCKS.I, 3, 0);
    const game = playing({
      board: boardWith(["#.........", "####..####"]),
      activeBlock: block("a", [[1, 1]], 4, 19),
      queuedBlocks: [queued],
    });
    const action: GameAction = {
      type: "place",
      nextBlock: block("n", BLOCKS.O, 3, 0),
    };
    const placed = run(game, action);
    expect(draw(placed.board)).toEqual([
      "..........",
      "..........",
      "#.........",
    ]);
    expect(placed.board.result).toEqual({ score: 10, filledRowsNumber: 1 });
    expect(placed.activeBlock).toEqual(queued);
    const second = run(placed, { type: "move", direction: "left" });
    expect(second.board.result).toEqual({ score: 10, filledRowsNumber: 1 });
  });

  it("renews cleared rows into the same rows every time", () => {
    const game = playing({
      board: boardWith(["####..####"]),
      activeBlock: block("a", [[1, 1]], 4, 19),
    });
    const once = run(game, { type: "lock" });
    expect(run(game, { type: "lock" })).toEqual(once);
    expect(draw(once.board, 1)).toEqual([".........."]);
  });

  it("finishes when the next block does not fit", () => {
    const board = boardWith([]);
    board.rows[0].cells[4].blockId = "old";
    const game = playing({ board, queuedBlocks: [block("q", BLOCKS.I, 3, 0)] });
    const finished = run(game, {
      type: "tick",
      nextBlock: block("n", BLOCKS.O, 3, 0),
    });
    expect(finished.board.status).toBe("finished");
    expect(finished.activeBlock).toBeNull();
  });

  it("finishes when the placed block covers the spot where the next one spawns", () => {
    const game = playing({
      board: boardWith([]),
      activeBlock: block("a", BLOCKS.I, 3, 0),
      queuedBlocks: [block("q", BLOCKS.I, 3, 0)],
    });
    const placed = run(game, {
      type: "place",
      nextBlock: block("n", BLOCKS.O, 3, 0),
    });
    expect(placed.board.status).toBe("finished");
  });

  it("keeps playing when a block placed in the top rows leaves the spawn free", () => {
    const queued = block("q", BLOCKS.I, 3, 0);
    const game = playing({
      board: boardWith([]),
      activeBlock: block("a", [[1], [1], [1], [1]], 0, 0),
      queuedBlocks: [queued],
    });
    const placed = run(game, {
      type: "place",
      nextBlock: block("n", BLOCKS.O, 3, 0),
    });
    expect(placed.board.status).toBe("playing");
    expect(placed.activeBlock).toEqual(queued);
  });

  it("ignores play while paused and resumes where it stopped", () => {
    const game = playing({
      board: boardWith([]),
      activeBlock: block("a", BLOCKS.O, 3, 0),
    });
    const paused = run(
      game,
      { type: "pause" },
      { type: "move", direction: "left" }
    );
    expect(paused.activeBlock?.position).toEqual({ x: 3, y: 0 });
    const resumed = run(
      paused,
      { type: "resume" },
      { type: "move", direction: "left" }
    );
    expect(resumed.activeBlock?.position).toEqual({ x: 2, y: 0 });
  });
});
