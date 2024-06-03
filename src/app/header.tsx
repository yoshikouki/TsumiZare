"use client";

import { cn } from "@/lib/utils";
import { useBlockyGame } from "blocky-game";
import Link from "next/link";

export const Header = () => {
  const { board } = useBlockyGame();

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
        <Link href="/">
          <h1 className={"font-black text-4xl"}>TsumiZare</h1>
        </Link>
      </div>
    </header>
  );
};
