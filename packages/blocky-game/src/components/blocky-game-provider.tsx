"use client";

import {
  type Dispatch,
  type SetStateAction,
  createContext,
  useState,
} from "react";

import type { BlockPosition, BlockShape } from "../core/block";
import { type Board, hasBlockCollision, initBoard } from "../core/board";

export type BlockyGameContext = {
  board: Board;
  setBoard: Dispatch<SetStateAction<Board>>;
  hasCollision: (shape: BlockShape, position: BlockPosition) => boolean;
};

export const BlockyGameContext = createContext<BlockyGameContext>({
  board: initBoard(),
  setBoard: () => {},
  hasCollision: () => false,
});

export const BlockyGameProvider = ({
  children,
}: { children: React.ReactNode }) => {
  const [board, setBoard] = useState<Board>(initBoard);

  const context = {
    board,
    setBoard,
    hasCollision: (shape: BlockShape, position: BlockPosition) => {
      return hasBlockCollision({ shape, position }, board);
    },
  };

  return <BlockyGameContext value={context}>{children}</BlockyGameContext>;
};
