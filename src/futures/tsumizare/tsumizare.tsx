"use client";

import { DoorOpen, Pause, Play, Square, StepForward } from "lucide-react";
import { Board, BoardCell } from "./components/board";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTsumiZare } from "tsumizare";
import { BlockViewer } from "./components/block-viewer";
import { TickRunner } from "./components/tick-runner";
import { GameControlButton } from "./game-control-button";
import { GameControlContainer } from "./game-control-container";
import { ResultViewer } from "./result-viewer";

export const TsumiZare = () => {
  const {
    board,
    queuedBlocks,
    result,
    boardRef,
    tickRunnerRef,
    startTsumiZare,
    finishTsumiZare,
    pauseTsumiZare,
    resumeTsumiZare,
    readyTsumiZare,
    detectCellVariant,
  } = useTsumiZare();

  return (
    <div className="relative z-10 flex h-svh w-full flex-col items-center justify-center overscroll-none">
      <TickRunner tickRunnerRef={tickRunnerRef} />
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
              <BlockViewer block={queuedBlocks[0]} />
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
      <Board boardRef={boardRef} boardConfig={board.config}>
        {board.rows.map((row, rowIndex) =>
          row.cells.map((cell, cellIndex) => (
            <BoardCell
              key={cell.id}
              variant={detectCellVariant(cell, cellIndex, rowIndex)}
            />
          )),
        )}
      </Board>

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
          <ResultViewer
            score={result.score}
            filledCellsNumber={
              result.filledRowsNumber * board.config.colsNumber
            }
          />

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
