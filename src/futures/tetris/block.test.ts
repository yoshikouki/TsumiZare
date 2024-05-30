import { describe, expect, it } from "bun:test";
import {
  BLOCKS,
  type Block,
  type BlockShape,
  generateRandomBlock,
  isCellBelowBlock,
  isFilledBlockCell,
  rotateShape,
} from "./block";

describe("Block", () => {
  describe("generateRandomBlock", () => {
    it("should generate a random block", () => {
      const randomBlock = generateRandomBlock();
      expect(randomBlock).toHaveProperty("id");
      expect(randomBlock).toHaveProperty("shape");
      expect(randomBlock).toHaveProperty("position");
    });
  });

  describe("rotateShape", () => {
    it("should rotate the shape 90 degrees clockwise", () => {
      const shape: BlockShape = [
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

  describe("#isFilledBlockCell", () => {
    it("should return correct result", () => {
      const block = {
        id: "testId",
        shape: BLOCKS.Z,
        position: { x: 1, y: 1 },
      };
      expect(isFilledBlockCell(0, 0, block)).toBe(false);
      expect(isFilledBlockCell(1, 0, block)).toBe(false);
      expect(isFilledBlockCell(0, 1, block)).toBe(false);
      expect(isFilledBlockCell(1, 1, block)).toBe(true);
      expect(isFilledBlockCell(2, 1, block)).toBe(true);
      expect(isFilledBlockCell(3, 1, block)).toBe(false);
      expect(isFilledBlockCell(1, 2, block)).toBe(false);
      expect(isFilledBlockCell(2, 2, block)).toBe(true);
      expect(isFilledBlockCell(3, 2, block)).toBe(true);
      expect(isFilledBlockCell(4, 2, block)).toBe(false);
      expect(isFilledBlockCell(2, 3, block)).toBe(false);
      expect(isFilledBlockCell(3, 3, block)).toBe(false);
    });
  });

  describe("#isCellBelowBlock", () => {
    it("should return true if the cell is below the block", () => {
      const block: Block = {
        id: "test",
        shape: [[1, 1, 1, 1]],
        position: { x: 1, y: 1 },
      };
      expect(isCellBelowBlock(1, 2, block)).toBe(true);
      expect(isCellBelowBlock(4, 2, block)).toBe(true);
    });

    it("should return false if the cell is not on the block", () => {
      const block: Block = {
        id: "test",
        shape: [[1, 1, 1, 1]],
        position: { x: 1, y: 1 },
      };
      expect(isCellBelowBlock(1, 1, block)).toBe(false);
      expect(isCellBelowBlock(4, 1, block)).toBe(false);
    });

    it("should return false if the cell is not side and below the block", () => {
      const block: Block = {
        id: "test",
        shape: [[1, 1, 1, 1]],
        position: { x: 1, y: 1 },
      };
      expect(isCellBelowBlock(0, 2, block)).toBe(false);
      expect(isCellBelowBlock(5, 2, block)).toBe(false);
    });

    it("should correctly return if the shape is T shape", () => {
      const block: Block = {
        id: "test",
        shape: [
          // T shape
          [0, 1],
          [1, 1],
          [0, 1],
        ],
        position: { x: 1, y: 1 },
      };
      expect(isCellBelowBlock(1, 1, block)).toBe(false);
      expect(isCellBelowBlock(1, 2, block)).toBe(false);
      expect(isCellBelowBlock(1, 3, block)).toBe(true);
      expect(isCellBelowBlock(2, 1, block)).toBe(false);
      expect(isCellBelowBlock(2, 2, block)).toBe(false);
      expect(isCellBelowBlock(2, 3, block)).toBe(false);
    });

    it("should correctly return if the shape is J shape", () => {
      const block: Block = {
        id: "test",
        shape: [
          // J shape
          [0, 1],
          [0, 1],
          [1, 1],
        ],
        position: { x: 1, y: 1 },
      };
      expect(isCellBelowBlock(1, 1, block)).toBe(false);
      expect(isCellBelowBlock(1, 2, block)).toBe(false);
      expect(isCellBelowBlock(1, 3, block)).toBe(false);
      expect(isCellBelowBlock(2, 1, block)).toBe(false);
      expect(isCellBelowBlock(2, 2, block)).toBe(false);
      expect(isCellBelowBlock(2, 3, block)).toBe(false);
    });
  });
});
