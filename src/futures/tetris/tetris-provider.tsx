"use client";

import {
  type Dispatch,
  type SetStateAction,
  createContext,
  useState,
} from "react";

import { type Board, initBoard } from "./board";
import {
  type Outcome,
  type Result,
  calculateNewResult,
  initResult,
} from "./result";

export const TetrisContext = createContext<{
  board: Board;
  setBoard: Dispatch<SetStateAction<Board>>;
  result: Result;
  updateResult: (outcome: Outcome) => void;
}>({
  board: initBoard(),
  setBoard: () => {},
  result: initResult(),
  updateResult: () => {},
});

export const TetrisProvider = ({ children }: { children: React.ReactNode }) => {
  const [board, setBoard] = useState<Board>(initBoard);
  const [result, setResult] = useState<Result>(initResult);

  const updateResult = (outcome: Outcome) => {
    setResult((prev) => calculateNewResult(outcome, prev, board));
  };

  return (
    <TetrisContext value={{ board, setBoard, result, updateResult }}>
      {children}
    </TetrisContext>
  );
};
