"use client";

import { useContext, useEffect } from "react";

import { type Board, deepCopyBoard, initBoard, renewFilledRows } from "./board";
import { COLS, DROP_INTERVAL, ROWS } from "./constants";
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
  const { board, setBoard, activeTetromino, setActiveTetromino } =
    useContext(TetrisContext);

  const startTetris = () => {
    setBoard({ ...initBoard(), status: "playing" });
    setActiveTetromino(null);
  };

  const mergeTetrominoIntoBoard = (tetromino: Tetromino) => {
    const newBoard = deepCopyBoard(board);
    for (let shapeY = 0; shapeY < tetromino.shape.length; shapeY++) {
      const row = tetromino.shape[shapeY];
      for (let shapeX = 0; shapeX < row.length; shapeX++) {
        if (row[shapeX] === 0) {
          continue;
        }
        newBoard.rows[tetromino.position.y + shapeY].cells[
          tetromino.position.x + shapeX
        ].tetrominoId = tetromino.id;
      }
    }
    setBoard(newBoard);
    return newBoard;
  };

  const clearFilledRows = (board: Board) => {
    const newBoard = renewFilledRows(board);
    setBoard(newBoard);
    return newBoard;
  };

  const dropTetromino = () => {
    if (!activeTetromino) {
      const newTetromino = generateRandomTetromino();
      if (checkCollision(newTetromino.shape, newTetromino.position)) {
        setBoard({ ...board, status: "finished" });
      } else {
        setActiveTetromino(newTetromino);
      }
      return;
    }
    const { position } = activeTetromino;
    const newPosition = { ...position, y: position.y + 1 };
    if (checkCollision(activeTetromino.shape, newPosition)) {
      const mergedBoard = mergeTetrominoIntoBoard(activeTetromino);
      clearFilledRows(mergedBoard);
      setActiveTetromino(null);
      return;
    }
    setActiveTetromino({ ...activeTetromino, position: newPosition });
  };

  const checkCollision = (
    shape: TetrominoShape,
    position: TetrominoPosition,
  ) => {
    for (let shapeY = 0; shapeY < shape.length; shapeY++) {
      const row = shape[shapeY];
      for (let shapeX = 0; shapeX < row.length; shapeX++) {
        if (row[shapeX] === 0) {
          continue;
        }
        const cellX = position.x + shapeX;
        const cellY = position.y + shapeY;
        if (
          cellX < 0 ||
          COLS <= cellX ||
          ROWS <= cellY ||
          board.rows[cellY].cells[cellX].tetrominoId
        ) {
          return true;
        }
      }
    }
    return false;
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
  });

  // Keyboard event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          moveActiveTetromino("left");
          break;
        case "ArrowRight":
          moveActiveTetromino("right");
          break;
        case "ArrowDown":
          moveActiveTetromino("down");
          break;
        case "ArrowUp":
          rotateActiveTetromino();
          break;
        case " ":
          rotateActiveTetromino();
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [moveActiveTetromino, rotateActiveTetromino]);

  // Game loop
  useEffect(() => {
    if (board.status !== "playing") return;
    const interval = setInterval(() => {
      dropTetromino();
    }, DROP_INTERVAL);
    return () => clearInterval(interval);
  }, [dropTetromino, board.status]);

  return {
    board,
    activeTetromino,
    boardRef,
    startTetris,
    generateRandomTetromino,
    mergeTetrominoIntoBoard,
    dropTetromino,
    checkCollision,
    rotateActiveTetromino,
    isActiveTetromino,
    isBelowActiveTetromino,
  };
};
