"use client";

import { useState } from "react";

import {
  type Block,
  type BlockPosition,
  type BlockShape,
  generateQueuedBlocks,
  generateRandomBlock,
  isCellBelowBlock,
  isFilledBlockCell,
  rotateShape,
} from "./block";
import { WALL_KICKS } from "./constants";
import type { TsumiZareContext } from "./tsumizare-provider";
import { useKeyboard } from "./use-keyboard";
import { useTouch } from "./use-touch";

export const useActiveBlock = ({
  board,
  hasCollision,
}: {
  board: TsumiZareContext["board"];
  hasCollision: TsumiZareContext["hasCollision"];
}) => {
  const [activeBlock, setActiveBlock] = useState<Block | null>(null);
  const [queuedBlocks, setQueuedBlocks] = useState<Block[]>([]);

  const isActive = !!activeBlock;

  const init = () => {
    remove();
    setQueuedBlocks(generateQueuedBlocks());
  };

  const remove = () => {
    const removedBlock = activeBlock;
    setActiveBlock(null);
    return removedBlock;
  };

  const activate = () => {
    const [nextBlock, ...restBlocks] =
      queuedBlocks.length > 0 ? queuedBlocks : generateQueuedBlocks();
    if (hasCollision(nextBlock.shape, nextBlock.position)) {
      return;
    }
    setActiveBlock(nextBlock);
    setQueuedBlocks([...restBlocks, generateRandomBlock()]);
    return nextBlock;
  };

  const drop = (block = activeBlock) => {
    if (!block) return;
    const newPosition = {
      ...block.position,
      y: block.position.y + 1,
    };
    if (hasCollision(block.shape, newPosition)) {
      return;
    }
    const droppedBlock = { ...block, position: newPosition };
    setActiveBlock(droppedBlock);
    return droppedBlock;
  };

  const move = (direction: "left" | "right" | "down") => {
    if (!activeBlock) return;
    const { position } = activeBlock;
    const newPosition =
      direction === "left"
        ? { ...position, x: position.x - 1 }
        : direction === "right"
          ? { ...position, x: position.x + 1 }
          : { ...position, y: position.y + 1 };
    if (hasCollision(activeBlock.shape, newPosition)) {
      return;
    }
    setActiveBlock({ ...activeBlock, position: newPosition });
  };

  const rotate = () => {
    if (!activeBlock) return;
    const rotatedShape = rotateShape(activeBlock.shape);
    if (!hasCollision(rotatedShape, activeBlock.position)) {
      setActiveBlock({
        ...activeBlock,
        shape: rotatedShape,
      });
      return;
    }
    const newPosition = tryWallKick(rotatedShape, activeBlock.position);
    if (!newPosition) return;
    setActiveBlock({
      ...activeBlock,
      shape: rotatedShape,
      position: newPosition,
    });
  };

  const tryWallKick = (shape: BlockShape, position: BlockPosition) => {
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
    if (!activeBlock) return false;
    return isFilledBlockCell(cellX, cellY, activeBlock);
  };

  const isBelowActiveBlock = (cellX: number, cellY: number) => {
    if (!activeBlock) return false;
    return isCellBelowBlock(cellX, cellY, activeBlock);
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
    activeBlock,
    queuedBlocks,
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
    isBelowActiveBlock: isBelowActiveBlock,
  };
};
