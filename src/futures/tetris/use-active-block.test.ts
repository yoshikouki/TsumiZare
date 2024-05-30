import { describe, expect, it } from "bun:test";
import { act, renderHook } from "@testing-library/react";

import { type Board, hasTetrominoCollision, initBoard } from "./board";
import { TetrisProvider } from "./tetris-provider";
import {
  TETROMINOS,
  type TetrominoPosition,
  type TetrominoShape,
} from "./tetromino";
import { useActiveBlock } from "./use-active-block";

const hasCollision =
  (board: Board) => (shape: TetrominoShape, position: TetrominoPosition) =>
    hasTetrominoCollision({ shape, position }, board);

describe("useActiveBlock", () => {
  describe("#activate", () => {
    it("should activate a tetromino", () => {
      const board = initBoard();
      const { result } = renderHook(() =>
        useActiveBlock({
          board,
          hasCollision: hasCollision(board),
        }),
      );
      expect(result.current.activeTetromino).toBeNull();
      act(() => result.current.activate());
      expect(result.current.activeTetromino).not.toBeNull();
      expect(result.current.activeTetromino?.position).toEqual({ x: 3, y: 0 });
    });
  });

  describe("#drop", () => {
    it("should update the active tetromino position when there is no collision", () => {
      const board = initBoard();
      const { result } = renderHook(() =>
        useActiveBlock({
          board,
          hasCollision: hasCollision(board),
        }),
      );
      expect(result.current.activeTetromino).toBeNull();
      act(() => result.current.activate());
      expect(result.current.activeTetromino?.position).toEqual({ x: 3, y: 0 });
      act(() => result.current.drop());
      expect(result.current.activeTetromino?.position).toEqual({ x: 3, y: 1 });
    });

    it("should update the active tetromino position when there is no collision", () => {
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
          shape: TETROMINOS.O,
          position: { x: 0, y: 17 },
        }),
      );
      expect(result.current.activeTetromino?.position).toEqual({ x: 0, y: 18 });
    });

    it("should not update the active tetromino position when there is a collision", () => {
      const board = initBoard();
      board.rows[19].cells[0].tetrominoId = "testId";
      const { result } = renderHook(() =>
        useActiveBlock({
          board,
          hasCollision: hasCollision(board),
        }),
      );
      act(() =>
        result.current.drop({
          id: "testId",
          shape: TETROMINOS.O,
          position: { x: 0, y: 18 },
        }),
      );
      expect(result.current.activeTetromino).toBeNull();
    });
  });
});
