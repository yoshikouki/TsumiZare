"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTetris } from "./use-tetris";

export const Tetris = () => {
  const { board, activeTetromino, startTetris, isActiveTetromino } =
    useTetris();

  return (
    <div className="relative w-full max-w-sm p-4">
      <div
        className="grid w-full"
        style={{
          gridTemplateRows: `repeat(${board.rowsNumber}, 1fr)`,
          gridTemplateColumns: `repeat(${board.colsNumber}, 1fr)`,
        }}
      >
        {board.rows.map((row, rowIndex) =>
          row.cells.map((cell, cellIndex) =>
            isActiveTetromino(cellIndex, rowIndex) ? (
              <div
                key={`${activeTetromino?.id}-${rowIndex}-${cellIndex}`}
                className="aspect-square border-4 bg-primary opacity-90"
              />
            ) : (
              <div
                key={cell.id}
                className={cn(
                  "aspect-square border-2",
                  cell.tetrominoId && "bg-primary",
                )}
              />
            ),
          ),
        )}
      </div>
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
  );
};
