"use client";

import { useContext, useEffect, useState } from "react";

import {
  hasTetrominoCollision,
  initBoard,
  mergeTetrominoIntoBoard,
  renewFilledRows,
} from "./board";
import { DROP_INTERVAL } from "./constants";
import { TetrisContext } from "./tetris-provider";
import {
  type Tetromino,
  type TetrominoPosition,
  type TetrominoShape,
  generateRandomTetromino,
  isCellBelowTetromino,
  isFilledTetrominoCell,
  rotateShape,
} from "./tetromino";
import { useKeyboard } from "./use-keyboard";
import { useTouch } from "./use-touch";

const WALL_KICKS = [
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: -1 },
  { x: -1, y: -1 },
  { x: 1, y: -1 },
  { x: -3, y: 0 }, // For I tetromino on the right wall
];

export const useTetris = () => {
  const { board, setBoard, isTickRunning } = useContext(TetrisContext);
  const [activeTetromino, setActiveTetromino] = useState<Tetromino | null>(
    null,
  );
  const [queuedTetrominos, setQueuedTetrominos] = useState<Tetromino[]>([]);
  const [tickCount, setTickCount] = useState(0);

  const startTetris = () => {
    setBoard({ ...initBoard(), status: "playing" });
    setActiveTetromino(null);
    setQueuedTetrominos(Array.from({ length: 3 }, generateRandomTetromino));
  };

  const finishTetris = () => {
    setBoard((prev) => ({ ...prev, status: "finished" }));
    setActiveTetromino(null);
  };

  const pauseTetris = () => {
    setBoard((prev) => ({ ...prev, status: "pause" }));
  };

  const resumeTetris = () => {
    setBoard((prev) => ({ ...prev, status: "playing" }));
  };

  const readyTetris = () => {
    setBoard(initBoard());
    setActiveTetromino(null);
  };

  const activateNextTetromino = () => {
    const [nextTetromino, ...restTetrominos] = queuedTetrominos;
    if (checkCollision(nextTetromino.shape, nextTetromino.position)) {
      finishTetris();
    } else {
      setActiveTetromino(nextTetromino);
      setQueuedTetrominos([...restTetrominos, generateRandomTetromino()]);
    }
  };

  const runTick = () => {
    if (activeTetromino) {
      dropTetromino(activeTetromino);
    } else {
      activateNextTetromino();
    }
    setTickCount((prev) => prev + 1);
  };

  const mergeTetromino = (tetromino: Tetromino) => {
    const mergedBoard = mergeTetrominoIntoBoard(tetromino, board);
    const newBoard = renewFilledRows(mergedBoard);
    setBoard(newBoard);
    setActiveTetromino(null);
  };

  const dropTetromino = (tetromino: Tetromino) => {
    const { position } = tetromino;
    const newPosition = { ...position, y: position.y + 1 };
    if (checkCollision(tetromino.shape, newPosition)) {
      mergeTetromino(tetromino);
    } else {
      setActiveTetromino({ ...tetromino, position: newPosition });
    }
  };

  const checkCollision = (
    shape: TetrominoShape,
    position: TetrominoPosition,
  ) => {
    return hasTetrominoCollision({ shape, position }, board);
  };

  const moveActiveTetromino = (direction: "left" | "right" | "down") => {
    if (!activeTetromino) return;
    const { position } = activeTetromino;
    const newPosition =
      direction === "left"
        ? { ...position, x: position.x - 1 }
        : direction === "right"
          ? { ...position, x: position.x + 1 }
          : { ...position, y: position.y + 1 };
    if (checkCollision(activeTetromino.shape, newPosition)) {
      return;
    }
    setActiveTetromino({ ...activeTetromino, position: newPosition });
  };

  const tryWallKick = (shape: TetrominoShape, position: TetrominoPosition) => {
    for (let i = 0; i < WALL_KICKS.length; i++) {
      const newPosition = {
        x: position.x + WALL_KICKS[i].x,
        y: position.y + WALL_KICKS[i].y,
      };
      if (!checkCollision(shape, newPosition)) {
        return newPosition;
      }
    }
    return null;
  };

  const rotateActiveTetromino = () => {
    if (!activeTetromino) return;
    const rotatedShape = rotateShape(activeTetromino.shape);
    if (!checkCollision(rotatedShape, activeTetromino.position)) {
      setActiveTetromino({
        ...activeTetromino,
        shape: rotatedShape,
      });
      return;
    }
    const newPosition = tryWallKick(rotatedShape, activeTetromino.position);
    if (!newPosition) return;
    setActiveTetromino({
      ...activeTetromino,
      shape: rotatedShape,
      position: newPosition,
    });
  };

  const isActiveTetromino = (cellX: number, cellY: number) => {
    if (!activeTetromino) return false;
    return isFilledTetrominoCell(cellX, cellY, activeTetromino);
  };

  const isBelowActiveTetromino = (cellX: number, cellY: number) => {
    if (!activeTetromino) return false;
    return isCellBelowTetromino(cellX, cellY, activeTetromino);
  };

  // Touch event
  const boardRef = useTouch({
    onSwipeLeft: () => moveActiveTetromino("left"),
    onSwipeRight: () => moveActiveTetromino("right"),
    onSwipeDown: () => moveActiveTetromino("down"),
    onSwipeUp: rotateActiveTetromino,
    onTap: rotateActiveTetromino,
    isPreventTouchDefault: () => board.status === "playing",
  });

  // Keyboard event
  useKeyboard({
    onKeyDown: {
      ArrowLeft: () => moveActiveTetromino("left"),
      ArrowRight: () => moveActiveTetromino("right"),
      ArrowDown: () => moveActiveTetromino("down"),
      ArrowUp: rotateActiveTetromino,
      " ": rotateActiveTetromino,
    },
  });

  // Game loop
  const gameRef = (ref: HTMLDivElement) => {
    if (board.status !== "playing") return;
    const interval = setInterval(runTick, DROP_INTERVAL);
    return () => clearInterval(interval);
  };

  return {
    board,
    activeTetromino,
    boardRef, // For touch event
    gameRef, // For game loop
    // Game management
    startTetris,
    finishTetris,
    pauseTetris,
    resumeTetris,
    readyTetris,
    // Tetromino management
    mergeTetromino,
    runTick,
    dropTetromino,
    checkCollision,
    rotateActiveTetromino,
    // Cell management
    isActiveTetromino,
    isBelowActiveTetromino,
  };
};
