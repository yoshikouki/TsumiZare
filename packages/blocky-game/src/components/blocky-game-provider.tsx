"use client";

import { createContext, useReducer } from "react";

import { initBoard } from "../core/board.js";
import {
  type Game,
  type GameAction,
  gameReducer,
  initGame,
} from "../core/game.js";

export interface BlockyGameContext {
  game: Game;
  send: (action: GameAction) => void;
}

export const BlockyGameContext = createContext<BlockyGameContext>({
  game: initGame(initBoard()),
  send: () => undefined,
});

const createGame = () => initGame(initBoard());

export const BlockyGameProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [game, send] = useReducer(gameReducer, undefined, createGame);
  return (
    <BlockyGameContext value={{ game, send }}>{children}</BlockyGameContext>
  );
};
