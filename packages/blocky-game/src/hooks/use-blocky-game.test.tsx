import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import fc from "fast-check";
import { useContext, useLayoutEffect, ViewTransition } from "react";
import { createRoot, type Root } from "react-dom/client";

import {
  BlockyGameContext,
  BlockyGameProvider,
  LINE_CLEAR_TRANSITION,
} from "../components/blocky-game-provider";
import { generateQueuedBlocks, isFilledBlockCell } from "../core/block";
import { type Board, initBoard } from "../core/board";
import { type Game, type GameAction, gameReducer } from "../core/game";
import { useBlockyGame } from "./use-blocky-game";

interface FakeTransition {
  update: () => void;
  ready: () => void;
  finished: () => void;
  updated: boolean;
  isReady: boolean;
  api: { skipTransition: () => void };
}

const fakeViewTransitions = () => {
  const pending: FakeTransition[] = [];
  let started = 0;
  let skipped = 0;
  const finish = (transition: FakeTransition) => {
    // A real transition is ready before it finishes.
    transition.ready();
    transition.finished();
    pending.splice(pending.indexOf(transition), 1);
  };
  Object.assign(document, {
    startViewTransition: ({ update }: { update: () => void }) => {
      started += 1;
      const transition = {
        update,
        updated: false,
        isReady: false,
      } as FakeTransition;
      const api = {
        ready: new Promise<void>((resolve) => {
          transition.ready = () => {
            transition.isReady = true;
            resolve();
          };
        }),
        finished: new Promise<void>((resolve) => {
          transition.finished = resolve;
        }),
        updateCallbackDone: Promise.resolve(),
        skipTransition: () => {
          if (!transition.isReady) {
            throw new Error(
              "The provider skips a transition only once it is ready."
            );
          }
          skipped += 1;
          finish(transition);
        },
      };
      transition.api = api;
      pending.push(transition);
      return api;
    },
    fonts: { status: "loaded", ready: Promise.resolve() },
  });
  Object.defineProperty(document, "activeViewTransition", {
    configurable: true,
    get: () => pending.at(-1)?.api ?? null,
  });
  Object.assign(document.documentElement, { getAnimations: () => [] });
  return {
    get started() {
      return started;
    },
    get skipped() {
      return skipped;
    },
    get pending() {
      return pending.length;
    },
    runUpdate: () => {
      const next = pending.find((transition) => !transition.updated);
      if (next) {
        next.updated = true;
        next.update();
      }
    },
    resolveReady: () => {
      pending.find((transition) => transition.updated)?.ready();
    },
    finish: () => {
      const next = pending.find((transition) => transition.updated);
      if (next) {
        finish(next);
      }
    },
  };
};

// A browser paints only between tasks, so a screen that a commit replaces
// before the task ends is never seen. Tests sample the latest committed screen
// where a paint could happen.
const sample = () => {
  const latest = screens.at(-1);
  if (latest !== undefined && latest !== painted.at(-1)) {
    painted.push(latest);
  }
};

const inSequence = <T,>(items: T[], run: (item: T) => Promise<unknown>) =>
  items.reduce<Promise<unknown>>(
    (previous, item) => previous.then(() => run(item)),
    Promise.resolve()
  );

const macrotask = async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));
  sample();
};

const nearlyFullBoard = (): Board => {
  const board = initBoard();
  for (const row of board.rows.slice(-4)) {
    row.cells.forEach((cell, x) => {
      cell.blockId = x >= 3 && x <= 6 ? null : "old";
    });
  }
  return board;
};

type Screen = string;

const screenOf = (
  rows: Board["rows"],
  variantAt: (x: number, y: number) => "filled" | "active" | "empty",
  score: number,
  status: string
): Screen =>
  [
    ...rows.map((row, y) =>
      row.cells
        .map(
          (_, x) =>
            ".#@"[["empty", "filled", "active"].indexOf(variantAt(x, y))]
        )
        .join("")
    ),
    `${score} ${status}`,
  ].join("\n");

const expectedScreen = (game: Game): Screen =>
  screenOf(
    game.board.rows,
    (x, y) => {
      if (game.board.rows[y].cells[x].blockId) {
        return "filled";
      }
      return game.activeBlock && isFilledBlockCell(x, y, game.activeBlock)
        ? "active"
        : "empty";
    },
    game.board.result.score,
    game.board.status
  );

