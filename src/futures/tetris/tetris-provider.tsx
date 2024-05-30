"use client";

import {
  type Dispatch,
  type SetStateAction,
  createContext,
  useState,
} from "react";

import { type Board, hasTetrominoCollision, initBoard } from "./board";
import {
  type Outcome,
  type Result,
  calculateNewResult,
  initResult,
} from "./result";
import type { TetrominoPosition, TetrominoShape } from "./tetromino";

export type TetrisContext = {
  board: Board;
  setBoard: Dispatch<SetStateAction<Board>>;
  result: Result;
  updateResult: (outcome: Outcome) => void;
  hasCollision: (shape: TetrominoShape, position: TetrominoPosition) => boolean;
};

export const TetrisContext = createContext<TetrisContext>({
  board: initBoard(),
  setBoard: () => {},
  result: initResult(),
  updateResult: () => {},
  hasCollision: () => false,
});

export const TetrisProvider = ({ children }: { children: React.ReactNode }) => {
  const [board, setBoard] = useState<Board>(initBoard);
  const [result, setResult] = useState<Result>(initResult);

  const context = {
    board,
    result,
    setBoard,
    hasCollision: (shape: TetrominoShape, position: TetrominoPosition) => {
      return hasTetrominoCollision({ shape, position }, board);
    },
    updateResult: (outcome: Outcome) => {
      setResult((prev) => calculateNewResult(outcome, prev, board));
    },
  };

  return <TetrisContext value={context}>{children}</TetrisContext>;
};
