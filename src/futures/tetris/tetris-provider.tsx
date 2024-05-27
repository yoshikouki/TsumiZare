"use client";

import { createContext, useState } from "react";

import { type Board, initBoard } from "./board";
import type { Tetromino } from "./tetromino";

export const TetrisContext = createContext<{
  board: Board;
  setBoard: (board: Board) => void;
  activeTetromino: Tetromino | null;
  setActiveTetromino: (tetromino: Tetromino | null) => void;
}>({
  board: initBoard(),
  activeTetromino: null,
  setBoard: () => {},
  setActiveTetromino: () => {},
});

export const TetrisProvider = ({ children }: { children: React.ReactNode }) => {
  const [board, setBoard] = useState<Board>(initBoard);
  const [activeTetromino, setActiveTetromino] = useState<Tetromino | null>(
    null,
  );

  return (
    <TetrisContext
      value={{ board, setBoard, activeTetromino, setActiveTetromino }}
    >
      {children}
    </TetrisContext>
  );
};
