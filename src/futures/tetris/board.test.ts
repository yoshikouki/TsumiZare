import { describe, expect, it } from "bun:test";
import { BLOCKS } from "./block";
import {
  deepCopyBoard,
  hasBlockCollision,
  initBoard,
  initCell,
  initRow,
  mergeBlockIntoBoard,
  renewFilledRows,
} from "./board";

describe("Board", () => {
  describe("initCell", () => {
    it("should initialize a cell with null blockId", () => {
      const cell = initCell();
      expect(cell).toHaveProperty("id");
      expect(cell.blockId).toBeNull();
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

  describe("mergeBlockIntoBoard", () => {
    it("should merge the block into the board", () => {
      const block = {
        id: "testId",
        shape: BLOCKS.I,
        position: { x: 2, y: 3 },
      };
      const board = initBoard();
      const mergedBoard = mergeBlockIntoBoard(block, board);
      expect(mergedBoard.rows[3].cells[2].blockId).toBe(block.id);
      expect(mergedBoard.rows[3].cells[3].blockId).toBe(block.id);
      expect(mergedBoard.rows[3].cells[4].blockId).toBe(block.id);
      expect(mergedBoard.rows[3].cells[5].blockId).toBe(block.id);
    });
  });

  describe("renewFilledRows", () => {
    it("should not remove any rows and return board as it is if there are no filled rows", () => {
      const initialBoard = initBoard();
      initialBoard.rows[0].cells[0].blockId = "testId";
      initialBoard.rows[0].cells[1].blockId = "testId";
      initialBoard.rows[0].cells[2].blockId = "testId";
      const { board, filledRowsNumber } = renewFilledRows(initialBoard);
      expect(filledRowsNumber).toBe(0);
      expect(board).toEqual(initialBoard);
      expect(board.rows[0].cells[0].blockId).toBe("testId");
      expect(board.rows[0].cells[1].blockId).toBe("testId");
      expect(board.rows[0].cells[2].blockId).toBe("testId");
      expect(board.rows[1].cells[0].blockId).toBeNull();
    });

    it("should remove filled rows and add new empty rows at the top", () => {
      const initialBoard = initBoard();
      for (let i = 0; i < initialBoard.config.colsNumber; i++) {
        initialBoard.rows[0].cells[i].blockId = "testId";
      }
      const { board, filledRowsNumber } = renewFilledRows(initialBoard);
      expect(filledRowsNumber).toBe(1);
      expect(board).not.toEqual(initialBoard);
      expect(board.rows[0].cells[0].blockId).toBeNull();
      expect(board.rows[0].id).not.toBe(initialBoard.rows[0].id);
    });
  });

  describe("hasBlockCollision", () => {
    it("should return true if there is a collision between the block and the board", () => {
      const block = {
        shape: BLOCKS.I,
        position: { x: 2, y: 3 },
      };
      const board = initBoard();
      board.rows[3].cells[2].blockId = "testId";
      const hasCollision = hasBlockCollision(block, board);
      expect(hasCollision).toBe(true);
    });

    it("should return false if there is no collision between the block and the board", () => {
      const block = {
        shape: BLOCKS.I,
        position: { x: 2, y: 3 },
      };
      const board = initBoard();
      const hasCollision = hasBlockCollision(block, board);
      expect(hasCollision).toBe(false);
    });
  });
});
