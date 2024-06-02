import { describe, expect, it } from "bun:test";
import { act, renderHook } from "@testing-library/react";

import { BLOCKS, type BlockPosition, type BlockShape } from "../core/block";
import { type Board, hasBlockCollision, initBoard } from "../core/board";
import { useActiveBlock } from "./use-active-block";

const hasCollision =
  (board: Board) => (shape: BlockShape, position: BlockPosition) =>
    hasBlockCollision({ shape, position }, board);

describe("useActiveBlock", () => {
  describe("#activate", () => {
    it("should activate a block", () => {
      const board = initBoard();
      const { result } = renderHook(() =>
        useActiveBlock({
          board,
          hasCollision: hasCollision(board),
        }),
      );
      expect(result.current.activeBlock).toBeNull();
      act(() => result.current.activate());
      expect(result.current.activeBlock).not.toBeNull();
      expect(result.current.activeBlock?.position).toEqual({ x: 3, y: 0 });
    });
  });

  describe("#drop", () => {
    it("should update the active block position when there is no collision", () => {
      const board = initBoard();
      const { result } = renderHook(() =>
        useActiveBlock({
          board,
          hasCollision: hasCollision(board),
        }),
      );
      expect(result.current.activeBlock).toBeNull();
      act(() => result.current.activate());
      expect(result.current.activeBlock?.position).toEqual({ x: 3, y: 0 });
      act(() => result.current.drop());
      expect(result.current.activeBlock?.position).toEqual({ x: 3, y: 1 });
    });

    it("should update the active block position when there is no collision", () => {
      const board = initBoard();
      const { result } = renderHook(() =>
        useActiveBlock({
          board,
          hasCollision: hasCollision(board),
        }),
      );
      act(() =>
        result.current.drop({
          id: "testId",
          shape: BLOCKS.O,
          position: { x: 0, y: 17 },
        }),
      );
      expect(result.current.activeBlock?.position).toEqual({ x: 0, y: 18 });
    });

    it("should not update the active block position when there is a collision", () => {
      const board = initBoard();
      board.rows[19].cells[0].blockId = "testId";
      const { result } = renderHook(() =>
        useActiveBlock({
          board,
          hasCollision: hasCollision(board),
        }),
      );
      act(() =>
        result.current.drop({
          id: "testId",
          shape: BLOCKS.O,
          position: { x: 0, y: 18 },
        }),
      );
      expect(result.current.activeBlock).toBeNull();
    });
  });
});
