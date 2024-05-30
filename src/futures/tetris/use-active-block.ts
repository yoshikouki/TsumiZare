"use client";

import { useState } from "react";

import { WALL_KICKS } from "./constants";
import type { TetrisContext } from "./tetris-provider";
import {
  type Tetromino,
  type TetrominoPosition,
  type TetrominoShape,
  generateQueuedTetrominos,
  generateRandomTetromino,
  isCellBelowTetromino,
  isFilledTetrominoCell,
  rotateShape,
} from "./tetromino";
import { useKeyboard } from "./use-keyboard";
import { useTouch } from "./use-touch";

export const useActiveBlock = ({
  board,
  hasCollision,
}: {
  board: TetrisContext["board"];
  hasCollision: TetrisContext["hasCollision"];
}) => {
  const [activeTetromino, setActiveTetromino] = useState<Tetromino | null>(
    null,
  );
  const [queuedTetrominos, setQueuedTetrominos] = useState<Tetromino[]>([]);

  const isActive = !!activeTetromino;

  const init = () => {
    remove();
    setQueuedTetrominos(generateQueuedTetrominos());
  };

  const remove = () => {
    const removedBlock = activeTetromino;
    setActiveTetromino(null);
    return removedBlock;
  };

  const activate = () => {
    const [nextTetromino, ...restTetrominos] =
      queuedTetrominos.length > 0
        ? queuedTetrominos
        : generateQueuedTetrominos();
    if (hasCollision(nextTetromino.shape, nextTetromino.position)) {
      return;
    }
    setActiveTetromino(nextTetromino);
    setQueuedTetrominos([...restTetrominos, generateRandomTetromino()]);
    return nextTetromino;
  };

  const drop = (tetromino = activeTetromino) => {
    if (!tetromino) return;
    const newPosition = {
      ...tetromino.position,
      y: tetromino.position.y + 1,
    };
    if (hasCollision(tetromino.shape, newPosition)) {
      return;
    }
    const droppedBlock = { ...tetromino, position: newPosition };
    setActiveTetromino(droppedBlock);
    return droppedBlock;
  };

  const move = (direction: "left" | "right" | "down") => {
    if (!activeTetromino) return;
    const { position } = activeTetromino;
    const newPosition =
      direction === "left"
        ? { ...position, x: position.x - 1 }
        : direction === "right"
          ? { ...position, x: position.x + 1 }
          : { ...position, y: position.y + 1 };
    if (hasCollision(activeTetromino.shape, newPosition)) {
      return;
    }
    setActiveTetromino({ ...activeTetromino, position: newPosition });
  };

  const rotate = () => {
    if (!activeTetromino) return;
    const rotatedShape = rotateShape(activeTetromino.shape);
    if (!hasCollision(rotatedShape, activeTetromino.position)) {
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

  const tryWallKick = (shape: TetrominoShape, position: TetrominoPosition) => {
    for (let i = 0; i < WALL_KICKS.length; i++) {
      const movedPosition = {
        x: position.x + WALL_KICKS[i].x,
        y: position.y + WALL_KICKS[i].y,
      };
      if (!hasCollision(shape, movedPosition)) {
        return movedPosition;
      }
    }
    return null;
  };

  const isActiveCell = (cellX: number, cellY: number) => {
    if (!activeTetromino) return false;
    return isFilledTetrominoCell(cellX, cellY, activeTetromino);
  };

  const isBelowActiveBlock = (cellX: number, cellY: number) => {
    if (!activeTetromino) return false;
    return isCellBelowTetromino(cellX, cellY, activeTetromino);
  };

  // Touch event
  const boardRef = useTouch({
    onSwipeLeft: () => move("left"),
    onSwipeRight: () => move("right"),
    onSwipeDown: () => move("down"),
    onSwipeUp: rotate,
    onTap: rotate,
    isPreventTouchDefault: () => board.status === "playing",
  });

  // Keyboard event
  useKeyboard({
    onKeyDown: {
      ArrowLeft: () => move("left"),
      ArrowRight: () => move("right"),
      ArrowDown: () => move("down"),
      ArrowUp: rotate,
      " ": rotate,
    },
  });

  return {
    activeTetromino,
    queuedTetrominos,
    boardRef, // For touch event
    init,
    remove,
    activate,
    drop,
    move,
    rotate,
    // Cell management
    isActive,
    isActiveCell,
    isBelowActiveTetromino: isBelowActiveBlock,
  };
};
