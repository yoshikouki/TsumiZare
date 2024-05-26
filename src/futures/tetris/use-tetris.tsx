import { useEffect, useState } from "react";

export const ROWS = 20;
export const COLS = 10;
const DROP_INTERVAL = 1000;

const INITIAL_BOARD: Board = {
  id: crypto.randomUUID(),
  rows: Array.from({ length: ROWS }, () => ({
    id: crypto.randomUUID(),
    cells: Array.from({ length: COLS }, () => ({
      id: crypto.randomUUID(),
      tetrominoId: null,
    })),
  })),
};

const deepCopyBoard = (board: Board): Board => {
  return {
    id: board.id,
    rows: board.rows.map((row) => ({
      id: row.id,
      cells: row.cells.map((cell) => ({
        id: cell.id,
        tetrominoId: cell.tetrominoId,
      })),
    })),
  };
};

type Cell = {
  id: string;
  tetrominoId: string | null;
};

type Row = {
  id: string;
  cells: Cell[];
};

type Board = {
  id: string;
  rows: Row[];
};

export type TetrominoShape = number[][];
type TetrominoPosition = { x: number; y: number };
type Tetromino = {
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

const generateRandomTetromino = () => {
  const type =
    TETROMINO_TYPES[Math.floor(Math.random() * TETROMINO_TYPES.length)];
  return {
    id: crypto.randomUUID(),
    shape: TETROMINOS[type],
    position: { x: 3, y: 0 },
  };
};

const rotateShape = (shape: TetrominoShape) => {
  // 90度時計回りに回転
  const newShape = shape[0].map((_, index) =>
    shape.map((row) => row[index]).reverse(),
  );
  return newShape;
};

export const useTetris = () => {
  const [board, setBoard] = useState<Board>(INITIAL_BOARD);
  const [activeTetromino, setActiveTetromino] = useState<Tetromino | null>(
    null,
  );

  const mergeTetrominoIntoBoard = (tetromino: Tetromino) => {
    const newBoard = deepCopyBoard(board);
    for (let shapeY = 0; shapeY < tetromino.shape.length; shapeY++) {
      const row = tetromino.shape[shapeY];
      for (let shapeX = 0; shapeX < row.length; shapeX++) {
        if (row[shapeX] === 0) {
          continue;
        }
        newBoard.rows[tetromino.position.y + shapeY].cells[
          tetromino.position.x + shapeX
        ].tetrominoId = tetromino.id;
      }
    }
    setBoard(newBoard);
    setActiveTetromino(null);
    return newBoard;
  };

  const dropTetromino = () => {
    if (!activeTetromino) {
      setActiveTetromino(generateRandomTetromino());
      return;
    }
    const { position } = activeTetromino;
    const newPosition = { ...position, y: position.y + 1 };
    if (checkCollision(activeTetromino.shape, newPosition)) {
      mergeTetrominoIntoBoard(activeTetromino);
      return;
    }
    setActiveTetromino({ ...activeTetromino, position: newPosition });
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
        const cellX = position.x + shapeX;
        const cellY = position.y + shapeY;
        if (
          cellX < 0 ||
          COLS <= cellX ||
          ROWS <= cellY ||
          board.rows[cellY].cells[cellX].tetrominoId
        ) {
          return true;
        }
      }
    }
    return false;
  };

  const moveActiveTetromino = (direction: "left" | "right" | "down") => {
    if (!activeTetromino) return;
    const { position } = activeTetromino;
    const newPosition =
      direction === "left"
        ? { ...position, x: position.x - 1 }
        : direction === "right"
          ? { ...position, x: position.x + 1 }
          : { ...position, y: position.y + 1 };
    if (checkCollision(activeTetromino.shape, newPosition)) {
      return;
    }
    setActiveTetromino({ ...activeTetromino, position: newPosition });
  };

  const rotateActiveTetromino = () => {
    if (!activeTetromino) return;
    setActiveTetromino({
      ...activeTetromino,
      shape: rotateShape(activeTetromino.shape),
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          moveActiveTetromino("left");
          break;
        case "ArrowRight":
          moveActiveTetromino("right");
          break;
        case "ArrowDown":
          moveActiveTetromino("down");
          break;
        case "ArrowUp":
          rotateActiveTetromino();
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [moveActiveTetromino, rotateActiveTetromino]);

  useEffect(() => {
    const interval = setInterval(() => {
      dropTetromino();
    }, DROP_INTERVAL);
    return () => clearInterval(interval);
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
