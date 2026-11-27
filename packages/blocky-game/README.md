# blocky-game

A deterministic falling-block game core. The root export has no React or DOM dependency.

## Core

`createGame(rules?, seed?)` creates a ready game. It defaults to 10 columns, 20 rows, the seven tetrominoes, 333 ms gravity, and a 500 ms lock delay. Set `gravity: null` for stacking mode. The first piece spawns on start and time never moves or locks it.

```ts
import { createGame, step } from "blocky-game";

const ready = createGame({}, 42);
const started = step(ready, { type: "start" }).game;
const { game, events } = step(started, { type: "advance", ms: 333 });
```

`step` takes a snapshot and a command and returns the next snapshot and ordered events. A clear reports the row indexes before the clear. Surviving rows keep their IDs. Use `cellVariant(game, x, y)` to render the board and `msUntilNextStep(game)` to drive your own clock.

## Runner and React

`createGameRunner(game)` drives the clock. Call `runner.send(command)` for input and `runner.subscribe((game, events) => …)` to observe changes. Create one runner per game and dispose of it when its owner is done.

```tsx
import type { GameRunner } from "blocky-game";
import { useGame } from "blocky-game/react";

export function Game({ runner }: { runner: GameRunner }) {
	const game = useGame(runner);
	return (
		<button onClick={() => runner.send({ type: "start" })} type="button">
			Start game ({game.status})
		</button>
	);
}
```

## Release

Bump `version`, merge it, then push the tag `blocky-game@<version>` on that commit.
The [publish workflow](../../.github/workflows/publish.yml) stages the package through npm trusted publishing. A maintainer approves it with 2FA in the Staged Packages tab on npmjs.com.
