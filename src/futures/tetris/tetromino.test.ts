import { describe, expect, it } from "bun:test";
import {
  TETROMINOS,
  type Tetromino,
  type TetrominoShape,
  generateRandomTetromino,
  isFilledTetrominoCell,
  rotateShape,
} from "./tetromino";

describe("Tetromino", () => {
  describe("generateRandomTetromino", () => {
    it("should generate a random tetromino", () => {
      const randomTetromino = generateRandomTetromino();
      expect(randomTetromino).toHaveProperty("id");
      expect(randomTetromino).toHaveProperty("shape");
      expect(randomTetromino).toHaveProperty("position");
    });
  });

  describe("rotateShape", () => {
    it("should rotate the shape 90 degrees clockwise", () => {
      const shape: TetrominoShape = [
        // T shape
        [1, 1, 1],
        [0, 1, 0],
      ];
      const rotatedShape = rotateShape(shape);
      expect(rotatedShape).toEqual([
        [0, 1],
        [1, 1],
        [0, 1],
      ]);
    });
  });

  describe("#isFilledTetrominoCell", () => {
    it("should return correct result", () => {
      const tetromino = {
        id: "testId",
        shape: TETROMINOS.Z,
        position: { x: 1, y: 1 },
      };
      expect(isFilledTetrominoCell(0, 0, tetromino)).toBe(false);
      expect(isFilledTetrominoCell(1, 0, tetromino)).toBe(false);
      expect(isFilledTetrominoCell(0, 1, tetromino)).toBe(false);
      expect(isFilledTetrominoCell(1, 1, tetromino)).toBe(true);
      expect(isFilledTetrominoCell(2, 1, tetromino)).toBe(true);
      expect(isFilledTetrominoCell(3, 1, tetromino)).toBe(false);
      expect(isFilledTetrominoCell(1, 2, tetromino)).toBe(false);
      expect(isFilledTetrominoCell(2, 2, tetromino)).toBe(true);
      expect(isFilledTetrominoCell(3, 2, tetromino)).toBe(true);
      expect(isFilledTetrominoCell(4, 2, tetromino)).toBe(false);
      expect(isFilledTetrominoCell(2, 3, tetromino)).toBe(false);
      expect(isFilledTetrominoCell(3, 3, tetromino)).toBe(false);
    });
  });
});
