import {
  BLOCKS,
  type Block,
  type BlockPosition,
  type BlockShape,
  isCellBelowBlock,
  isFilledBlockCell,
  rotateShape,
} from "./block.js";
import { type Row, initRow } from "./board.js";
import { WALL_KICKS } from "./constants.js";
import { initResult, type Result, scoreClear } from "./result.js";

export interface Rules {
  cols: number;
  rows: number;
  gravity: number | null;
  lockDelay: number;
  shapes: BlockShape[];
}

export interface Game {
  status: "ready" | "playing" | "paused" | "finished";
  rules: Rules;
  rows: Row[];
  piece: Block | null;
  queue: Block[];
  result: Result;
  randomState: number;
  nextRowId: number;
  nextBlockId: number;
  gravityIn: number | null;
  lockIn: number | null;
}

export type Direction = "left" | "right" | "down" | "up";

export type Command =
  | { type: "start" }
  | { type: "reset" }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "finish" }
  | { type: "move"; direction: Direction }
  | { type: "rotate" }
  | { type: "place" }
  | { type: "skip" }
  | { type: "advance"; ms: number };

export type GameEvent =
  | { type: "locked"; block: Block }
  | { type: "cleared"; rows: number[] }
  | { type: "spawned"; block: Block }
  | { type: "finished" };

export type CellVariant = "empty" | "filled" | "active" | "belowActiveBlock";

const DEFAULT_RULES: Rules = {
  cols: 10,
  rows: 20,
  gravity: 333,
  lockDelay: 500,
  shapes: Object.values(BLOCKS),
};

const STEPS: Record<Direction, BlockPosition> = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  down: { x: 0, y: 1 },
  up: { x: 0, y: -1 },
};

const ROTATION_OFFSETS = [{ x: 0, y: 0 }, ...WALL_KICKS];
const QUEUE_SIZE = 3;
const RANDOM_RANGE = 2 ** 32;

const makeRows = (cols: number, count: number, nextId: number): Row[] =>
  Array.from({ length: count }, (_, index) =>
    initRow(cols, `row-${nextId + index}`)
  );

function resetGame(
  rules: Rules,
  randomState: number,
  nextRowId = 0,
  nextBlockId = 0
): Game {
  return {
    status: "ready",
    rules,
    rows: makeRows(rules.cols, rules.rows, nextRowId),
    piece: null,
    queue: [],
    result: initResult(),
    randomState,
    nextRowId: nextRowId + rules.rows,
    nextBlockId,
    gravityIn: null,
    lockIn: null,
  };
}

export function createGame(
  overrides: Partial<Rules> = {},
  seed = Math.random() * RANDOM_RANGE
): Game {
  const rules = { ...DEFAULT_RULES, ...overrides };
  const { cols, rows, gravity, lockDelay, shapes } = rules;
  if (![cols, rows].every((size) => Number.isSafeInteger(size) && size > 0)) {
    throw new RangeError("Board dimensions must be positive integers");
  }
  if (gravity !== null && !(Number.isFinite(gravity) && gravity > 0)) {
    throw new RangeError("Gravity must be a positive duration or null");
  }
  if (!(Number.isFinite(lockDelay) && lockDelay >= 0)) {
    throw new RangeError("Lock delay must be a non-negative duration");
  }
  if (
    shapes.length === 0 ||
    shapes.some(
      (shape) =>
        !shape.some((row) => row.includes(1)) ||
        shape.some(
          (row) =>
            row.length !== shape[0].length ||
            row.some((cell) => cell !== 0 && cell !== 1)
        )
    )
  ) {
    throw new RangeError(
      "Expected at least one non-empty rectangular binary shape"
    );
  }
  if (!Number.isFinite(seed)) {
    throw new RangeError("Seed must be finite");
  }
  return resetGame(
    { ...rules, shapes: shapes.map((shape) => shape.map((row) => [...row])) },
    ((Math.trunc(seed) % RANDOM_RANGE) + RANDOM_RANGE) % RANDOM_RANGE
  );
}

function enqueue(game: Game): Game {
  // A 32-bit linear congruential generator. Each draw advances the seed once.
  const randomState =
    (game.randomState * 1_664_525 + 1_013_904_223) % RANDOM_RANGE;
  const { cols, shapes } = game.rules;
  const shape =
    shapes[Math.floor((randomState / RANDOM_RANGE) * shapes.length)];
  const spawnWidth = Math.max(Math.min(4, cols), shape[0].length);
  const block: Block = {
    id: `block-${game.nextBlockId}`,
    shape,
    position: { x: Math.max(0, Math.floor((cols - spawnWidth) / 2)), y: 0 },
  };
  return {
    ...game,
    randomState,
    nextBlockId: game.nextBlockId + 1,
    queue: [...game.queue, block],
  };
}

function fits(game: Game, block: Block): boolean {
  const { x, y } = block.position;
  const { cols, rows } = game.rules;
  return block.shape.every((row, dy) =>
    row.every((cell, dx) => {
      const col = x + dx;
      const line = y + dy;
      return (
        cell === 0 ||
        (col >= 0 &&
          col < cols &&
          line >= 0 &&
          line < rows &&
          game.rows[line].cells[col].blockId === null)
      );
    })
  );
}

const shift = (block: Block, { x, y }: BlockPosition): Block => ({
  ...block,
  position: { x: block.position.x + x, y: block.position.y + y },
});

function withPiece(game: Game, piece: Block): Game {
  const lockIn =
    game.rules.gravity !== null && !fits(game, shift(piece, STEPS.down))
      ? game.rules.lockDelay
      : null;
  return { ...game, piece, lockIn };
}

