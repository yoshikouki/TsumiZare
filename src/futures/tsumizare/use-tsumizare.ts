"use client";

import { useContext, useRef } from "react";

import type { Block } from "./block";
import { initBoard, mergeBlockIntoBoard, renewFilledRows } from "./board";
import { TsumiZareContext } from "./tsumizare-provider";
import { useActiveBlock } from "./use-active-block";

export const useTsumiZare = () => {
  const { board, result, setBoard, hasCollision, updateResult } =
    useContext(TsumiZareContext);
  const activeBlock = useActiveBlock({
    board,
    hasCollision,
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
      const activatedBlock = activeBlock.activate();
      if (activatedBlock) return;
      finishTsumiZare();
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

  // Game loop
  const gameRef = (ref: HTMLDivElement) => {
    if (board.status !== "playing") return;
    const interval = setInterval(runTick, board.config.dropInterval);
    return () => clearInterval(interval);
  };

  return {
    ...activeBlock,
    board,
    playMilliSeconds,
    playTimeString,
    result,
    gameRef, // For game loop
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
  };
};
