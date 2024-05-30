"use client";

import {
  type Dispatch,
  type SetStateAction,
  createContext,
  useState,
} from "react";

import type { BlockPosition, BlockShape } from "./block";
import { type Board, hasBlockCollision, initBoard } from "./board";
import {
  type Outcome,
  type Result,
  calculateNewResult,
  initResult,
} from "./result";

export type TsumiZareContext = {
  board: Board;
  setBoard: Dispatch<SetStateAction<Board>>;
  result: Result;
  updateResult: (outcome: Outcome) => void;
  hasCollision: (shape: BlockShape, position: BlockPosition) => boolean;
};

export const TsumiZareContext = createContext<TsumiZareContext>({
  board: initBoard(),
  setBoard: () => {},
  result: initResult(),
  updateResult: () => {},
  hasCollision: () => false,
});

export const TsumiZareProvider = ({
  children,
}: { children: React.ReactNode }) => {
  const [board, setBoard] = useState<Board>(initBoard);
  const [result, setResult] = useState<Result>(initResult);

  const context = {
    board,
    result,
    setBoard,
    hasCollision: (shape: BlockShape, position: BlockPosition) => {
      return hasBlockCollision({ shape, position }, board);
    },
    updateResult: (outcome: Outcome) => {
      setResult((prev) => calculateNewResult(outcome, prev, board));
    },
  };

  return <TsumiZareContext value={context}>{children}</TsumiZareContext>;
};
