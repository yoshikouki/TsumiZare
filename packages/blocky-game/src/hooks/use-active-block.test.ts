import { describe, expect, it } from "bun:test";
import { act, fireEvent, renderHook } from "@testing-library/react";

import { BLOCKS, type BlockPosition, type BlockShape } from "../core/block";
import { type Board, hasBlockCollision, initBoard } from "../core/board";
import { useActiveBlock } from "./use-active-block";

const hasCollision =
  (board: Board) => (shape: BlockShape, position: BlockPosition) =>
    hasBlockCollision({ shape, position }, board);

describe("useActiveBlock", () => {
  it("should keep keyboard movement in all four directions", () => {
    const board = initBoard();
    const { result, unmount } = renderHook(() =>
      useActiveBlock({
        board,
        hasCollision: hasCollision(board),
        upAction: "moveUp",
      })
    );
    act(() =>
      result.current.drop({
        id: "testId",
        shape: BLOCKS.O,
        position: { x: 3, y: 3 },
      })
    );
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(result.current.activeBlock?.position).toEqual({ x: 2, y: 4 });
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(result.current.activeBlock?.position).toEqual({ x: 3, y: 4 });
    fireEvent.keyDown(window, { key: "ArrowDown" });
    expect(result.current.activeBlock?.position).toEqual({ x: 3, y: 5 });
    fireEvent.keyDown(window, { key: "ArrowUp" });
    expect(result.current.activeBlock?.position).toEqual({ x: 3, y: 4 });
    unmount();
  });

  it("should ignore unsupported movement directions", () => {
    const board = initBoard();
    const { result } = renderHook(() =>
      useActiveBlock({ board, hasCollision: hasCollision(board) })
    );
    act(() => result.current.activate());
    const before = result.current.activeBlock;
    // @ts-expect-error JavaScript callers can pass a direction outside the union.
    act(() => result.current.move("diagonal"));
    expect(result.current.activeBlock).toBe(before);
  });

  it("should rotate a vertical I block next to the right wall", () => {
    const board = initBoard();
    const { result } = renderHook(() =>
      useActiveBlock({ board, hasCollision: hasCollision(board) })
    );
    act(() =>
      result.current.drop({
        id: "testId",
        shape: [[1], [1], [1], [1]],
        position: { x: 9, y: 1 },
      })
    );
    act(() => result.current.rotate());
    expect(result.current.activeBlock?.shape).toEqual(BLOCKS.I);
    expect(result.current.activeBlock?.position).toEqual({ x: 6, y: 2 });
  });

  describe("#activate", () => {
    it("should activate a block", () => {
      const board = initBoard();
      const { result } = renderHook(() =>
        useActiveBlock({
          board,
          hasCollision: hasCollision(board),
        })
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
        })
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
        })
      );
      act(() =>
        result.current.drop({
          id: "testId",
          shape: BLOCKS.O,
          position: { x: 0, y: 17 },
        })
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
        })
      );
      act(() =>
        result.current.drop({
          id: "testId",
          shape: BLOCKS.O,
          position: { x: 0, y: 18 },
        })
      );
      expect(result.current.activeBlock).toBeNull();
    });
  });
});
