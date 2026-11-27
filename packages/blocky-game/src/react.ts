"use client";

import { useSyncExternalStore } from "react";
import type { Game } from "./core/game.js";
import type { GameRunner } from "./runner.js";

export function useGame(runner: GameRunner): Game {
  return useSyncExternalStore(runner.subscribe, runner.getGame, runner.getGame);
}
