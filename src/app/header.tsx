"use client";

import { cn } from "@/lib/utils";
import { useBlockyGame } from "blocky-game";

export const Header = ({ children }: { children: React.ReactNode }) => {
  const { board } = useBlockyGame();

  return (
    <header
      className={cn(
        "fixed z-30 flex w-full justify-center bg-gradient-to-b from-background to-background/0 py-3 opacity-100 transition-all duration-200",
        board.status !== "ready" && "pointer-events-none opacity-0",
      )}
    >
      {children}
    </header>
  );
};
