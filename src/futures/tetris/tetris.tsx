"use client";

import { cn } from "@/lib/utils";
import { useTetris } from "./use-tetris";

export const Tetris = () => {
  const { board, activeTetromino } = useTetris();

  return (
    <div className="flex max-h-screen items-center justify-center">
      <div className="relative border-2 bg-gray-100">
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
                className={cn("h-10 w-10 border-2", cell && "bg-primary")}
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
                className="absolute h-10 w-10 border-4 bg-primary opacity-90"
                style={{
                  top: (activeTetromino.position.y + y) * 40,
                  left: (activeTetromino.position.x + x) * 40,
                }}
                hidden={!cell}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
