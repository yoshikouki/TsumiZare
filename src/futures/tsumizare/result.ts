import type { Board } from "./board";

export type Result = {
  score: number;
  filledRowsNumber: number;
};

export type Outcome = {
  filledRowsNumber?: Result["filledRowsNumber"];
};

export const initResult = (): Result => ({
  score: 0,
  filledRowsNumber: 0,
});

export const calculateNewResult = (
  outcome: Outcome,
  prev: Result,
  board: Board,
): Result => {
  const newFilledRowsNumber = outcome.filledRowsNumber
    ? prev.filledRowsNumber + outcome.filledRowsNumber
    : prev.filledRowsNumber;
  const filledRowsBonus = outcome.filledRowsNumber
    ? newFilledRowsNumber ** 2 * board.config.colsNumber
    : 0;
  const score = [
    // Adding bonuses
    filledRowsBonus,
  ].reduce((acc, bonus) => acc + bonus, prev.score);
  return {
    ...prev,
    score,
    filledRowsNumber: newFilledRowsNumber,
  };
};
