"use client";

import { useState } from "react";

import type { BlockyGameContext } from "../components/blocky-game-provider";
import {
  type Block,
  type BlockPosition,
  type BlockShape,
  generateQueuedBlocks,
  generateRandomBlock,
  isCellBelowBlock,
  isFilledBlockCell,
  rotateShape,
} from "../core/block";
import { WALL_KICKS } from "../core/constants";
import type { UpAction } from "./use-blocky-game";
import { useKeyboard } from "./use-keyboard";
import { useTouch } from "./use-touch";

export const useActiveBlock = ({
  board,
  hasCollision,
  upAction = "rotate",
}: {
  board: BlockyGameContext["board"];
  hasCollision: BlockyGameContext["hasCollision"];
  upAction?: UpAction;
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
    if (!block) {
      return;
    }
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

  const move = (direction: "left" | "right" | "down" | "up") => {
    if (!activeBlock) {
      return;
    }
    const { position } = activeBlock;
    let newPosition: BlockPosition;
    switch (direction) {
      case "left":
        newPosition = { ...position, x: position.x - 1 };
        break;
      case "right":
        newPosition = { ...position, x: position.x + 1 };
        break;
      case "down":
        newPosition = { ...position, y: position.y + 1 };
        break;
      case "up":
        newPosition = { ...position, y: position.y - 1 };
        break;
      default:
        return;
    }
    if (hasCollision(activeBlock.shape, newPosition)) {
      return;
    }
    setActiveBlock({ ...activeBlock, position: newPosition });
  };

  const rotate = () => {
    if (!activeBlock) {
      return;
    }
    const rotatedShape = rotateShape(activeBlock.shape);
    if (!hasCollision(rotatedShape, activeBlock.position)) {
      setActiveBlock({
        ...activeBlock,
        shape: rotatedShape,
      });
      return;
    }
    const newPosition = tryWallKick(rotatedShape, activeBlock.position);
    if (!newPosition) {
      return;
    }
    setActiveBlock({
      ...activeBlock,
      shape: rotatedShape,
      position: newPosition,
    });
  };

  const tryWallKick = (shape: BlockShape, position: BlockPosition) => {
    for (const offset of WALL_KICKS) {
      const movedPosition = {
        x: position.x + offset.x,
        y: position.y + offset.y,
      };
      if (!hasCollision(shape, movedPosition)) {
        return movedPosition;
      }
    }
    return null;
  };

  const isActiveCell = (cellX: number, cellY: number) => {
    if (!activeBlock) {
      return false;
    }
    return isFilledBlockCell(cellX, cellY, activeBlock);
  };

  const isBelowActiveBlock = (cellX: number, cellY: number) => {
    if (!activeBlock) {
      return false;
    }
    return isCellBelowBlock(cellX, cellY, activeBlock);
  };

  const upActions = {
    rotate,
    moveUp: () => move("up"),
  } as const;
  const handleUpAction = upActions[upAction];
  const moveLeft = () => move("left");
  const moveRight = () => move("right");
  const moveDown = () => move("down");

  // Touch event
  const boardRef = useTouch({
    onSwipeLeft: moveLeft,
    onSwipeRight: moveRight,
    onSwipeDown: moveDown,
    onSwipeUp: handleUpAction,
    onTap: rotate,
    isPreventTouchDefault: () => board.status === "playing",
  });

  // Keyboard event
  useKeyboard({
    onKeyDown: {
      ArrowLeft: moveLeft,
      ArrowRight: moveRight,
      ArrowDown: moveDown,
      ArrowUp: handleUpAction,
      " ": rotate,
    },
    isPreventTouchDefault: board.status === "playing",
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
    isBelowActiveBlock,
  };
};
