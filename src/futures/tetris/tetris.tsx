"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTetris } from "./use-tetris";

export const Tetris = () => {
  const { board, activeTetromino, startTetris } = useTetris();

  return (
    <div className="flex max-h-screen items-center justify-center">
      <div className="relative border-2 bg-gray-100">
        {board.rows.map((row) => (
          <div key={row.id} className="flex">
            {row.cells.map((cell) => (
              <div
                key={cell.id}
                className={cn(
                  "h-10 w-10 border-2",
                  cell.tetrominoId && "bg-primary",
                )}
              />
            ))}
          </div>
        ))}
        {activeTetromino?.shape.map((row, y) => (
          <div key={`${activeTetromino.id}-${y}`} className="flex">
            {row.map((cell, x) => (
              <div
                key={`${activeTetromino.id}-${y}-${x}`}
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
        <div
          className={cn(
            "absolute inset-0 flex w-full items-center justify-center",
            board.status !== "ready" && "hidden",
          )}
        >
          <Button
            type="button"
            onClick={startTetris}
            className="p-12 font-black text-6xl"
          >
            Start
          </Button>
        </div>
      </div>
    </div>
  );
};
