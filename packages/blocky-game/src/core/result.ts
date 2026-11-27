import type { Board } from "./board.js";

export interface Result {
  score: number;
  filledRowsNumber: number;
}

export const initResult = (): Result => ({
  score: 0,
  filledRowsNumber: 0,
});

export function scoreClear(
  prev: Result,
  cleared: number,
  cols: number
): Result {
  if (cleared === 0) {
    return prev;
  }
  const filledRowsNumber = prev.filledRowsNumber + cleared;
  return { filledRowsNumber, score: prev.score + filledRowsNumber ** 2 * cols };
}

export const calculateNewResult = (
  outcome: { filledRowsNumber?: number },
  prev: Result,
  board: Board
): Result =>
  scoreClear(prev, outcome.filledRowsNumber ?? 0, board.config.colsNumber);