let root: Root;
let screens: Screen[];
let painted: Screen[];
let initialGame: Game;
let log: GameAction[];
let controls: ReturnType<typeof useBlockyGame>;
let send: (action: GameAction) => void;
let vt: ReturnType<typeof fakeViewTransitions>;
let randomCalls: number;
const originalRandom = Math.random;
// generateRandomBlock picks BLOCKS[floor(random * 7)], so values just above 0
// always pick the I block, which clears a row in the open columns. Each call
// still differs, so ids stay unique.
const onlyIBlocks = () => {
  randomCalls += 1;
  return 0.01 + (randomCalls % 100_000) * 1e-6;
};

const Probe = () => {
  const context = useContext(BlockyGameContext);
  controls = useBlockyGame({ upAction: "moveUp" });
  ({ send } = context);
  initialGame ??= context.game;
  const { board, result, detectCellVariant } = controls;
  const screen = screenOf(
    board.rows,
    (x, y) => {
      const variant = detectCellVariant(board.rows[y].cells[x], x, y);
      return variant === "belowActiveBlock" ? "empty" : variant;
    },
    result.score,
    board.status
  );
  useLayoutEffect(() => {
    screens.push(screen);
  });
  return (
    <div>
      {board.rows.map((row) => (
        <ViewTransition
          default={{ [LINE_CLEAR_TRANSITION]: "auto", default: "none" }}
          key={row.id}
        >
          <div>
            {row.cells.map((cell) => (
              <div data-filled={cell.blockId ? "" : undefined} key={cell.id} />
            ))}
          </div>
        </ViewTransition>
      ))}
    </div>
  );
};

const Recorder = ({ children }: { children: React.ReactNode }) => {
  const context = useContext(BlockyGameContext);
  const record = (action: GameAction) => {
    log.push(action);
    context.send(action);
  };
  return (
    <BlockyGameContext value={{ game: context.game, send: record }}>
      {children}
    </BlockyGameContext>
  );
};

const mount = async () => {
  screens = [];
  painted = [];
  log = [];
  initialGame = undefined as unknown as Game;
  const container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  root.render(
    <BlockyGameProvider>
      <Recorder>
        <Probe />
      </Recorder>
    </BlockyGameProvider>
  );
  await macrotask();
};

const settle = async () => {
  await inSequence(Array.from({ length: 20 }), async () => {
    await macrotask();
    vt.runUpdate();
    await macrotask();
    vt.resolveReady();
    await macrotask();
    vt.finish();
  });
  await macrotask();
};

const activeOverlapsBoard = (game: Game) => {
  const { activeBlock } = game;
  return game.board.rows.some((row, y) =>
    row.cells.some(
      (cell, x) =>
        cell.blockId !== null &&
        activeBlock !== null &&
        isFilledBlockCell(x, y, activeBlock)
    )
  );
};

const expectScreensFollowTheLog = () => {
  const states = [initialGame];
  for (const action of log) {
    states.push(gameReducer(states.at(-1) as Game, action));
  }
  for (const state of states) {
    expect(activeOverlapsBoard(state)).toBe(false);
  }
  const expected = states.map(expectedScreen);
  let prefix = 0;
  sample();
  painted.forEach((screen, index) => {
    const found = expected.findIndex(
      (candidate, i) => i >= prefix && candidate === screen
    );
    expect({ screen: index, followsLog: found >= 0 }).toEqual({
      screen: index,
      followsLog: true,
    });
    prefix = found;
  });
  expect(painted.at(-1)).toBe(expected.at(-1) as Screen);
};

const keys = ["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", " "] as const;
type Step =
  | { kind: "key"; key: (typeof keys)[number] }
  | { kind: "drop" }
  | { kind: "place" }
  | { kind: "tick" }
  | { kind: "macrotask" }
  | { kind: "vtUpdate" }
  | { kind: "vtReady" }
  | { kind: "vtFinish" };

// A browser exposes the event being dispatched as window.event, which React
// reads to give discrete input a sync lane, and runs a microtask checkpoint
// after it.
const asDiscreteEvent = async (event: Event, dispatch: () => void) => {
  Object.assign(window, { event });
  dispatch();
  Object.assign(window, { event: undefined });
  await Promise.resolve();
  sample();
};

const press = (key: string) => {
  const event = new KeyboardEvent("keydown", { key });
  return asDiscreteEvent(event, () => window.dispatchEvent(event));
};

const clickPlace = () =>
  asDiscreteEvent(new MouseEvent("click"), () => controls.placeBlock());

