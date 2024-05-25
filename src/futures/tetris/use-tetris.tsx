import { useEffect, useState } from "react";

export const ROWS = 20;
export const COLS = 10;
const DROP_INTERVAL = 1000;
const INITIAL_BOARD: TetrominoShape = Array.from({ length: ROWS }, () =>
  Array(COLS).fill(0),
);

export type TetrominoShape = number[][];
type TetrominoPosition = { x: number; y: number };
type Tetromino = {
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

export const useTetris = () => {
  const [board, setBoard] = useState(INITIAL_BOARD);
  const [activeTetromino, setActiveTetromino] = useState<Tetromino | null>(
    null,
  );

  const generateRandomTetromino = () => {
    const type =
      TETROMINO_TYPES[Math.floor(Math.random() * TETROMINO_TYPES.length)];
    return { shape: TETROMINOS[type], position: { x: 3, y: 0 } };
  };

  const mergeTetrominoIntoBoard = (
    shape: TetrominoShape,
    position: TetrominoPosition,
  ) => {
    const newBoard: TetrominoShape = board.map((row) => [...row]);
    for (let shapeY = 0; shapeY < shape.length; shapeY++) {
      const row = shape[shapeY];
      for (let shapeX = 0; shapeX < row.length; shapeX++) {
        if (row[shapeX] === 0) {
          continue;
        }
        newBoard[position.y + shapeY][position.x + shapeX] = row[shapeX];
      }
    }
    setBoard(newBoard);
    setActiveTetromino(null);
    return newBoard;
  };

  const dropTetromino = () => {
    if (!activeTetromino) {
      setActiveTetromino(generateRandomTetromino());
    } else {
      const { shape, position } = activeTetromino;
      const newPosition = { x: position.x, y: position.y + 1 };
      if (!checkCollision(shape, newPosition)) {
        setActiveTetromino({ shape, position: newPosition });
      } else {
        mergeTetrominoIntoBoard(shape, position);
      }
    }
  };

  const checkCollision = (
    shape: TetrominoShape,
    position: TetrominoPosition,
  ) => {
    for (let shapeY = 0; shapeY < shape.length; shapeY++) {
      const row = shape[shapeY];
      for (let shapeX = 0; shapeX < row.length; shapeX++) {
        if (row[shapeX] === 0) {
          continue;
        }
        if (
          position.x + shapeX < 0 ||
          position.x + shapeX >= COLS ||
          position.y + shapeY >= ROWS ||
          board[position.y + shapeY]?.[position.x + shapeX] !== 0
        ) {
          return true;
        }
      }
    }
    return false;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      dropTetromino();
    }, DROP_INTERVAL);
    return () => {
      clearInterval(interval);
    };
  }, [dropTetromino]);

  return {
    board,
    activeTetromino,
    generateRandomTetromino,
    mergeTetrominoIntoBoard,
    dropTetromino,
    checkCollision,
  };
};