function move(game: Game, direction: Direction): Game {
  if (game.piece === null) {
    return game;
  }
  const piece = shift(game.piece, STEPS[direction]);
  return fits(game, piece) ? withPiece(game, piece) : game;
}

function rotate(game: Game): Game {
  if (game.piece === null) {
    return game;
  }
  const rotated = { ...game.piece, shape: rotateShape(game.piece.shape) };
  for (const offset of ROTATION_OFFSETS) {
    const piece = shift(rotated, offset);
    if (fits(game, piece)) {
      return withPiece(game, piece);
    }
  }
  return game;
}

function finish(game: Game, events: GameEvent[]): Game {
  events.push({ type: "finished" });
  return {
    ...game,
    status: "finished",
    piece: null,
    gravityIn: null,
    lockIn: null,
  };
}

function spawn(game: Game, events: GameEvent[]): Game {
  const [piece, ...queue] = game.queue;
  if (!(piece && fits(game, piece))) {
    return finish(game, events);
  }
  events.push({ type: "spawned", block: piece });
  return withPiece(enqueue({ ...game, queue }), piece);
}

function lock(game: Game, events: GameEvent[]): Game {
  const { piece } = game;
  if (piece === null) {
    return game;
  }
  events.push({ type: "locked", block: piece });

  const cleared: number[] = [];
  const remaining: Row[] = [];
  for (const [y, row] of game.rows.entries()) {
    const shapeRow = piece.shape[y - piece.position.y];
    const cells = shapeRow
      ? row.cells.map((cell, x) =>
          shapeRow[x - piece.position.x] === 1
            ? { ...cell, blockId: piece.id }
            : cell
        )
      : row.cells;
    if (cells.every((cell) => cell.blockId !== null)) {
      cleared.push(y);
    } else {
      remaining.push(cells === row.cells ? row : { ...row, cells });
    }
  }

  if (cleared.length > 0) {
    events.push({ type: "cleared", rows: cleared });
  }

  return {
    ...game,
    piece: null,
    lockIn: null,
    rows: [
      ...makeRows(game.rules.cols, cleared.length, game.nextRowId),
      ...remaining,
    ],
    result: scoreClear(game.result, cleared.length, game.rules.cols),
    nextRowId: game.nextRowId + cleared.length,
  };
}

export function msUntilNextStep(game: Game): number | null {
  if (game.status !== "playing" || game.gravityIn === null) {
    return null;
  }
  return Math.min(game.gravityIn, game.lockIn ?? game.gravityIn);
}

function advance(game: Game, ms: number, events: GameEvent[]): Game {
  if (!(Number.isFinite(ms) && ms >= 0)) {
    throw new RangeError("Elapsed time must be a non-negative finite duration");
  }
  let remaining = ms;
  let current = game;
  while (current.gravityIn !== null) {
    const deadline = msUntilNextStep(current);
    if (deadline === null) {
      break;
    }
    const elapsed = Math.min(deadline, remaining);
    if (elapsed > 0) {
      current = {
        ...current,
        gravityIn: current.gravityIn - elapsed,
        lockIn: current.lockIn === null ? null : current.lockIn - elapsed,
      };
      remaining -= elapsed;
    }
    if (elapsed < deadline) {
      break;
    }
    // Resolve the lock first when both deadlines coincide.
    if (current.lockIn === 0) {
      current = lock(current, events);
    }
    if (current.gravityIn === 0) {
      current = { ...current, gravityIn: current.rules.gravity };
      current = current.piece ? move(current, "down") : spawn(current, events);
    }
  }
  return current;
}

function apply(game: Game, command: Command, events: GameEvent[]): Game {
  const { rules, status, randomState, nextRowId, nextBlockId } = game;
  switch (command.type) {
    case "start": {
      let started = resetGame(rules, randomState, nextRowId, nextBlockId);
      for (let index = 0; index < QUEUE_SIZE; index += 1) {
        started = enqueue(started);
      }
      started = { ...started, status: "playing", gravityIn: rules.gravity };
      return rules.gravity === null ? spawn(started, events) : started;
    }
    case "reset":
      return resetGame(rules, randomState, nextRowId, nextBlockId);
    case "pause":
      return status === "playing" ? { ...game, status: "paused" } : game;
    case "resume":
      return status === "paused" ? { ...game, status: "playing" } : game;
    case "finish":
      return status === "playing" || status === "paused"
        ? finish(game, events)
        : game;
    default:
      break;
  }

  if (status !== "playing") {
    return game;
  }
  switch (command.type) {
    case "move":
      return move(game, command.direction);
    case "rotate":
      return rotate(game);
    case "place":
      return spawn(lock(game, events), events);
    case "skip":
      return spawn(game, events);
    case "advance":
      return advance(game, command.ms, events);
    default: {
      const exhaustive: never = command;
      return exhaustive;
    }
  }
}

export function step(
  game: Game,
  command: Command
): { game: Game; events: GameEvent[] } {
  const events: GameEvent[] = [];
  return { game: apply(game, command, events), events };
}

export function cellVariant(game: Game, x: number, y: number): CellVariant {
  if (game.rows[y]?.cells[x]?.blockId) {
    return "filled";
  }
  if (game.piece) {
    if (isFilledBlockCell(x, y, game.piece)) {
      return "active";
    }
    if (isCellBelowBlock(x, y, game.piece)) {
      return "belowActiveBlock";
    }
  }
  return "empty";
}
