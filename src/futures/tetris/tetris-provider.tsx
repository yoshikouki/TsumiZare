"use client";

import {
  type Dispatch,
  type SetStateAction,
  createContext,
  useRef,
  useState,
} from "react";

import { type Board, initBoard } from "./board";

export const TetrisContext = createContext<{
  board: Board;
  setBoard: Dispatch<SetStateAction<Board>>;
}>({
  board: initBoard(),
  setBoard: () => {},
});

export const TetrisProvider = ({ children }: { children: React.ReactNode }) => {
  const [board, setBoard] = useState<Board>(initBoard);
  const isTickRunning = useRef(false);

  return <TetrisContext value={{ board, setBoard }}>{children}</TetrisContext>;
};
