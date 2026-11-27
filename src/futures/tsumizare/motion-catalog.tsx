"use client";

import {
  BLOCKS,
  type Block,
  createGame,
  createGameRunner,
  type Game,
  type GameRunner,
  step,
} from "blocky-game";
import { useGame } from "blocky-game/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Board } from "./components/board";
import { Score } from "./components/score";
import { GameSessionContext } from "./game-session";

type Input = Parameters<GameRunner["send"]>[0];

interface Scene {
  name: string;
  game: () => Game;
  // Sent shortly after the scene appears. A scene with gravity plays itself.
  play: Input[];
}

const VERTICAL_I = [[1], [1], [1], [1]];
const STACK = ["..##......", ".###..#..."];
const LINE = "#########.";

// A playing game whose bottom rows are drawn by lines, with piece in the air.
function scene(
  lines: string[],
  piece: Omit<Block, "id">,
  overrides: Partial<Game> = {}
): Game {
  const started = step(createGame({ gravity: null }, 1), {
    type: "start",
  }).game;
  const top = started.rows.length - lines.length;
  return {
    ...started,
    piece: { ...piece, id: "catalog-piece" },
    rows: started.rows.map((row, y) =>
      y < top
        ? row
        : {
            ...row,
            cells: row.cells.map((cell, x) => ({
              ...cell,
              blockId: lines[y - top][x] === "#" ? "catalog" : null,
            })),
          }
    ),
    ...overrides,
  };
}

const clear = (rows: number, result?: Game["result"]) =>
  scene(
    [...STACK, ...Array.from({ length: rows }, () => LINE)],
    { shape: VERTICAL_I, position: { x: 9, y: 16 } },
    result ? { result } : {}
  );

const PLACE: Input[] = [{ type: "place" }];

const SCENES: Scene[] = [
  {
    name: "着地",
    game: () => scene([], { shape: BLOCKS.T, position: { x: 3, y: 18 } }),
    play: PLACE,
  },
  {
    name: "着地（横長）",
    game: () => scene([], { shape: BLOCKS.I, position: { x: 3, y: 19 } }),
    play: PLACE,
  },
  {
    name: "ロック猶予",
    game: () => {
      const game = scene([], { shape: BLOCKS.L, position: { x: 3, y: 18 } });
      const rules = { ...game.rules, gravity: 333 };
      return { ...game, rules, gravityIn: 333, lockIn: rules.lockDelay };
    },
    play: [],
  },
  {
    name: "動けない入力",
    game: () => scene([], { shape: BLOCKS.O, position: { x: 0, y: 8 } }),
    play: [{ type: "move", direction: "left" }],
  },
  {
    name: "回転",
    game: () => scene([], { shape: BLOCKS.T, position: { x: 3, y: 8 } }),
    play: [{ type: "rotate" }],
  },
  { name: "1行消し", game: () => clear(1), play: PLACE },
  { name: "2行消し", game: () => clear(2), play: PLACE },
  { name: "3行消し", game: () => clear(3), play: PLACE },
  { name: "4行消し", game: () => clear(4), play: PLACE },
  {
    name: "スコア 中盤",
    game: () => clear(1, { score: 910, filledRowsNumber: 6 }),
    play: PLACE,
  },
  {
    name: "スコア 終盤",
    game: () => clear(4, { score: 12_400, filledRowsNumber: 15 }),
    play: PLACE,
  },
];

export const MotionCatalog = () => {
  // A scene mounts on a click, so nothing runs while the server renders.
  const [run, setRun] = useState<{ id: number; scene: Scene } | null>(null);

  return (
    <main className="mx-auto flex max-w-2xl gap-8 p-8">
      <nav className="flex w-40 flex-col items-start gap-1">
        {SCENES.map((item) => (
          <button
            className={cn(
              "cursor-pointer text-left",
              run?.scene === item ? "font-black" : "text-primary/50"
            )}
            key={item.name}
            onClick={() =>
              setRun((current) => ({ id: (current?.id ?? 0) + 1, scene: item }))
            }
            type="button"
          >
            {item.name}
          </button>
        ))}
      </nav>
      {run ? <Stage key={run.id} scene={run.scene} /> : null}
    </main>
  );
};

function Stage({ scene: { game: createScene, play } }: { scene: Scene }) {
  const [runner] = useState(() => createGameRunner(createScene()));
  const game = useGame(runner);

  useEffect(() => {
    // Strict Mode mounts twice, and the cleanup below pauses the clock.
    runner.send({ type: "resume" });
    const timeout = setTimeout(() => {
      for (const command of play) {
        runner.send(command);
      }
    }, 400);
    return () => {
      clearTimeout(timeout);
      runner.send({ type: "pause" });
    };
  }, [runner, play]);

  return (
    <GameSessionContext value={runner}>
      <div className="flex w-80 flex-col items-end">
        <div className="flex h-10 items-center text-sm font-medium">
          <Score score={game.result.score} />
        </div>
        <Board boardRef={null} game={game} />
      </div>
    </GameSessionContext>
  );
}
