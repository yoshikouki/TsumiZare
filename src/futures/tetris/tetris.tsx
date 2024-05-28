"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Settings } from "lucide-react";
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
    <div className="relative z-10 flex h-svh w-full flex-col items-center justify-center overscroll-none bg-background">
      {/* <div
        className={cn(
          "py-4 opacity-100 transition-all duration-200",
          board.status !== "playing" && "pointer-events-none opacity-0",
        )}
      >
        <Settings />
      </div> */}
      <div
        className="flex h-full w-full flex-col items-center justify-center p-4"
        ref={boardRef}
      >
        <div
          className={cn("grid h-full gap-1")}
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
                  "aspect-square rounded-sm bg-primary/5",
                  cell.tetrominoId
                    ? "rounded-none bg-primary"
                    : isActiveTetromino(cellIndex, rowIndex)
                      ? "bg-primary/90"
                      : isBelowActiveTetromino(cellIndex, rowIndex) &&
                        "bg-primary/10",
                )}
              />
            )),
          )}
        </div>
      </div>
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-background/30 opacity-100 transition-all duration-200",
          board.status === "playing" && "pointer-events-none opacity-0",
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
  );
};
