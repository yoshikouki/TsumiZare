"use client";

import { useContext, useEffect, useEffectEvent } from "react";
import { BlockyGameContext } from "../components/blocky-game-provider.js";
import {
  generateQueuedBlocks,
  generateRandomBlock,
  isCellBelowBlock,
  isFilledBlockCell,
} from "../core/block.js";
import { type Cell, initBoard } from "../core/board.js";
import type { Direction } from "../core/game.js";
import { useKeyboard } from "./use-keyboard.js";
import { useTouch } from "./use-touch.js";

export type UpAction = "rotate" | "moveUp";

export type CellVariants = "empty" | "filled" | "active" | "belowActiveBlock";

export const useBlockyGameState = () => useContext(BlockyGameContext).game;

export const useBlockyGame = (option?: {
  upAction?: UpAction;
  autoDrop?: boolean;
}) => {
  const { game, send } = useContext(BlockyGameContext);
  const { board, activeBlock, queuedBlocks } = game;
  const isPlaying = board.status === "playing";

  const move = (direction: Direction) => send({ type: "move", direction });
  const rotate = () => send({ type: "rotate" });
  const runTick = () =>
    send({ type: "tick", nextBlock: generateRandomBlock() });
  const placeBlock = () =>
    send({ type: "place", nextBlock: generateRandomBlock() });
  const activateBlock = () =>
    send({ type: "activate", nextBlock: generateRandomBlock() });
  const moveLeft = () => move("left");
  const moveRight = () => move("right");
  const moveDown = () => move("down");
  const onUp =
    option?.upAction === "moveUp" ? () => move("up") : () => rotate();

  const boardRef = useTouch({
    onSwipeLeft: moveLeft,
    onSwipeRight: moveRight,
    onSwipeDown: moveDown,
    onSwipeUp: onUp,
    onTap: rotate,
    isPreventTouchDefault: () => isPlaying,
  });

  useKeyboard({
    onKeyDown: {
      ArrowLeft: moveLeft,
      ArrowRight: moveRight,
      ArrowDown: moveDown,
      ArrowUp: onUp,
      " ": rotate,
    },
    isPreventTouchDefault: isPlaying,
  });

  const { dropInterval } = board.config;
  const autoDrop = option?.autoDrop ?? false;
  const onTick = useEffectEvent(runTick);
  useEffect(() => {
    if (!(autoDrop && isPlaying)) {
      return;
    }
    const interval = setInterval(onTick, dropInterval);
    return () => clearInterval(interval);
  }, [autoDrop, isPlaying, dropInterval]);

  const detectCellVariant = (
    cell: Cell,
    x: number,
    y: number
  ): CellVariants => {
    if (cell.blockId) {
      return "filled";
    }
    if (activeBlock && isFilledBlockCell(x, y, activeBlock)) {
      return "active";
    }
    if (activeBlock && isCellBelowBlock(x, y, activeBlock)) {
      return "belowActiveBlock";
    }
    return "empty";
  };

  return {
    board,
    queuedBlocks,
    result: board.result,
    boardRef,
    startBlockyGame: () =>
      send({
        type: "start",
        board: initBoard(),
        queuedBlocks: generateQueuedBlocks(),
      }),
    finishBlockyGame: () => send({ type: "finish" }),
    pauseBlockyGame: () => send({ type: "pause" }),
    resumeBlockyGame: () => send({ type: "resume" }),
    readyBlockyGame: () => send({ type: "reset", board: initBoard() }),
    runTick,
    placeBlock,
    activateBlock,
    detectCellVariant,
  };
};