const step = async (s: Step) => {
  switch (s.kind) {
    case "key":
      await press(s.key);
      return;
    case "drop":
      await inSequence(Array.from({ length: 20 }), () => press("ArrowDown"));
      await clickPlace();
      return;
    case "place":
      await clickPlace();
      return;
    case "tick":
      controls.runTick();
      return;
    case "macrotask":
      await macrotask();
      return;
    case "vtUpdate":
      vt.runUpdate();
      break;
    case "vtReady":
      vt.resolveReady();
      break;
    default:
      vt.finish();
  }
  await Promise.resolve();
  sample();
};

const stepArbitrary: fc.Arbitrary<Step> = fc.oneof(
  {
    weight: 4,
    arbitrary: fc
      .constantFrom(...keys)
      .map((key) => ({ kind: "key" as const, key })),
  },
  { weight: 3, arbitrary: fc.constant({ kind: "drop" as const }) },
  { weight: 1, arbitrary: fc.constant({ kind: "place" as const }) },
  { weight: 1, arbitrary: fc.constant({ kind: "tick" as const }) },
  { weight: 2, arbitrary: fc.constant({ kind: "macrotask" as const }) },
  { weight: 1, arbitrary: fc.constant({ kind: "vtUpdate" as const }) },
  { weight: 1, arbitrary: fc.constant({ kind: "vtReady" as const }) },
  { weight: 1, arbitrary: fc.constant({ kind: "vtFinish" as const }) }
);

const startOnNearlyFullBoard = async () => {
  send({
    type: "start",
    board: nearlyFullBoard(),
    queuedBlocks: generateQueuedBlocks(),
  });
  controls.runTick();
  await macrotask();
};

describe("useBlockyGame with a pending line clear", () => {
  beforeEach(() => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: false });
    randomCalls = 0;
    Math.random = onlyIBlocks;
    vt = fakeViewTransitions();
  });

  afterEach(() => {
    root.unmount();
    document.body.replaceChildren();
    Math.random = originalRandom;
  });

  it("applies ArrowUp to the next block when it arrives before the line clear commits", async () => {
    await mount();
    await startOnNearlyFullBoard();
    await step({ kind: "drop" });
    await press("ArrowUp");
    await settle();
    expect(vt.started).toBeGreaterThan(0);
    expectScreensFollowTheLog();
  });

  it("applies ArrowUp to the next block when it arrives while the view transition prepares", async () => {
    await mount();
    await startOnNearlyFullBoard();
    await step({ kind: "drop" });
    await macrotask();
    expect(vt.pending).toBe(1);
    await press("ArrowUp");
    await settle();
    expectScreensFollowTheLog();
  });

  it("shows a key pressed while the view transition prepares once the animation starts", async () => {
    await mount();
    await startOnNearlyFullBoard();
    await step({ kind: "drop" });
    await macrotask();
    expect(vt.pending).toBe(1);
    await press("ArrowLeft");
    await step({ kind: "vtUpdate" });
    await step({ kind: "vtReady" });
    await macrotask();
    expect(vt.pending).toBe(1);
    expect(painted.at(-1)?.split("\n")[0]).toBe("..@@@@....");
    await settle();
    expectScreensFollowTheLog();
  });

  it("ends the previous animation when the next line clear arrives", async () => {
    await mount();
    await startOnNearlyFullBoard();
    await step({ kind: "drop" });
    await macrotask();
    await step({ kind: "vtUpdate" });
    await step({ kind: "vtReady" });
    await step({ kind: "drop" });
    await macrotask();
    expect(vt.skipped).toBe(1);
    expect(vt.started).toBe(2);
    await settle();
    expectScreensFollowTheLog();
  });

  it("drops the next block when a tick arrives while the line clear is pending", async () => {
    await mount();
    await startOnNearlyFullBoard();
    await step({ kind: "drop" });
    controls.runTick();
    await settle();
    expectScreensFollowTheLog();
    expect(log.at(-1)?.type).toBe("tick");
    expect(painted.at(-1)?.split("\n")[1]).toBe("...@@@@...");
  });

  it("keeps every frame on the action log for any interleaving", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(stepArbitrary, { maxLength: 40 }),
        async (steps) => {
          vt = fakeViewTransitions();
          randomCalls = 0;
          await mount();
          try {
            await startOnNearlyFullBoard();
            await inSequence(steps, step);
            await settle();
            expectScreensFollowTheLog();
          } finally {
            root.unmount();
            document.body.replaceChildren();
          }
        }
      ),
      { numRuns: Number(process.env.FC_RUNS ?? 100) }
    );
  }, 120_000);
});
