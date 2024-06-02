"use client";

import { useContext, useRef } from "react";
import {
  type Cell,
  initBoard,
  mergeBlockIntoBoard,
  renewFilledRows,
} from "../core/board";
import { type Outcome, calculateNewResult } from "../core/result";

import { TsumiZareContext } from "../components/tsumizare-provider";
import type { Block } from "../core/block";
import { useActiveBlock } from "./use-active-block";

export type UpAction = "rotate" | "moveUp";

export type CellVariants = "empty" | "filled" | "active" | "belowActiveBlock";

export const useTsumiZare = (option?: {
  upAction?: UpAction;
}) => {
  const { board, setBoard, hasCollision } = useContext(TsumiZareContext);
  const activeBlock = useActiveBlock({
    board,
    hasCollision,
    upAction: option?.upAction,
  });
  const playMilliSecondsRef = useRef(0);
  const updatePlayTime = () => {
    playMilliSecondsRef.current += board.config.dropInterval;
  };
  const playMilliSeconds = playMilliSecondsRef.current;
  const playTimeString = new Date(playMilliSeconds).toISOString().substr(14, 5);

  const startTsumiZare = () => {
    setBoard({ ...initBoard(), status: "playing" });
    activeBlock.init();
  };

  const finishTsumiZare = () => {
    setBoard((prev) => ({ ...prev, status: "finished" }));
    activeBlock.remove();
  };

  const pauseTsumiZare = () => {
    setBoard((prev) => ({ ...prev, status: "pause" }));
  };

  const resumeTsumiZare = () => {
    setBoard((prev) => ({ ...prev, status: "playing" }));
  };

  const readyTsumiZare = () => {
    setBoard(initBoard());
    activeBlock.remove();
  };

  const runTick = () => {
    updatePlayTime();
    if (activeBlock.isActive) {
      const droppedBlock = activeBlock.drop();
      if (droppedBlock) return;
      updateBoard();
    } else {
      activateBlockOrFinish();
    }
  };

  const updateBoard = () => {
    const removedBlock = activeBlock.remove();
    if (!removedBlock) return;
    const mergedResult = mergeIntoBoard(removedBlock);
    if (!mergedResult) return;
    updateResult({ filledRowsNumber: mergedResult.filledRowsNumber });
  };

  const mergeIntoBoard = (block: Block) => {
    const mergedBoard = mergeBlockIntoBoard(block, board);
    const mergedResult = renewFilledRows(mergedBoard);
    if (!mergedResult) return;
    setBoard(mergedResult.board);
    return mergedResult;
  };

  const updateResult = (outcome: Outcome) => {
    setBoard((prev) => ({
      ...prev,
      result: calculateNewResult(outcome, prev.result, prev),
    }));
  };

  const activateBlockOrFinish = () => {
    const activatedBlock = activeBlock.activate();
    if (activatedBlock) return;
    finishTsumiZare();
  };

  // Cell management
  const detectCellVariant = (
    cell: Cell,
    x: number,
    y: number,
  ): CellVariants => {
    if (cell.blockId) {
      return "filled";
    }
    if (activeBlock.isActiveCell(x, y)) {
      return "active";
    }
    if (activeBlock.isBelowActiveBlock(x, y)) {
      return "belowActiveBlock";
    }
    return "empty";
  };

  // Game loop
  const tickRunnerRef = (ref: HTMLDivElement) => {
    if (board.status !== "playing") return;
    const interval = setInterval(runTick, board.config.dropInterval);
    return () => clearInterval(interval);
  };

  return {
    board,
    activeBlock,
    queuedBlocks: activeBlock.queuedBlocks,
    result: board.result,
    playMilliSeconds,
    playTimeString,
    // Refs
    boardRef: activeBlock.boardRef,
    tickRunnerRef,
    // Game management
    startTsumiZare,
    finishTsumiZare,
    pauseTsumiZare,
    resumeTsumiZare,
    readyTsumiZare,
    // Block management
    mergeIntoBoard,
    runTick,
    hasCollision,
    updateBoard,
    activateBlockOrFinish,
    // Cell management
    detectCellVariant,
    isActiveCell: activeBlock.isActiveCell,
    isBelowActiveBlock: activeBlock.isBelowActiveBlock,
  };
};