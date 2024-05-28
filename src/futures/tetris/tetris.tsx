"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTetris } from "./use-tetris";

export const Tetris = () => {
  const {
    board,
    boardRef,
    startTetris,
    isActiveTetromino,
    isBelowActiveTetromino,
  } = useTetris();

  return (
    <div
      className={cn(
        "flex w-svw items-center justify-center overscroll-none transition-all",
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
                  cell.tetrominoId
                    ? "rounded-none bg-primary"
                    : isActiveTetromino(cellIndex, rowIndex)
                      ? "bg-primary opacity-90"
                      : isBelowActiveTetromino(cellIndex, rowIndex) &&
                        "bg-primary opacity-10",
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
            className={cn(
              "cursor-pointer rounded-md border bg-primary p-12 font-black text-6xl text-primary-foreground transition duration-200",
              "hover:translate-x-[-0.25rem] hover:translate-y-[-0.25rem] hover:bg-accent hover:text-primary hover:shadow-[0.25rem_0.25rem_#000]",
              "active:translate-x-0 active:translate-y-0 active:shadow-none",
            )}
          >
            PLAY
          </Button>
        </div>
      </div>
    </div>
  );
};
