"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTetris } from "./use-tetris";

export const Tetris = () => {
  const { board, boardRef, startTetris, isActiveTetromino } = useTetris();

  return (
    <div
      className={cn(
        "flex w-svw items-center justify-center overscroll-none",
        board.status === "ready"
          ? "relative"
          : "absolute inset-0 bg-background",
      )}
    >
      <div className={cn("w-svw max-w-sm p-4")}>
        <div
          ref={boardRef}
          className={cn(
            "grid gap-1",
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
                  "aspect-square rounded-sm bg-stone-100",
                  cell.tetrominoId && "rounded-none bg-primary",
                  isActiveTetromino(cellIndex, rowIndex) &&
                    "bg-primary opacity-90",
                )}
              />
            )),
          )}
        </div>
        <div
          className={cn(
            board.status === "playing"
              ? "hidden"
              : "pointer-events-none absolute inset-0 flex w-svw items-center justify-center",
          )}
        >
          <Button
            type="button"
            onClick={startTetris}
            className="pointer-events-auto p-12 font-black text-6xl"
          >
            Start
          </Button>
        </div>
      </div>
    </div>
  );
};
