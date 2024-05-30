import { describe, expect, it } from "bun:test";
import { act, renderHook } from "@testing-library/react";

import { BLOCKS } from "./block";
import { TetrisProvider } from "./tetris-provider";
import { useTetris } from "./use-tetris";

describe("useTetris", () => {
  it("should initialize with the correct initial state", () => {
    const { result } = renderHook(useTetris, { wrapper: TetrisProvider });
    const { board, activeBlock } = result.current;

    expect(board.rows).toHaveLength(20);
    expect(board.rows[0].cells).toHaveLength(10);
    expect(activeBlock).toBeNull();
  });

  describe("#runTick", () => {
    it("should generate a random block", () => {
      const { result } = renderHook(useTetris, { wrapper: TetrisProvider });
      expect(result.current.activeBlock).toBeNull();
      act(() => result.current.runTick());
      expect(result.current.activeBlock).not.toBeNull();
      expect(result.current.activeBlock?.position).toEqual({ x: 3, y: 0 });
    });

    it("should drop block correctly", () => {
      const { result } = renderHook(useTetris, { wrapper: TetrisProvider });
      expect(result.current.activeBlock).toBeNull();
      act(() => result.current.runTick());
      expect(result.current.activeBlock?.position).toEqual({ x: 3, y: 0 });
      act(() => result.current.runTick());
      expect(result.current.activeBlock?.position).toEqual({ x: 3, y: 1 });
    });

    it("should detect collision correctly", async () => {
      const { result } = renderHook(useTetris, { wrapper: TetrisProvider });
      act(() => result.current.runTick());
      const { activeBlock } = result.current;
      if (!activeBlock) throw new Error("activeBlock is null");
      const { shape, position } = activeBlock;
      // Move block to the bottom
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
      const shape = BLOCKS.O;
      expect(hasCollision(shape, { x: 0, y: 0 })).toBe(false);
      expect(hasCollision(shape, { x: 0, y: 18 })).toBe(false);
      expect(hasCollision(shape, { x: 0, y: 19 })).toBe(true);
      expect(hasCollision(shape, { x: 8, y: 0 })).toBe(false);
      expect(hasCollision(shape, { x: 9, y: 0 })).toBe(true);
      expect(hasCollision(shape, { x: -1, y: 0 })).toBe(true);
    });

    it("should detect collision of other blocks correctly", () => {
      const { result } = renderHook(useTetris, { wrapper: TetrisProvider });
      const shape = BLOCKS.O;
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
