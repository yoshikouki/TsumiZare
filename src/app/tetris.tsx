"use client";

import React, { KeyboardEventHandler, useEffect, useState } from "react";

const ROWS = 20;
const COLS = 10;
const INITIAL_BOARD = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

type TetrominoShape = number[][];
type TetrominoPosition = { x: number; y: number };
type Tetromino = {
  shape: TetrominoShape;
  position: TetrominoPosition;
};

type TetrominoType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

type Tetrominos = Record<TetrominoType, Tetromino["shape"]>;
const TETROMINOS: Tetrominos = {
  I: [[1, 1, 1, 1]],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
  ],
} as const;
const TETROMINO_TYPES = Object.keys(TETROMINOS) as TetrominoType[];

export const Tetris = () => {
  const [board, setBoard] = useState(INITIAL_BOARD);
  const [activeTetromino, setActiveTetromino] = useState<Tetromino | null>(
    null,
  );

  const generateRandomTetromino = () => {
    const type =
      TETROMINO_TYPES[Math.floor(Math.random() * TETROMINO_TYPES.length)];
    return { shape: TETROMINOS[type], position: { x: 3, y: 0 } };
  };

  const mergeTetrominoIntoBoard = (
    shape: TetrominoShape,
    position: TetrominoPosition,
  ) => {
    const newBoard = board.map((row) => [...row]);
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] === 0) {
          break;
        }
        newBoard[position.y + y][position.x + x] = shape[y][x];
      }
    }
    return newBoard;
  };

  const dropTetromino = () => {
    if (!activeTetromino) {
      setActiveTetromino(generateRandomTetromino());
    } else {
      const { shape, position } = activeTetromino;
      const newPosition = { x: position.x, y: position.y + 1 };
      if (!checkCollision(shape, newPosition)) {
        setActiveTetromino({ shape, position: newPosition });
      } else {
        const newBoard = mergeTetrominoIntoBoard(shape, position);
        setBoard(newBoard);
        setActiveTetromino(null);
      }
    }
  };

  const checkCollision = (
    shape: TetrominoShape,
    position: TetrominoPosition,
  ) => {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] === 0) {
          break;
        }
        if (
          position.x + x < 0 ||
          position.x + x >= COLS ||
          position.y + y >= ROWS ||
          (board[position.y + y] && board[position.y + y][position.x + x]) !== 0
        ) {
          return true;
        }
      }
    }
    return false;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      dropTetromino();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [dropTetromino]);

  return (
    <div className="flex max-h-screen items-center justify-center">
      <div className="relative border-2 border-white bg-gray-100">
        {board.map((row, rowIndex) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            key={`row${rowIndex}`}
            className="flex"
          >
            {row.map((cell, colIndex) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                key={`row${rowIndex}-cell${colIndex}`}
                className={`h-10 w-10 border-2 border-white ${
                  cell && "bg-gray-800"
                }`}
              />
            ))}
          </div>
        ))}
        {activeTetromino?.shape.map((row, y) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          <div key={`tetromino-row${y}`} className="flex">
            {row.map((cell, x) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                key={`tetromino-row${y}-cell${x}`}
                className="absolute h-10 w-10 border-4 border-white bg-gray-600"
                style={{
                  top: (activeTetromino.position.y + y) * 40,
                  left: (activeTetromino.position.x + x) * 40,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
