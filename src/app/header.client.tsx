"use client";

import { useTetris } from "@/futures/tetris/use-tetris";
import { cn } from "@/lib/utils";

export const ClientHeader = () => {
  const { board } = useTetris();

  return (
    <>
      <h1
        className={cn(
          "font-black text-6xl",
          board.status === "playing" && "hidden",
        )}
      >
        Tetris
      </h1>
    </>
  );
};
