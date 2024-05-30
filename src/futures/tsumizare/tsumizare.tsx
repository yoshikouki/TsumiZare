"use client";

import {
  Award,
  Box,
  Crown,
  DoorOpen,
  Pause,
  Play,
  RefreshCcw,
  Square,
  StepForward,
  StepForwardIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GameControlButton } from "./game-control-button";
import { GameControlContainer } from "./game-control-container";
import { useTsumiZare } from "./use-tsumizare";

export const TsumiZare = () => {
  const {
    board,
    queuedBlocks,
    result,
    gameRef,
    boardRef,
    startTsumiZare,
    finishTsumiZare,
    pauseTsumiZare,
    resumeTsumiZare,
    readyTsumiZare,
    isActiveCell,
    isBelowActiveBlock,
  } = useTsumiZare();

  return (
    <div
      className="relative z-10 flex h-svh w-full flex-col items-center justify-center overscroll-none"
      ref={gameRef}
    >
      {/* Game Header */}
      <div
        className={cn(
          "flex w-full max-w-xs justify-between pt-4 pb-1 opacity-100 transition-all duration-200",
          board.status === "ready" && "pointer-events-none opacity-0",
        )}
      >
        <div
          className={cn(
            "flex h-10 items-center justify-center gap-2 whitespace-nowrap font-medium text-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          )}
        >
          {queuedBlocks[0] && (
            <>
              <div className="text-primary/50">Next</div>
              <div
                className="grid gap-[2px]"
                style={{
                  gridTemplateColumns: `repeat(${queuedBlocks[0].shape[0].length}, 1fr)`,
                  gridTemplateRows: `repeat(${queuedBlocks[0].shape.length}, 1fr)`,
                }}
              >
                {queuedBlocks[0].shape.map((row, rowIndex) =>
                  row.map((cell, cellIndex) => (
                    <div
                      key={`${queuedBlocks[0]}-${rowIndex}-${cellIndex}`}
                      className={cn(
                        "aspect-square min-w-2 bg-primary",
                        cell ? "opacity-100" : "opacity-0",
                      )}
                    />
                  )),
                )}
              </div>
            </>
          )}
        </div>
        <div
          className={cn(
            "flex h-10 items-center justify-center gap-2 whitespace-nowrap font-medium text-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          )}
        >
          <div className="text-primary/50">{result.score}</div>
          <Button
            type="button"
            variant={"ghost"}
            size={"icon"}
            onClick={pauseTsumiZare}
          >
            <Pause className="fill-primary stroke-1 stroke-primary" />
          </Button>
        </div>
      </div>

      {/* Game Board */}
      <div
        className="flex h-full w-full flex-col items-center px-4"
        ref={boardRef}
      >
        <div
          className={cn("grid max-h-svh w-full max-w-xs gap-1")}
          style={{
            gridTemplateRows: `repeat(${board.config.rowsNumber}, 1fr)`,
            gridTemplateColumns: `repeat(${board.config.colsNumber}, 1fr)`,
          }}
        >
          {board.rows.map((row, rowIndex) =>
            row.cells.map((cell, cellIndex) => (
              <div
                key={cell.id}
                className={cn(
                  "aspect-square rounded-sm bg-primary/5",
                  cell.blockId
                    ? "rounded-none bg-primary"
                    : isActiveCell(cellIndex, rowIndex)
                      ? "bg-primary/90"
                      : isBelowActiveBlock(cellIndex, rowIndex) &&
                        "bg-primary/10",
                )}
              />
            )),
          )}
        </div>
      </div>

      {/* Game Controller */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center bg-background/30 opacity-100 transition-all duration-200",
          board.status === "playing" && "pointer-events-none opacity-0",
        )}
      >
        {/* Ready to play */}
        <GameControlContainer isVisible={board.status === "ready"}>
          <GameControlButton onClick={startTsumiZare} className="group">
            <Play
              className="fill-primary-foreground stroke-primary-foreground group-hover:fill-primary group-hover:stroke-primary"
              size="40"
            />
            Play
          </GameControlButton>
        </GameControlContainer>

        {/* Pause */}
        <GameControlContainer
          isVisible={board.status === "pause"}
          className="rounded border bg-background p-4"
        >
          <div className="py-8">
            <Pause className="fill-primary stroke-primary" size="40" />
          </div>
          <div className="flex w-full gap-2">
            <GameControlButton
              onClick={resumeTsumiZare}
              className="group py-10"
            >
              <Play
                className="fill-primary-foreground stroke-primary-foreground group-hover:fill-primary group-hover:stroke-primary"
                size="40"
              />
            </GameControlButton>
            <GameControlButton
              onClick={finishTsumiZare}
              variant={"outline"}
              className="aspect-square flex-1 py-10"
            >
              <Square className="fill-primary" size="40" />
            </GameControlButton>
          </div>
        </GameControlContainer>

        {/* Finish result */}
        <GameControlContainer isVisible={board.status === "finished"}>
          <div className="flex aspect-square w-full flex-col items-center justify-center gap-4 rounded border bg-background p-4">
            <div className="mb-8 flex items-center justify-center gap-1">
              <Crown className="fill-primary stroke-primary" size="40" />
            </div>

            <div className="inline-flex items-center justify-center gap-2">
              <Award className="stroke-primary" size="32" />
              <span className="font-black text-4xl">{result.score}</span>
            </div>

            <div className="inline-flex items-center justify-center gap-2">
              <Box className="stroke-primary" size="28" />
              <span className="font-black text-4xl">
                {result.filledRowsNumber * board.config.colsNumber}
              </span>
            </div>
          </div>

          <div className="flex w-full gap-2">
            <GameControlButton onClick={startTsumiZare} className="group py-10">
              <StepForward
                className="stroke-primary-foreground group-hover:fill-primary group-hover:stroke-primary"
                size="40"
              />
            </GameControlButton>
            <GameControlButton
              onClick={readyTsumiZare}
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
