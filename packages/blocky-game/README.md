# blocky-game

React hooks and game logic for falling-block puzzle games.

## Usage

Wrap the game in `BlockyGameProvider`, then read the board and controls from `useBlockyGame`.

```tsx
import { BlockyGameProvider, useBlockyGame } from "blocky-game";

const Game = () => {
  const { board, startBlockyGame } = useBlockyGame();
  // Render board.rows as the playing field.
  return <button onClick={startBlockyGame}>{board.status}</button>;
};

export const App = () => (
  <BlockyGameProvider>
    <Game />
  </BlockyGameProvider>
);
```

The public API is exported from [`src/index.ts`](./src/index.ts).
TsumiZare's [`tsumizare.tsx`](../../src/futures/tsumizare/tsumizare.tsx) is a complete example.

## Build

`bun run build` bundles ESM and CommonJS with tsup, then emits declarations with `tsc`.
Declarations mirror `src` under `dist` and are published from `dist/index.d.ts`.
tsup's `dts` option is not used because it depends on the TypeScript JavaScript API and fails with TypeScript 7.
