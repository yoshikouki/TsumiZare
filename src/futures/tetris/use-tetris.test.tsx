import { describe, expect, it } from "bun:test";
import { act, renderHook, waitFor } from "@testing-library/react";
import { TETROMINOS, type TetrominoShape, useTetris } from "./use-tetris";

describe("useTetris", () => {
  it("should initialize with the correct initial state", () => {
    const { result } = renderHook(() => useTetris());
    const { board, activeTetromino } = result.current;

    expect(board).toEqual(Array.from({ length: 20 }, () => Array(10).fill(0)));
    expect(activeTetromino).toBeNull();
  });

  describe("#dropTetromino", () => {
    it("should generate a random tetromino", () => {
      const { result } = renderHook(useTetris);
      act(() => result.current.dropTetromino());
      const { activeTetromino } = result.current;
      expect(activeTetromino).not.toBeNull();
      expect(activeTetromino?.position).toEqual({ x: 3, y: 0 });
    });

    it("should drop tetromino correctly", () => {
      const { result } = renderHook(useTetris);
      expect(result.current.activeTetromino).toBeNull();
      act(() => result.current.dropTetromino());
      expect(result.current.activeTetromino?.position).toEqual({ x: 3, y: 0 });
      act(() => result.current.dropTetromino());
      expect(result.current.activeTetromino?.position).toEqual({ x: 3, y: 1 });
    });

    it("should detect collision correctly", () => {
      const { result } = renderHook(() => useTetris());
      act(() => result.current.dropTetromino());
      const { activeTetromino } = result.current;
      if (!activeTetromino) throw new Error("activeTetromino is null");
      const { shape, position } = activeTetromino;
      // Move tetromino to the bottom
      for (let i = 0; i < 19; i++) {
        act(() => result.current.dropTetromino());
      }
      // Check collision at bottom
      expect(
        result.current.checkCollision(shape, { x: position.x, y: 20 }),
      ).toBe(true);
    });
  });

  describe("#mergeTetrominoIntoBoard", () => {
    it("should detect collision correctly", async () => {
      const { result } = renderHook(useTetris);
      await waitFor(() => {
        result.current.mergeTetrominoIntoBoard(TETROMINOS.Z, {
          x: 0,
          y: 0,
        });
      });
      expect(result.current.board[0][0]).toBe(1);
      expect(result.current.board[0][1]).toBe(1);
      expect(result.current.board[1][1]).toBe(1);
      expect(result.current.board[1][2]).toBe(1);
    });
  });

  describe("#checkCollision", () => {
    it("should detect collision correctly", () => {
      const {
        result: {
          current: { checkCollision },
        },
      } = renderHook(useTetris);
      const shape = TETROMINOS.O;
      expect(checkCollision(shape, { x: 0, y: 0 })).toBe(false);
      expect(checkCollision(shape, { x: 0, y: 18 })).toBe(false);
      expect(checkCollision(shape, { x: 0, y: 19 })).toBe(true);
      expect(checkCollision(shape, { x: 8, y: 0 })).toBe(false);
      expect(checkCollision(shape, { x: 9, y: 0 })).toBe(true);
      expect(checkCollision(shape, { x: -1, y: 0 })).toBe(true);
    });

    it("should detect collision of other tetrominos correctly", async () => {
      const { result } = renderHook(useTetris);
      const shape = TETROMINOS.O;
      await waitFor(() => {
        result.current.mergeTetrominoIntoBoard(shape, { x: 0, y: 18 });
      });
      expect(result.current.checkCollision(shape, { x: 0, y: 16 })).toBe(false);
      expect(result.current.checkCollision(shape, { x: 0, y: 17 })).toBe(true);
      expect(result.current.checkCollision(shape, { x: 2, y: 18 })).toBe(false);
      expect(result.current.checkCollision(shape, { x: 1, y: 18 })).toBe(true);
    });
  });
});
