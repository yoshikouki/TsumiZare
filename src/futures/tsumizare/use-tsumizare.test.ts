import { describe, expect, it } from "bun:test";
import { act, renderHook } from "@testing-library/react";

import { BLOCKS } from "./block";
import { TsumiZareProvider } from "./tsumizare-provider";
import { useTsumiZare } from "./use-tsumizare";

describe("useTsumiZare", () => {
  it("should initialize with the correct initial state", () => {
    const { result } = renderHook(useTsumiZare, { wrapper: TsumiZareProvider });

    expect(result.current.board.rows).toHaveLength(20);
    expect(result.current.board.rows[0].cells).toHaveLength(10);
    expect(result.current.activeBlock.activeBlock).toBeNull();
  });

  describe("#runTick", () => {
    it("should generate a random block", () => {
      const { result } = renderHook(useTsumiZare, {
        wrapper: TsumiZareProvider,
      });
      expect(result.current.activeBlock.activeBlock).toBeNull();
      act(() => result.current.runTick());
      expect(result.current.activeBlock.activeBlock).not.toBeNull();
      expect(result.current.activeBlock.activeBlock?.position).toEqual({
        x: 3,
        y: 0,
      });
    });

    it("should drop block correctly", () => {
      const { result } = renderHook(useTsumiZare, {
        wrapper: TsumiZareProvider,
      });
      expect(result.current.activeBlock.activeBlock).toBeNull();
      act(() => result.current.runTick());
      expect(result.current.activeBlock.activeBlock?.position).toEqual({
        x: 3,
        y: 0,
      });
      act(() => result.current.runTick());
      expect(result.current.activeBlock.activeBlock?.position).toEqual({
        x: 3,
        y: 1,
      });
    });

    it("should detect collision correctly", async () => {
      const { result } = renderHook(useTsumiZare, {
        wrapper: TsumiZareProvider,
      });
      act(() => result.current.runTick());
      if (!result.current.activeBlock.activeBlock)
        throw new Error("activeBlock is null");
      const { shape, position } = result.current.activeBlock.activeBlock;
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
      } = renderHook(useTsumiZare, { wrapper: TsumiZareProvider });
      const shape = BLOCKS.O;
      expect(hasCollision(shape, { x: 0, y: 0 })).toBe(false);
      expect(hasCollision(shape, { x: 0, y: 18 })).toBe(false);
      expect(hasCollision(shape, { x: 0, y: 19 })).toBe(true);
      expect(hasCollision(shape, { x: 8, y: 0 })).toBe(false);
      expect(hasCollision(shape, { x: 9, y: 0 })).toBe(true);
      expect(hasCollision(shape, { x: -1, y: 0 })).toBe(true);
    });

    it("should detect collision of other blocks correctly", () => {
      const { result } = renderHook(useTsumiZare, {
        wrapper: TsumiZareProvider,
      });
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
