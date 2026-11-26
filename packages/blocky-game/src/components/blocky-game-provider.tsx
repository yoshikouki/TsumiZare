"use client";

import {
  addTransitionType,
  createContext,
  startTransition,
  useLayoutEffect,
  useReducer,
  useRef,
} from "react";

import { initBoard } from "../core/board.js";
import {
  type Game,
  type GameAction,
  gameReducer,
  initGame,
} from "../core/game.js";

export const LINE_CLEAR_TRANSITION = "line-clear";

export interface BlockyGameContext {
  game: Game;
  send: (action: GameAction) => void;
}

export const BlockyGameContext = createContext<BlockyGameContext>({
  game: initGame(initBoard()),
  send: () => undefined,
});

interface VersionedGame {
  game: Game;
  version: number;
}

const reduce = (state: VersionedGame, action: GameAction): VersionedGame => ({
  game: gameReducer(state.game, action),
  version: state.version + 1,
});

const createGame = (): VersionedGame => ({
  game: initGame(initBoard()),
  version: 0,
});

interface SentAction {
  action: GameAction;
  version: number;
  lineClear: boolean;
}

const prefersReducedMotion = () =>
  matchMedia("(prefers-reduced-motion: reduce)").matches;

export const BlockyGameProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(reduce, undefined, createGame);
  const sent = useRef(state);
  // The version a line clear reaches once it commits, while it has not yet.
  const clearing = useRef<number | null>(null);
  const waiting = useRef<SentAction[]>([]);

  // A line clear commits as a transition so <ViewTransition> can animate it.
  // An urgent update sent before that commit would render on the board
  // without the clear, so actions wait here until the clear commits. React
  // then renders them right after the animation starts.
  const run = ({ action, version, lineClear }: SentAction) => {
    if (!lineClear) {
      dispatch(action);
      return;
    }
    // React holds a transition's commit until the running view transition
    // finishes, so the previous clear's animation ends once it has started.
    // Skipping it before ready would make React report an aborted transition.
    const running = document.activeViewTransition;
    running?.ready.then(
      () => running.skipTransition(),
      () => undefined
    );
    clearing.current = version;
    startTransition(() => {
      addTransitionType(LINE_CLEAR_TRANSITION);
      dispatch(action);
    });
  };

  const runWaiting = () => {
    while (clearing.current === null && waiting.current.length > 0) {
      run(waiting.current.shift() as SentAction);
    }
  };

  useLayoutEffect(() => {
    if (clearing.current !== null && state.version >= clearing.current) {
      clearing.current = null;
      runWaiting();
    }
  });

  const send = (action: GameAction) => {
    const previous = sent.current;
    sent.current = reduce(previous, action);
    waiting.current.push({
      action,
      version: sent.current.version,
      lineClear:
        sent.current.game.board.result.filledRowsNumber >
          previous.game.board.result.filledRowsNumber &&
        !prefersReducedMotion(),
    });
    runWaiting();
  };

  return (
    <BlockyGameContext value={{ game: state.game, send }}>
      {children}
    </BlockyGameContext>
  );
};
