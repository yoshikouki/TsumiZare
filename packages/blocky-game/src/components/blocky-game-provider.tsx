"use client";

import {
  createContext,
  type Dispatch,
  type SetStateAction,
  useState,
} from "react";

import type { BlockPosition, BlockShape } from "../core/block.js";
import { type Board, hasBlockCollision, initBoard } from "../core/board.js";

export interface BlockyGameContext {
  board: Board;
  setBoard: Dispatch<SetStateAction<Board>>;
  hasCollision: (shape: BlockShape, position: BlockPosition) => boolean;
}

export const BlockyGameContext = createContext<BlockyGameContext>({
  board: initBoard(),
  setBoard: () => {
    // The default context leaves the board unchanged outside a provider.
  },
  hasCollision: () => false,
});

export const BlockyGameProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [board, setBoard] = useState<Board>(initBoard);

  const context = {
    board,
    setBoard,
    hasCollision: (shape: BlockShape, position: BlockPosition) =>
      hasBlockCollision({ shape, position }, board),
  };

  return <BlockyGameContext value={context}>{children}</BlockyGameContext>;
};
