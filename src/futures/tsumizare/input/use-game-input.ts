import type { Game, GameRunner } from "blocky-game";
import { useCallback, useEffect } from "react";

type Input = Parameters<GameRunner["send"]>[0];
type Status = Game["status"];
type Bindings = Record<Status, Record<string, Input>>;

const SWIPE_THRESHOLD = 30;
const TAP_MOVE_THRESHOLD = 5;
const TAP_DURATION_THRESHOLD = 300;
const LEFT: Input = { type: "move", direction: "left" };
const RIGHT: Input = { type: "move", direction: "right" };
const DOWN: Input = { type: "move", direction: "down" };
const UP: Input = { type: "move", direction: "up" };
const ROTATE: Input = { type: "rotate" };
const START: Input = { type: "start" };
const PAUSE: Input = { type: "pause" };
const RESUME: Input = { type: "resume" };

function swipeCommand(dx: number, dy: number, up: Input) {
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);
  if (Math.max(absX, absY) < SWIPE_THRESHOLD) {
    return;
  }
  if (absX > absY) {
    return dx > 0 ? RIGHT : LEFT;
  }
  if (absY < SWIPE_THRESHOLD * 3) {
    return dy > 0 ? DOWN : up;
  }
}

export function useGameInput(
  runner: GameRunner,
  mode: "standard" | "stacking"
) {
  const up = mode === "stacking" ? UP : ROTATE;

  useEffect(() => {
    const bindings: Bindings = {
      ready: { Enter: START },
      playing: {
        ArrowLeft: LEFT,
        ArrowRight: RIGHT,
        ArrowDown: DOWN,
        ArrowUp: up,
        " ": ROTATE,
        Escape: PAUSE,
        p: PAUSE,
        P: PAUSE,
        ...(mode === "stacking" ? { Enter: { type: "place" } } : {}),
      },
      paused: { Escape: RESUME, p: RESUME, P: RESUME, Enter: RESUME },
      finished: { Enter: START },
    };

    function onKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }
      const { status } = runner.getGame();
      const keys = bindings[status];
      if (!Object.hasOwn(keys, event.key)) {
        return;
      }
      const command = keys[event.key];
      if (
        event.repeat &&
        command.type !== "move" &&
        command.type !== "rotate"
      ) {
        return;
      }
      if (
        status !== "playing" &&
        event.target instanceof Element &&
        event.target.closest('a, button, input, select, textarea, [role="tab"]')
      ) {
        return;
      }
      event.preventDefault();
      runner.send(command);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [runner, mode, up]);

  return useCallback(
    (element: HTMLElement | null) => {
      if (!element) {
        return;
      }

      let start: { x: number; y: number; time: number } | undefined;
      let lastX = 0;
      let lastY = 0;

      function onTouchStart(event: TouchEvent) {
        if (event.touches.length !== 1) {
          return;
        }
        if (runner.getGame().status === "playing") {
          event.preventDefault();
        }
        const [touch] = event.touches;
        lastX = touch.clientX;
        lastY = touch.clientY;
        start = { x: lastX, y: lastY, time: Date.now() };
      }

      function onTouchMove(event: TouchEvent) {
        if (runner.getGame().status === "playing") {
          event.preventDefault();
        }
        if (!start || event.touches.length !== 1) {
          return;
        }
        const [touch] = event.touches;
        const command = swipeCommand(
          touch.clientX - lastX,
          touch.clientY - lastY,
          up
        );
        if (!command) {
          return;
        }
        runner.send(command);
        lastX = touch.clientX;
        lastY = touch.clientY;
      }

      function onTouchEnd(event: TouchEvent) {
        if (!start || event.changedTouches.length !== 1) {
          return;
        }
        const [touch] = event.changedTouches;
        const dx = touch.clientX - start.x;
        const dy = touch.clientY - start.y;
        const duration = Date.now() - start.time;
        start = undefined;
        if (
          Math.max(Math.abs(dx), Math.abs(dy)) < TAP_MOVE_THRESHOLD &&
          duration < TAP_DURATION_THRESHOLD
        ) {
          runner.send(ROTATE);
        }
      }

      element.addEventListener("touchstart", onTouchStart);
      element.addEventListener("touchmove", onTouchMove);
      element.addEventListener("touchend", onTouchEnd);
      return () => {
        element.removeEventListener("touchstart", onTouchStart);
        element.removeEventListener("touchmove", onTouchMove);
        element.removeEventListener("touchend", onTouchEnd);
      };
    },
    [runner, up]
  );
}
