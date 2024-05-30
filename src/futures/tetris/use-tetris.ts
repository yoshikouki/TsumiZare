"use client";

import { useContext, useRef } from "react";

import { initBoard, mergeTetrominoIntoBoard, renewFilledRows } from "./board";
import { TetrisContext } from "./tetris-provider";
import type { Tetromino } from "./tetromino";
import { useActiveBlock } from "./use-active-block";

export const useTetris = () => {
  const { board, result, setBoard, hasCollision, updateResult } =
    useContext(TetrisContext);
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

  const startTetris = () => {
    setBoard({ ...initBoard(), status: "playing" });
    activeBlock.init();
  };

  const finishTetris = () => {
    setBoard((prev) => ({ ...prev, status: "finished" }));
    activeBlock.remove();
  };

  const pauseTetris = () => {
    setBoard((prev) => ({ ...prev, status: "pause" }));
  };

  const resumeTetris = () => {
    setBoard((prev) => ({ ...prev, status: "playing" }));
  };

  const readyTetris = () => {
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
      finishTetris();
    }
  };

  const updateBoard = () => {
    const removedBlock = activeBlock.remove();
    if (!removedBlock) return;
    const mergedResult = mergeIntoBoard(removedBlock);
    if (!mergedResult) return;
    updateResult({ filledRowsNumber: mergedResult.filledRowsNumber });
  };

  const mergeIntoBoard = (tetromino: Tetromino) => {
    const mergedBoard = mergeTetrominoIntoBoard(tetromino, board);
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
    startTetris,
    finishTetris,
    pauseTetris,
    resumeTetris,
    readyTetris,
    // Tetromino management
    mergeIntoBoard,
    runTick,
    hasCollision,
  };
};
