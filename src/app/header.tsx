"use client";

import { useTetris } from "@/futures/tetris/use-tetris";
import { cn } from "@/lib/utils";

export const Header = () => {
  const { board } = useTetris();

  return (
    <header
      className={cn(
        "fixed z-30 flex w-full justify-center opacity-100 transition-all duration-200",
        board.status !== "ready" && "pointer-events-none opacity-0",
      )}
    >
      <div
        className={cn(
          "flex w-full max-w-xs justify-center p-4",
          board.status !== "ready" && "pointer-events-none opacity-0",
        )}
      >
        <h1 className={"font-black text-4xl"}>Tetris</h1>
      </div>
    </header>
  );
};
