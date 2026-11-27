import { afterEach, beforeEach, expect, spyOn, test } from "bun:test";
import { mock } from "node:test";
import { createGame, createGameRunner, type GameEvent } from "./index";

let now = 0;
let restoreClock: () => void;

beforeEach(() => {
  now = 0;
  const clock = spyOn(performance, "now").mockImplementation(() => now);
  restoreClock = () => clock.mockRestore();
  mock.timers.enable({ apis: ["setTimeout"] });
});

afterEach(() => {
  mock.timers.reset();
  restoreClock();
});

function elapse(ms: number) {
  now += ms;
  mock.timers.tick(ms);
}

test("the runner schedules gravity, catches up and delivers ordered events", () => {
  const runner = createGameRunner(
    createGame(
      { cols: 4, rows: 2, gravity: 100, lockDelay: 50, shapes: [[[1]]] },
      0
    )
  );
  const events: GameEvent[] = [];
  runner.subscribe((game, nextEvents) => {
    expect(game).toBe(runner.getGame());
    events.push(...nextEvents);
  });
  elapse(1000);
  expect(runner.getGame().status).toBe("ready");
  expect(events).toEqual([]);

  runner.send({ type: "start" });
  elapse(99);
  expect(events).toEqual([]);
  elapse(1);
  expect(runner.getGame().piece?.position.y).toBe(0);
  expect(events.map((event) => event.type)).toEqual(["spawned"]);

  elapse(199);
  expect(runner.getGame().piece).toBeNull();
  expect(events.map((event) => event.type)).toEqual(["spawned", "locked"]);
  elapse(1);
  expect(runner.getGame().piece?.position.y).toBe(0);
  expect(events.map((event) => event.type)).toEqual([
    "spawned",
    "locked",
    "spawned",
  ]);
  runner.dispose();
});

test("send advances time before applying input even when a timer runs late", () => {
  const runner = createGameRunner(
    createGame({ cols: 4, gravity: 100, shapes: [[[1]]] }, 0)
  );
  runner.send({ type: "start" });
  now = 101;
  runner.send({ type: "move", direction: "right" });
  expect(runner.getGame().piece?.position).toEqual({ x: 1, y: 0 });
  runner.dispose();
});

test("unsubscribe removes the listener and dispose stops the game clock", () => {
  const runner = createGameRunner(createGame({ gravity: 100 }, 0));
  const calls: string[] = [];
  const unsubscribe = runner.subscribe((game) => calls.push(game.status));
  runner.send({ type: "start" });
  expect(calls).toEqual(["playing"]);

  unsubscribe();
  elapse(100);
  const snapshot = runner.getGame();
  expect(snapshot.piece?.position.y).toBe(0);
  expect(calls).toEqual(["playing"]);

  runner.dispose();
  elapse(10_000);
  runner.send({ type: "reset" });
  expect(runner.getGame()).toBe(snapshot);
  expect(calls).toEqual(["playing"]);
});
