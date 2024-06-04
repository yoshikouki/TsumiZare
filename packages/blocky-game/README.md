# blocky-game

`blocky-game` is a custom hook designed to simplify the implementation of block games in React. By using this hook, you can easily manage the core logic and state of the game.

## Install

```bash
npm install blocky-game
```

or

```bash
bun add blocky-game
```

## Usage

First, wrap your application with the `BlockyGameProvider` component. Then, use the `useBlockyGame` hook to get the game state and controls.

```ts
import { BlockyGameProvider } from "blocky-game";
import { BlockyGame } from "@/components/BlockyGame";

export default function HomePage() {
  return (
    <BlockyGameProvider>
      <BlockyGame />
    </BlockyGameProvider>
  );
}
```

### Custom Hook API

Below is a list of the main functions and variables provided by the `useBlockyGame` hook in a table format:

| Variable/Function       | Description                                    |
|-------------------------|------------------------------------------------|
| `board`                 | The current state of the game board            |
| `queuedBlocks`          | The list of upcoming blocks in the queue       |
| `result`                | The current game result (score, etc.)          |
| `boardRef`              | Reference to the game board                    |
| `tickRunnerRef`         | Reference to the tick runner                   |
| `startBlockyGame`        | Function to start the game                     |
| `finishBlockyGame`       | Function to finish the game                    |
| `pauseBlockyGame`        | Function to pause the game                     |
| `resumeBlockyGame`       | Function to resume the game                    |
| `readyBlockyGame`        | Function to set the game to the ready state    |
| `detectCellVariant`     | Function to detect the variant of a cell       |

Using this hook, you can quickly implement the core functionality of a block game. Refer to the code example above for more details on how to use it.

### BlockyGame Component Example

Here is an example of using the `BlockyGame` component. This component contains the main elements of the game and uses the `useBlockyGame` hook to manage the game state.

```ts
import { useBlockyGame } from "blocky-game";
import { Button } from "@/components/ui/button";
import { Board, BoardCell, TickRunner, GameControlButton, GameControlContainer, BlockViewer, ResultViewer } from "@/components/ui";

export const BlockyGame = () => {
  const {
    board,
    queuedBlocks,
    result,
    boardRef,
    tickRunnerRef,
    startBlockyGame,
    finishBlockyGame,
    pauseBlockyGame,
    resumeBlockyGame,
    readyBlockyGame,
    detectCellVariant,
  } = useBlockyGame();

  return (
    <div className="relative z-10 flex h-svh w-full flex-col items-center justify-center overscroll-none">
      <TickRunner tickRunnerRef={tickRunnerRef} />

      {/* Game Header */}
      <div className="flex w-full max-w-xs justify-between pt-4 pb-1 opacity-100 transition-all duration-200">
        <div className="flex h-10 items-center justify-center gap-2 whitespace-nowrap font-medium text-sm">
          {queuedBlocks[0] && (
            <>
              <div className="text-primary/50">Next</div>
              <BlockViewer block={queuedBlocks[0]} />
            </>
          )}
        </div>
        <div className="flex h-10 items-center justify-center gap-2 whitespace-nowrap font-medium text-sm">
          <div className="text-primary/50">{result.score}</div>
          <Button type="button" variant="ghost" size="icon" onClick={pauseBlockyGame}>
            <Pause className="fill-primary stroke-1 stroke-primary" />
          </Button>
        </div>
      </div>

      {/* Game Board */}
      <Board boardRef={boardRef} boardConfig={board.config}>
        {board.rows.map((row, rowIndex) =>
          row.cells.map((cell, cellIndex) => (
            <BoardCell key={cell.id} variant={detectCellVariant(cell, cellIndex, rowIndex)} />
          ))
        )}
      </Board>

      {/* Game Controller */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/30 opacity-100 transition-all duration-200">
        {/* Ready to play */}
        <GameControlContainer isVisible={board.status === "ready"}>
          <GameControlButton onClick={startBlockyGame} className="group">
            <Play className="fill-primary-foreground stroke-primary-foreground group-hover:fill-primary group-hover:stroke-primary" size="40" />
            Play
          </GameControlButton>
        </GameControlContainer>

        {/* Pause */}
        <GameControlContainer isVisible={board.status === "pause"} className="rounded border bg-background p-4">
          <div className="py-8">
            <Pause className="fill-primary stroke-primary" size="40" />
          </div>
          <div className="flex w-full gap-2">
            <GameControlButton onClick={resumeBlockyGame} className="group py-10">
              <Play className="fill-primary-foreground stroke-primary-foreground group-hover:fill-primary group-hover:stroke-primary" size="40" />
            </GameControlButton>
            <GameControlButton onClick={finishBlockyGame} variant="outline" className="aspect-square flex-1 py-10">
              <Square className="fill-primary" size="40" />
            </GameControlButton>
          </div>
        </GameControlContainer>

        {/* Finish result */}
        <GameControlContainer isVisible={board.status === "finished"}>
          <ResultViewer score={result.score} filledCellsNumber={result.filledRowsNumber * board.config.colsNumber} />
          <div className="flex w-full gap-2">
            <GameControlButton onClick={startBlockyGame} className="group py-10">
              <StepForward className="stroke-primary-foreground group-hover:fill-primary group-hover:stroke-primary" size="40" />
            </GameControlButton>
            <GameControlButton onClick={readyBlockyGame} variant="outline" className="aspect-square flex-1 py-10">
              <DoorOpen className="stroke-primary" size="40" />
            </GameControlButton>
          </div>
        </GameControlContainer>
      </div>
    </div>
  );
};
```

## Requirement

- React 19 RC +
