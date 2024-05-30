import { id } from "./board";
import { DEFAULT_TETROMINO_QUEUE_SIZE } from "./constants";

export type BlockShape = number[][];
export type BlockPosition = { x: number; y: number };
export type Block = {
  id: string;
  shape: BlockShape;
  position: BlockPosition;
};

type BlockType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

type Blocks = Record<BlockType, Block["shape"]>;
export const BLOCKS: Blocks = {
  I: [[1, 1, 1, 1]],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
  ],
} as const;
export const TETROMINO_TYPES = Object.keys(BLOCKS) as BlockType[];

export const generateRandomBlock = () => {
  const type =
    TETROMINO_TYPES[Math.floor(Math.random() * TETROMINO_TYPES.length)];
  return {
    id: id(),
    shape: BLOCKS[type],
    position: { x: 3, y: 0 },
  };
};

export const generateQueuedBlocks = (count = DEFAULT_TETROMINO_QUEUE_SIZE) => {
  const blocks = Array.from({ length: count }, generateRandomBlock);
  return blocks;
};

export const rotateShape = (shape: BlockShape) => {
  // 90° clockwise rotation
  const newShape = shape[0].map((_, index) =>
    shape.map((row) => row[index]).reverse(),
  );
  return newShape;
};

export const isFilledBlockCell = (
  cellX: number,
  cellY: number,
  { position, shape }: Block,
) => {
  const maxX = position.x + shape[0].length;
  const maxY = position.y + shape.length;
  if (
    !(
      position.x <= cellX &&
      cellX < maxX &&
      position.y <= cellY &&
      cellY < maxY
    )
  ) {
    return false;
  }
  return shape[cellY - position.y][cellX - position.x] === 1;
};

export const isCellBelowBlock = (
  cellX: number,
  cellY: number,
  block: Block,
) => {
  const { position, shape } = block;
  const maxX = position.x + shape[0].length;
  const isOutside = cellX < position.x || maxX <= cellX;
  const isAbove = cellY <= position.y;
  const shapeY = cellY - position.y;
  if (isOutside || isAbove || shapeY === 0) {
    return false;
  }
  return (
    shape[shapeY]?.[cellX - position.x] !== 1 &&
    (shape[shapeY + 1] === undefined ||
      shape[shapeY + 1]?.[cellX - position.x] !== 1)
  );
};
