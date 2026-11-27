import { type Block, type BlockPosition, rotateShape } from "./block.js";
import {
  type Board,
  hasBlockCollision,
  mergeBlockIntoBoard,
  renewFilledRows,
} from "./board.js";
import { LOCK_RESET_LIMIT, WALL_KICKS } from "./constants.js";
import { calculateNewResult } from "./result.js";

export interface Game {
  board: Board;
  activeBlock: Block | null;
  queuedBlocks: Block[];
  lockResets: number;
}

export type Direction = "left" | "right" | "down" | "up";

export type GameAction =
  | { type: "start"; board: Board; queuedBlocks: Block[] }
  | { type: "reset"; board: Board }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "finish" }
  | { type: "move"; direction: Direction }
  | { type: "rotate" }
  | { type: "tick"; nextBlock: Block }
  | { type: "lock" }
  | { type: "place"; nextBlock: Block }
  | { type: "activate"; nextBlock: Block };

const STEPS: Record<Direction, BlockPosition> = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  down: { x: 0, y: 1 },
  up: { x: 0, y: -1 },
};

export const initGame = (board: Board): Game => ({
  board,
  activeBlock: null,
  queuedBlocks: [],
  lockResets: 0,
});

const fits = (block: Block, board: Board) => !hasBlockCollision(block, board);

const shift = (block: Block, step: BlockPosition): Block => ({
  ...block,
  position: { x: block.position.x + step.x, y: block.position.y + step.y },
});

export const isGrounded = ({ activeBlock, board }: Game) =>
  !!activeBlock && !fits(shift(activeBlock, STEPS.down), board);

const moveBlock = (game: Game, direction: Direction): Game => {
  if (!game.activeBlock) {
    return game;
  }
  const moved = shift(game.activeBlock, STEPS[direction]);
  return fits(moved, game.board) ? { ...game, activeBlock: moved } : game;
};

const rotateBlock = (game: Game): Game => {
  if (!game.activeBlock) {
    return game;
  }
  const rotated = {
    ...game.activeBlock,
    shape: rotateShape(game.activeBlock.shape),
  };
  const kicked = [{ x: 0, y: 0 }, ...WALL_KICKS]
    .map((kick) => shift(rotated, kick))
    .find((candidate) => fits(candidate, game.board));
  return kicked ? { ...game, activeBlock: kicked } : game;
};

// A move or rotation of a grounded block restarts its lock delay, up to
// LOCK_RESET_LIMIT times.
const steer = (game: Game, steered: Game): Game =>
  steered !== game && isGrounded(game) && game.lockResets < LOCK_RESET_LIMIT
    ? { ...steered, lockResets: game.lockResets + 1 }
    : steered;

const land = (game: Game): Game => {
  if (!game.activeBlock) {
    return game;
  }
  const { board, filledRowsNumber } = renewFilledRows(
    mergeBlockIntoBoard(game.activeBlock, game.board)
  );
  return {
    ...game,
    activeBlock: null,
    board: {
      ...board,
      result: calculateNewResult({ filledRowsNumber }, board.result, board),
    },
  };
};

const activateOrFinish = (game: Game, nextBlock: Block): Game => {
  const [block, ...rest] = game.queuedBlocks;
  if (!(block && fits(block, game.board))) {
    return finish(game);
  }
  return {
    ...game,
    activeBlock: block,
    queuedBlocks: [...rest, nextBlock],
    lockResets: 0,
  };
};

const finish = (game: Game): Game => ({
  ...game,
  activeBlock: null,
  board: { ...game.board, status: "finished" },
});

// A grounded block stays until the lock action, which comes LOCK_DELAY after
// it touched down or after its last move.
const tick = (game: Game, nextBlock: Block): Game =>
  game.activeBlock
    ? moveBlock(game, "down")
    : activateOrFinish(game, nextBlock);

const play = (game: Game, action: GameAction): Game => {
  switch (action.type) {
    case "move":
      return steer(game, moveBlock(game, action.direction));
    case "rotate":
      return steer(game, rotateBlock(game));
    case "tick":
      return tick(game, action.nextBlock);
    case "lock":
      return isGrounded(game) ? land(game) : game;
    case "place":
      return activateOrFinish(land(game), action.nextBlock);
    case "activate":
      return activateOrFinish(game, action.nextBlock);
    default:
      return game;
  }
};

export const gameReducer = (game: Game, action: GameAction): Game => {
  const { status } = game.board;
  switch (action.type) {
    case "start":
      return {
        ...initGame({ ...action.board, status: "playing" }),
        queuedBlocks: action.queuedBlocks,
      };
    case "reset":
      return initGame(action.board);
    case "pause":
      return status === "playing"
        ? { ...game, board: { ...game.board, status: "pause" } }
        : game;
    case "resume":
      return status === "pause"
        ? { ...game, board: { ...game.board, status: "playing" } }
        : game;
    case "finish":
      return status === "playing" || status === "pause" ? finish(game) : game;
    default:
      return status === "playing" ? play(game, action) : game;
  }
};
