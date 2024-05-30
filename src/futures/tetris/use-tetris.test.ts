import { describe, expect, it } from "bun:test";
import { act, renderHook } from "@testing-library/react";

import { TetrisProvider } from "./tetris-provider";
import { TETROMINOS } from "./tetromino";
import { useTetris } from "./use-tetris";

describe("useTetris", () => {
  it("should initialize with the correct initial state", () => {
    const { result } = renderHook(useTetris, { wrapper: TetrisProvider });
    const { board, activeTetromino } = result.current;

    expect(board.rows).toHaveLength(20);
    expect(board.rows[0].cells).toHaveLength(10);
    expect(activeTetromino).toBeNull();
  });

  describe("#runTick", () => {
    it("should generate a random tetromino", () => {
      const { result } = renderHook(useTetris, { wrapper: TetrisProvider });
      expect(result.current.activeTetromino).toBeNull();
      act(() => result.current.runTick());
      expect(result.current.activeTetromino).not.toBeNull();
      expect(result.current.activeTetromino?.position).toEqual({ x: 3, y: 0 });
    });

    it("should drop tetromino correctly", () => {
      const { result } = renderHook(useTetris, { wrapper: TetrisProvider });
      expect(result.current.activeTetromino).toBeNull();
      act(() => result.current.runTick());
      expect(result.current.activeTetromino?.position).toEqual({ x: 3, y: 0 });
      act(() => result.current.runTick());
      expect(result.current.activeTetromino?.position).toEqual({ x: 3, y: 1 });
    });

    it("should detect collision correctly", async () => {
      const { result } = renderHook(useTetris, { wrapper: TetrisProvider });
      act(() => result.current.runTick());
      const { activeTetromino } = result.current;
      if (!activeTetromino) throw new Error("activeTetromino is null");
      const { shape, position } = activeTetromino;
      // Move tetromino to the bottom
      for (let i = 0; i < 19; i++) {
        act(() => result.current.runTick());
      }
      // Check collision at bottom
      expect(result.current.hasCollision(shape, { x: position.x, y: 20 })).toBe(
        true,
      );
    });
  });

  describe("#hasCollision", () => {
    it("should detect collision correctly", () => {
      const {
        result: {
          current: { hasCollision },
        },
      } = renderHook(useTetris, { wrapper: TetrisProvider });
      const shape = TETROMINOS.O;
      expect(hasCollision(shape, { x: 0, y: 0 })).toBe(false);
      expect(hasCollision(shape, { x: 0, y: 18 })).toBe(false);
      expect(hasCollision(shape, { x: 0, y: 19 })).toBe(true);
      expect(hasCollision(shape, { x: 8, y: 0 })).toBe(false);
      expect(hasCollision(shape, { x: 9, y: 0 })).toBe(true);
      expect(hasCollision(shape, { x: -1, y: 0 })).toBe(true);
    });

    it("should detect collision of other tetrominos correctly", () => {
      const { result } = renderHook(useTetris, { wrapper: TetrisProvider });
      const shape = TETROMINOS.O;
      act(() => {
        result.current.mergeIntoBoard({
          id: "testId",
          shape,
          position: { x: 0, y: 18 }, // Bottom left
        });
      });
      expect(result.current.hasCollision(shape, { x: 0, y: 16 })).toBe(false);
      expect(result.current.hasCollision(shape, { x: 0, y: 17 })).toBe(true);
      expect(result.current.hasCollision(shape, { x: 2, y: 18 })).toBe(false);
      expect(result.current.hasCollision(shape, { x: 1, y: 18 })).toBe(true);
    });
  });
});
