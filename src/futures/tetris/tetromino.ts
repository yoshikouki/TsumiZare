import { id } from "./board";

export type TetrominoShape = number[][];
export type TetrominoPosition = { x: number; y: number };
export type Tetromino = {
  id: string;
  shape: TetrominoShape;
  position: TetrominoPosition;
};

type TetrominoType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

type Tetrominos = Record<TetrominoType, Tetromino["shape"]>;
export const TETROMINOS: Tetrominos = {
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
export const TETROMINO_TYPES = Object.keys(TETROMINOS) as TetrominoType[];

export const generateRandomTetromino = () => {
  const type =
    TETROMINO_TYPES[Math.floor(Math.random() * TETROMINO_TYPES.length)];
  return {
    id: id(),
    shape: TETROMINOS[type],
    position: { x: 3, y: 0 },
  };
};

export const rotateShape = (shape: TetrominoShape) => {
  // 90° clockwise rotation
  const newShape = shape[0].map((_, index) =>
    shape.map((row) => row[index]).reverse(),
  );
  return newShape;
};

export const isFilledTetrominoCell = (
  cellX: number,
  cellY: number,
  { position, shape }: Tetromino,
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
