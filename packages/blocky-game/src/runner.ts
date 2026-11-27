import {
  type Command,
  type Game,
  type GameEvent,
  msUntilNextStep,
  step,
} from "./core/game.js";

type InputCommand = Exclude<Command, { type: "advance" }>;
type Listener = (game: Game, events: GameEvent[]) => void;

export interface GameRunner {
  getGame: () => Game;
  send: (command: InputCommand) => void;
  subscribe: (listener: Listener) => () => void;
  dispose: () => void;
}

const MAX_TIMEOUT = 2 ** 31 - 1;

export function createGameRunner(initialGame: Game): GameRunner {
  let game = initialGame;
  let lastUpdate = performance.now();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;
  const listeners = new Set<Listener>();

  function apply(command: Command) {
    const result = step(game, command);
    if (result.game === game && result.events.length === 0) {
      return;
    }
    ({ game } = result);
    for (const listener of listeners) {
      listener(result.game, result.events);
    }
  }

  function applyElapsed() {
    const now = performance.now();
    const ms = now - lastUpdate;
    lastUpdate = now;
    if (msUntilNextStep(game) !== null) {
      apply({ type: "advance", ms });
    }
  }

  function cancelTimer() {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
  }

  function schedule() {
    cancelTimer();
    const next = msUntilNextStep(game);
    if (disposed || next === null) {
      return;
    }
    const remaining = next - (performance.now() - lastUpdate);
    timer = setTimeout(
      () => {
        timer = undefined;
        try {
          applyElapsed();
        } finally {
          schedule();
        }
      },
      Math.max(0, Math.min(Math.ceil(remaining), MAX_TIMEOUT))
    );
  }

  schedule();
  return {
    getGame: () => game,
    send(command) {
      if (disposed) {
        return;
      }
      cancelTimer();
      try {
        applyElapsed();
        if (!disposed) {
          apply(command);
        }
      } finally {
        schedule();
      }
    },
    subscribe(listener) {
      if (!disposed) {
        listeners.add(listener);
      }
      return () => {
        listeners.delete(listener);
      };
    },
    dispose() {
      disposed = true;
      cancelTimer();
      listeners.clear();
    },
  };
}
