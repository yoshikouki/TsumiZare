import { describe, expect, it } from "bun:test";
import { initBoard } from "./board";
import { calculateNewResult, initResult } from "./result";

describe("Result", () => {
  describe("#initResult", () => {
    it("should initialize a result with the specified number of rows and columns", () => {
      const result = initResult();
      expect(result).toHaveProperty("score");
      expect(result.score).toBe(0);
      expect(result.filledRowsNumber).toBe(0);
    });
  });

  describe("#calculateNewResult", () => {
    it("should merge the outcome into the result", () => {
      const result = calculateNewResult(
        {
          filledRowsNumber: 1,
        },
        initResult(),
        initBoard(),
      );
      expect(result.score).toBe(10);
      expect(result.filledRowsNumber).toBe(1);
    });

    it("should merge the outcome into the result", () => {
      const result = calculateNewResult(
        {
          filledRowsNumber: 1,
        },
        {
          score: 10,
          filledRowsNumber: 1,
        },
        initBoard(),
      );
      expect(result.score).toBe(50);
      expect(result.filledRowsNumber).toBe(2);
    });

    it("should not update the filledRowsNumber when the outcome is not provided", () => {
      const result = calculateNewResult(
        {
          filledRowsNumber: 0,
        },
        {
          score: 100,
          filledRowsNumber: 2,
        },
        initBoard(),
      );
      expect(result.score).toBe(100);
      expect(result.filledRowsNumber).toBe(2);
    });
  });
});
