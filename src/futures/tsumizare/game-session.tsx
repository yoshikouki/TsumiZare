"use client";

import { createGame, createGameRunner, type GameRunner } from "blocky-game";
import { createContext, useContext, useEffect, useState } from "react";

export const GameSessionContext = createContext<GameRunner | null>(null);

export function GameSession({
  children,
  gravity,
}: {
  children: React.ReactNode;
  gravity: number | null;
}) {
  const [runner] = useState(() => createGameRunner(createGame({ gravity })));
  useEffect(() => {
    // Time keeps passing while a hidden page's timers are throttled or frozen,
    // so the game would play itself out before the player comes back.
    const pauseWhenHidden = () => {
      if (document.hidden) {
        runner.send({ type: "pause" });
      }
    };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => {
      document.removeEventListener("visibilitychange", pauseWhenHidden);
      // Stop the clock on unmount while keeping the runner usable in Strict Mode.
      runner.send({ type: "pause" });
    };
  }, [runner]);
  return <GameSessionContext value={runner}>{children}</GameSessionContext>;
}

export function useGameSession() {
  const runner = useContext(GameSessionContext);
  if (!runner) {
    throw new Error("A game session is required");
  }
  return runner;
}
