"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTetris } from "./use-tetris";

export const Tetris = () => {
  const { board, startTetris, isActiveTetromino } = useTetris();

  return (
    <div
      className={cn(
        "flex w-svw items-center justify-center overscroll-none",
        board.status === "ready"
          ? "relative"
          : "fixed inset-0 h-svw bg-background",
      )}
    >
      <div className={cn("w-svw max-w-sm p-4")}>
        <div
          className={cn(
            "grid touch-none",
            board.status !== "playing" && "opacity-50",
          )}
          style={{
            gridTemplateRows: `repeat(${board.rowsNumber}, 1fr)`,
            gridTemplateColumns: `repeat(${board.colsNumber}, 1fr)`,
          }}
        >
          {board.rows.map((row, rowIndex) =>
            row.cells.map((cell, cellIndex) => (
              <div
                key={cell.id}
                className={cn(
                  "aspect-square border-2",
                  cell.tetrominoId && "bg-primary",
                  isActiveTetromino(cellIndex, rowIndex) &&
                    "border-4 bg-primary opacity-90",
                )}
              />
            )),
          )}
        </div>
        <div
          className={cn(
            board.status === "playing"
              ? "hidden"
              : "absolute inset-0 flex w-svw items-center justify-center",
          )}
        >
          <Button
            type="button"
            onClick={startTetris}
            className="touch-auto p-12 font-black text-6xl"
          >
            Start
          </Button>
        </div>
      </div>
    </div>
  );
};
