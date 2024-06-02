import { COLS, DROP_INTERVAL, ROWS } from "./constants";
import { type Result, initResult } from "./result";

import type { Block } from "./block";

export type Cell = {
  id: string;
  blockId: string | null;
};

export type Row = {
  id: string;
  cells: Cell[];
};

export type BoardConfig = {
  rowsNumber: number;
  colsNumber: number;
  dropInterval: number;
};
export type Board = {
  id: string;
  rows: Row[];
  status: "ready" | "playing" | "finished" | "pause";
  result: Result;
  config: BoardConfig;
};

export const id = () => Math.random().toString(36).substr(2, 9);
export const initCell = () => ({
  id: id(),
  blockId: null,
});
export const initRow = (colsNumber = COLS) => ({
  id: id(),
  cells: Array.from({ length: colsNumber }, initCell),
});
export const initBoard = (config?: Partial<BoardConfig>): Board => {
  const rowsNumber = config?.rowsNumber ?? ROWS;
  const colsNumber = config?.colsNumber ?? COLS;
  const dropInterval = config?.dropInterval ?? DROP_INTERVAL;
  return {
    id: id(),
    rows: Array.from({ length: rowsNumber }, () => initRow(colsNumber)),
    status: "ready",
    result: initResult(),
    config: {
      rowsNumber,
      colsNumber,
      dropInterval,
    },
  };
};

export const deepCopyBoard = (board: Board): Board => {
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

export const mergeBlockIntoBoard = (block: Block, board: Board) => {
  const newBoard = deepCopyBoard(board);
  for (let shapeY = 0; shapeY < block.shape.length; shapeY++) {
    const row = block.shape[shapeY];
    for (let shapeX = 0; shapeX < row.length; shapeX++) {
      if (row[shapeX] === 0) {
        continue;
      }
      newBoard.rows[block.position.y + shapeY].cells[
        block.position.x + shapeX
      ].blockId = block.id;
    }
  }
  return newBoard;
};

export const renewFilledRows = (
  board: Board,
): {
  board: Board;
  filledRowsNumber: number;
} => {
  const remainingRows = board.rows.filter((row) =>
    row.cells.some((cell) => !cell.blockId),
  );
  const filledRowsNumber = board.config.rowsNumber - remainingRows.length;
  if (filledRowsNumber === 0) return { board, filledRowsNumber };
  const newBoard = {
    ...board,
    rows: [
      ...Array.from({ length: filledRowsNumber }, () =>
        initRow(board.config.colsNumber),
      ),
      ...remainingRows,
    ],
  };
  return {
    board: newBoard,
    filledRowsNumber,
  };
};

export const hasBlockCollision = (
  block: {
    shape: Block["shape"];
    position: Block["position"];
  },
  board: Board,
) => {
  const { shape, position } = block;
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
        cellY < 0 ||
        ROWS <= cellY ||
        board.rows[cellY].cells[cellX].blockId
      ) {
        return true;
      }
    }
  }
  return false;
};
