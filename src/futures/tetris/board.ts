import { COLS, ROWS } from "./constants";

export type Cell = {
  id: string;
  tetrominoId: string | null;
};

export type Row = {
  id: string;
  cells: Cell[];
};

export type Board = {
  id: string;
  rows: Row[];
  rowsNumber: number;
  colsNumber: number;
  status: "ready" | "playing" | "finished" | "pause";
};

export const id = () => Math.random().toString(36).substr(2, 9);
export const initCell = () => ({
  id: id(),
  tetrominoId: null,
});
export const initRow = (colsNumber = COLS) => ({
  id: id(),
  cells: Array.from({ length: colsNumber }, initCell),
});
export const initBoard = (rowsNumber = ROWS, colsNumber = COLS): Board => ({
  id: id(),
  rows: Array.from({ length: rowsNumber }, () => initRow(colsNumber)),
  rowsNumber,
  colsNumber,
  status: "ready",
});

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

export const renewFilledRows = (board: Board): Board => {
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
