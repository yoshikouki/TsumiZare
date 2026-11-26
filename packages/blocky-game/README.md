# blocky-game

React hooks and game logic for falling-block puzzle games.

## Usage

Wrap the game in `BlockyGameProvider`, then read the board and controls from `useBlockyGame`.
Pass `autoDrop: true` to make blocks fall on their own.

```tsx
import { BlockyGameProvider, useBlockyGame } from "blocky-game";

const Game = () => {
  const { board, startBlockyGame } = useBlockyGame({ autoDrop: true });
  // Render board.rows as the playing field.
  return <button onClick={startBlockyGame}>{board.status}</button>;
};

export const App = () => (
  <BlockyGameProvider>
    <Game />
  </BlockyGameProvider>
);
```

Call `useBlockyGame` once per game, because it listens to the keyboard. Read the game anywhere else with `useBlockyGameState`.

The public API is exported from [`src/index.ts`](./src/index.ts).
TsumiZare wraps its routes in the provider ([`src/routes/index.tsx`](../../src/routes/index.tsx)) and builds the game on the hook ([`tsumizare.tsx`](../../src/futures/tsumizare/tsumizare.tsx)).

## Build

Declarations are emitted by `tsc`, not by tsup's `dts` option.
tsup's `dts` depends on the TypeScript JavaScript API and fails with TypeScript 7.0.
