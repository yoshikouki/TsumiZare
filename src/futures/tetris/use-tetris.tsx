import { useEffect, useState } from "react";

export const ROWS = 20;
export const COLS = 10;
const DROP_INTERVAL = 333;
const SWIPE_THRESHOLD = 30;

const id = () => crypto.randomUUID();
const initCell = () => ({
  id: id(),
  tetrominoId: null,
});
const initRow = (colsNumber = COLS) => ({
  id: id(),
  cells: Array.from({ length: colsNumber }, initCell),
});
const initBoard = (rowsNumber = ROWS, colsNumber = COLS): Board => ({
  id: id(),
  rows: Array.from({ length: rowsNumber }, () => initRow(colsNumber)),
  rowsNumber,
  colsNumber,
  status: "ready",
});

const deepCopyBoard = (board: Board): Board => {
  return {
    ...board,
    rows: board.rows.map((row) => ({
      ...row,
      cells: row.cells.map((cell) => ({
        ...cell,
      })),
    })),
  };
};

const renewFilledRows = (board: Board): Board => {
  const remainingRows = board.rows.filter((row) =>
    row.cells.some((cell) => !cell.tetrominoId),
  );
  const clearedRowsCount = board.rowsNumber - remainingRows.length;
  if (clearedRowsCount === 0) return board;
  const newBoard = {
    ...board,
    rows: [
      ...Array.from({ length: clearedRowsCount }, () =>
        initRow(board.colsNumber),
      ),
      ...remainingRows,
    ],
  };
  return newBoard;
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
  rowsNumber: number;
  colsNumber: number;
  status: "ready" | "playing" | "finished" | "pause";
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

const WALL_KICKS = [
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: -1 },
  { x: -1, y: -1 },
  { x: 1, y: -1 },
  { x: -3, y: 0 }, // For I tetromino on the right wall
];

export const useTetris = () => {
  const [board, setBoard] = useState<Board>(initBoard);
  const [activeTetromino, setActiveTetromino] = useState<Tetromino | null>(
    null,
  );

  const startTetris = () => {
    setBoard({ ...initBoard(), status: "playing" });
    setActiveTetromino(null);
  };

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
    return newBoard;
  };

  const clearFilledRows = (board: Board) => {
    const newBoard = renewFilledRows(board);
    setBoard(newBoard);
    return newBoard;
  };

  const dropTetromino = () => {
    if (!activeTetromino) {
      const newTetromino = generateRandomTetromino();
      if (checkCollision(newTetromino.shape, newTetromino.position)) {
        setBoard({ ...board, status: "finished" });
      } else {
        setActiveTetromino(newTetromino);
      }
      return;
    }
    const { position } = activeTetromino;
    const newPosition = { ...position, y: position.y + 1 };
    if (checkCollision(activeTetromino.shape, newPosition)) {
      const mergedBoard = mergeTetrominoIntoBoard(activeTetromino);
      clearFilledRows(mergedBoard);
      setActiveTetromino(null);
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

  const tryWallKick = (shape: TetrominoShape, position: TetrominoPosition) => {
    for (let i = 0; i < WALL_KICKS.length; i++) {
      const newPosition = {
        x: position.x + WALL_KICKS[i].x,
        y: position.y + WALL_KICKS[i].y,
      };
      if (!checkCollision(shape, newPosition)) {
        return newPosition;
      }
    }
    return null;
  };

  const rotateActiveTetromino = () => {
    if (!activeTetromino) return;
    const rotatedShape = rotateShape(activeTetromino.shape);
    if (!checkCollision(rotatedShape, activeTetromino.position)) {
      setActiveTetromino({
        ...activeTetromino,
        shape: rotatedShape,
      });
      return;
    }
    const newPosition = tryWallKick(rotatedShape, activeTetromino.position);
    if (!newPosition) return;
    setActiveTetromino({
      ...activeTetromino,
      shape: rotatedShape,
      position: newPosition,
    });
  };

  const isActiveTetromino = (cellX: number, cellY: number) => {
    if (!activeTetromino) return false;
    return isFilledTetrominoCell(cellX, cellY, activeTetromino);
  };

  // Keyboard event
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

  // Touch event
  const boardRef = (ref: HTMLDivElement) => {
    let touchStartX = 0;
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length !== 1) {
        return;
      }
      const touch = e.touches[0];
      const touchEndX = touch.clientX;
      const touchEndY = touch.clientY;
      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      if (Math.max(absDx, absDy) < SWIPE_THRESHOLD) {
        return;
      }
      if (absDx > absDy) {
        // Horizontal swipe
        if (dx > 0) {
          moveActiveTetromino("right");
        } else {
          moveActiveTetromino("left");
        }
      } else if (absDy < SWIPE_THRESHOLD * 3) {
        // Vertical swipe
        if (dy > 0) {
          moveActiveTetromino("down");
        } else {
          rotateActiveTetromino();
        }
      }
      // Re-init new touch start position after each move to allow continuous movement.
      touchStartX = touchEndX;
      touchStartY = touchEndY;
    };
    ref.addEventListener("touchstart", handleTouchStart);
    ref.addEventListener("touchmove", handleTouchMove);
    return () => {
      ref.removeEventListener("touchstart", handleTouchStart);
      ref.removeEventListener("touchmove", handleTouchMove);
    };
  };

  //
  useEffect(() => {
    if (board.status !== "playing") return;
    const interval = setInterval(() => {
      dropTetromino();
    }, DROP_INTERVAL);
    return () => clearInterval(interval);
  }, [dropTetromino, board.status]);

  return {
    board,
    activeTetromino,
    boardRef,
    startTetris,
    generateRandomTetromino,
    mergeTetrominoIntoBoard,
    dropTetromino,
    checkCollision,
    rotateActiveTetromino,
    isActiveTetromino,
  };
};
