"use client";

import { useBlockyGameState } from "blocky-game";
import { cn } from "@/lib/utils";

export const Header = ({ children }: { children: React.ReactNode }) => {
  const { board } = useBlockyGameState();

  return (
    <header
      className={cn(
        "from-background to-background/0 fixed z-30 flex w-full justify-center bg-linear-to-b py-3 opacity-100 transition-all duration-200",
        board.status !== "ready" && "pointer-events-none opacity-0"
      )}
    >
      {children}
    </header>
  );
};
