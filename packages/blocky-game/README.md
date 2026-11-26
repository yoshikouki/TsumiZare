# blocky-game

React hooks and game logic for falling-block puzzle games.

## Usage

Wrap the game in `BlockyGameProvider`, then read the board and controls from `useBlockyGame`.
Pass `autoDrop: true` to make blocks fall on their own.
A block that touches down locks 500ms later. Each move or rotation on the ground restarts that wait, and a tick never locks it.

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

A line clear commits as a React transition with the type `LINE_CLEAR_TRANSITION`. Wrap rows in `<ViewTransition>` to animate it.
Any action sent while that transition is pending joins it, so every committed frame shows the actions in the order they were sent.

The public API is exported from [`src/index.ts`](./src/index.ts).
TsumiZare wraps its routes in the provider ([`src/routes/index.tsx`](../../src/routes/index.tsx)) and builds the game on the hook ([`tsumizare.tsx`](../../src/futures/tsumizare/tsumizare.tsx)).

## Release

Bump `version`, merge it, then push the tag `blocky-game@<version>` on that commit.
[`publish.yml`](../../.github/workflows/publish.yml) stages the package through npm trusted publishing, and a maintainer approves it with 2FA in the Staged Packages tab on npmjs.com.
