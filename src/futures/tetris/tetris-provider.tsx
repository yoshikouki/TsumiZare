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
  isTickRunning: { current: boolean };
}>({
  board: initBoard(),
  setBoard: () => {},
  isTickRunning: { current: false },
});

export const TetrisProvider = ({ children }: { children: React.ReactNode }) => {
  const [board, setBoard] = useState<Board>(initBoard);
  const isTickRunning = useRef(false);

  return (
    <TetrisContext value={{ board, setBoard, isTickRunning }}>
      {children}
    </TetrisContext>
  );
};
