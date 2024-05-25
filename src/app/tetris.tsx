"use client";

import React, { useEffect, useState } from "react";

const ROWS = 20;
const COLS = 10;
const INITIAL_BOARD = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

type Tetromino = {
  shape: number[][];
  position: { x: number; y: number };
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

  useEffect(() => {
    const interval = setInterval(() => {
      dropTetromino();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const dropTetromino = () => {
    if (!activeTetromino) {
      setActiveTetromino(generateRandomTetromino());
    } else {
    }
  };

  return (
    <div className="flex max-h-screen items-center justify-center">
      <div className="border-2 border-white">
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
                className="h-20 w-20 border-2 border-white"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
