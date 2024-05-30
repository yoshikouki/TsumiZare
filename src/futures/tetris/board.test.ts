import { describe, expect, it } from "bun:test";
import {
  deepCopyBoard,
  hasTetrominoCollision,
  initBoard,
  initCell,
  initRow,
  mergeTetrominoIntoBoard,
  renewFilledRows,
} from "./board";
import { TETROMINOS } from "./tetromino";

describe("Board", () => {
  describe("initCell", () => {
    it("should initialize a cell with null tetrominoId", () => {
      const cell = initCell();
      expect(cell).toHaveProperty("id");
      expect(cell.tetrominoId).toBeNull();
    });
  });

  describe("initRow", () => {
    it("should initialize a row with the specified number of cells", () => {
      const colsNumber = 5;
      const row = initRow(colsNumber);
      expect(row).toHaveProperty("id");
      expect(row.cells).toHaveLength(colsNumber);
    });
  });

  describe("initBoard", () => {
    it("should initialize a board with the specified number of rows and columns", () => {
      const rowsNumber = 10;
      const colsNumber = 8;
      const board = initBoard({ rowsNumber, colsNumber });
      expect(board).toHaveProperty("id");
      expect(board.rows).toHaveLength(rowsNumber);
      expect(board.config.colsNumber).toBe(colsNumber);
      expect(board.status).toBe("ready");
    });
  });

  describe("deepCopyBoard", () => {
    it("should create a deep copy of the board", () => {
      const board = initBoard();
      const copiedBoard = deepCopyBoard(board);
      expect(copiedBoard).toEqual(board);
      expect(copiedBoard).not.toBe(board);
      expect(copiedBoard.rows).not.toBe(board.rows);
      expect(copiedBoard.rows[0]).not.toBe(board.rows[0]);
      expect(copiedBoard.rows[0].cells).not.toBe(board.rows[0].cells);
    });
  });

  describe("mergeTetrominoIntoBoard", () => {
    it("should merge the tetromino into the board", () => {
      const tetromino = {
        id: "testId",
        shape: TETROMINOS.I,
        position: { x: 2, y: 3 },
      };
      const board = initBoard();
      const mergedBoard = mergeTetrominoIntoBoard(tetromino, board);
      expect(mergedBoard.rows[3].cells[2].tetrominoId).toBe(tetromino.id);
      expect(mergedBoard.rows[3].cells[3].tetrominoId).toBe(tetromino.id);
      expect(mergedBoard.rows[3].cells[4].tetrominoId).toBe(tetromino.id);
      expect(mergedBoard.rows[3].cells[5].tetrominoId).toBe(tetromino.id);
    });
  });

  describe("renewFilledRows", () => {
    it("should not remove any rows and return board as it is if there are no filled rows", () => {
      const initialBoard = initBoard();
      initialBoard.rows[0].cells[0].tetrominoId = "testId";
      initialBoard.rows[0].cells[1].tetrominoId = "testId";
      initialBoard.rows[0].cells[2].tetrominoId = "testId";
      const { board, filledRowsNumber } = renewFilledRows(initialBoard);
      expect(filledRowsNumber).toBe(0);
      expect(board).toEqual(initialBoard);
      expect(board.rows[0].cells[0].tetrominoId).toBe("testId");
      expect(board.rows[0].cells[1].tetrominoId).toBe("testId");
      expect(board.rows[0].cells[2].tetrominoId).toBe("testId");
      expect(board.rows[1].cells[0].tetrominoId).toBeNull();
    });

    it("should remove filled rows and add new empty rows at the top", () => {
      const initialBoard = initBoard();
      for (let i = 0; i < initialBoard.config.colsNumber; i++) {
        initialBoard.rows[0].cells[i].tetrominoId = "testId";
      }
      const { board, filledRowsNumber } = renewFilledRows(initialBoard);
      expect(filledRowsNumber).toBe(1);
      expect(board).not.toEqual(initialBoard);
      expect(board.rows[0].cells[0].tetrominoId).toBeNull();
      expect(board.rows[0].id).not.toBe(initialBoard.rows[0].id);
    });
  });

  describe("hasTetrominoCollision", () => {
    it("should return true if there is a collision between the tetromino and the board", () => {
      const tetromino = {
        shape: TETROMINOS.I,
        position: { x: 2, y: 3 },
      };
      const board = initBoard();
      board.rows[3].cells[2].tetrominoId = "testId";
      const hasCollision = hasTetrominoCollision(tetromino, board);
      expect(hasCollision).toBe(true);
    });

    it("should return false if there is no collision between the tetromino and the board", () => {
      const tetromino = {
        shape: TETROMINOS.I,
        position: { x: 2, y: 3 },
      };
      const board = initBoard();
      const hasCollision = hasTetrominoCollision(tetromino, board);
      expect(hasCollision).toBe(false);
    });
  });
});
