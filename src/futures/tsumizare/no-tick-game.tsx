"use client";

import { useGame } from "blocky-game/react";
import {
  DoorOpen,
  Grid2x2Check,
  Pause,
  Play,
  Square,
  StepForward,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { BlockViewer } from "@/futures/tsumizare/components/block-viewer";
import { Board } from "@/futures/tsumizare/components/board";
import { GameControlButton } from "@/futures/tsumizare/game-control-button";
import { GameControlContainer } from "@/futures/tsumizare/game-control-container";
import { ResultViewer } from "@/futures/tsumizare/result-viewer";
import { cn } from "@/lib/utils";
import { useGameSession } from "./game-session";
import { useGameInput } from "./input/use-game-input";

export const NoTickGame = () => {
  const runner = useGameSession();
  const game = useGame(runner);
  const { queue, result, rules, status } = game;
  const boardRef = useGameInput(runner, "stacking");

  return (
    <div
      className={cn(
        "relative z-10 flex h-svh w-full flex-col items-center justify-center overscroll-none",
        "sm:h-full sm:overflow-hidden sm:overscroll-auto"
      )}
    >
      {/* Game Header */}
      <div
        className={cn(
          "flex w-full max-w-xs justify-between pt-4 pb-1 opacity-100 transition-all duration-200",
          status === "ready" && "pointer-events-none opacity-0"
        )}
      >
        <Button
          type="button"
          variant={"outline"}
          onClick={() => runner.send({ type: "skip" })}
          className={cn(
            "flex h-10 items-center justify-center gap-2 text-sm font-medium whitespace-nowrap",
            "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
          )}
        >
          {queue[0] ? (
            <>
              <div className="text-primary/50">Next</div>
              <BlockViewer block={queue[0]} />
            </>
          ) : null}
        </Button>
        <div
          className={cn(
            "flex h-10 items-center justify-center gap-2 text-sm font-medium whitespace-nowrap",
            "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
          )}
        >
          <Button
            type="button"
            variant={"outline"}
            size={"icon"}
            aria-label="一時停止"
            onClick={() => runner.send({ type: "pause" })}
          >
            <Pause className="fill-primary stroke-primary stroke-1" />
          </Button>
          <Button
            type="button"
            variant={"default"}
            size={"icon"}
            aria-label="ブロックを置く"
            onClick={() => runner.send({ type: "place" })}
          >
            <Grid2x2Check className="stroke-primary-foreground" />
          </Button>
        </div>
      </div>

      {/* Game Board */}
      <Board boardRef={boardRef} game={game} />

      {/* Game Controller */}
      <div
        className={cn(
          "bg-background/30 absolute inset-0 flex flex-col items-center justify-center opacity-100 transition-all duration-200",
          status === "playing" && "pointer-events-none opacity-0"
        )}
      >
        {/* Ready to play */}
        <GameControlContainer isVisible={status === "ready"}>
          <GameControlButton
            onClick={() => runner.send({ type: "start" })}
            className="group"
          >
            <Play
              className="fill-primary-foreground stroke-primary-foreground group-hover:fill-primary group-hover:stroke-primary"
              size="40"
            />
            Play
          </GameControlButton>
        </GameControlContainer>

        {/* Pause */}
        <GameControlContainer
          isVisible={status === "paused"}
          className="bg-background rounded border p-4"
        >
          <div className="py-8">
            <Pause className="fill-primary stroke-primary" size="40" />
          </div>
          <div className="flex w-full gap-2">
            <GameControlButton
              aria-label="再開"
              onClick={() => runner.send({ type: "resume" })}
              className="group py-10"
            >
              <Play
                className="fill-primary-foreground stroke-primary-foreground group-hover:fill-primary group-hover:stroke-primary"
                size="40"
              />
            </GameControlButton>
            <GameControlButton
              aria-label="終了"
              onClick={() => runner.send({ type: "finish" })}
              variant={"outline"}
              className="aspect-square flex-1 py-10"
            >
              <Square className="fill-primary" size="40" />
            </GameControlButton>
          </div>
        </GameControlContainer>

        {/* Finish result */}
        <GameControlContainer isVisible={status === "finished"}>
          <ResultViewer
            score={result.score}
            filledCellsNumber={result.filledRowsNumber * rules.cols}
          />

          <div className="flex w-full gap-2">
            <GameControlButton
              aria-label="もう一度遊ぶ"
              onClick={() => runner.send({ type: "start" })}
              className="group py-10"
            >
              <StepForward
                className="stroke-primary-foreground group-hover:fill-primary group-hover:stroke-primary"
                size="40"
              />
            </GameControlButton>
            <GameControlButton
              aria-label="ゲーム選択に戻る"
              onClick={() => runner.send({ type: "reset" })}
              variant={"outline"}
              className="aspect-square flex-1 py-10"
            >
              <DoorOpen className="stroke-primary" size="40" />
            </GameControlButton>
          </div>
        </GameControlContainer>
      </div>
    </div>
  );
};
