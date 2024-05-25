import { describe, expect, it } from "bun:test";

import { renderHook } from "@testing-library/react";
import { useTetris } from "./use-tetris";

describe("useTetris", () => {
  it("should initialize with the correct initial state", () => {
    const { result } = renderHook(() => useTetris());
    const { board, activeTetromino } = result.current;

    expect(board).toEqual(Array.from({ length: 20 }, () => Array(10).fill(0)));
    expect(activeTetromino).toBeNull();
  });
});
