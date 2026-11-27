"use client";

import { useEffect, useRef } from "react";
import { allowsMotion } from "@/lib/motion";

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

// The score at which each stage starts. Every stage makes the number a little
// heavier and larger, and its pop and shake stronger.
const STAGES = [0, 50, 300, 900, 2000, 4000, 8000, 15_000];
const stageOf = (score: number) =>
  STAGES.findLastIndex((start) => score >= start);
const weightOf = (stage: number) => 400 + stage * 50;

export const Score = ({ score }: { score: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const previous = useRef(score);
  const stage = stageOf(score);

  useEffect(() => {
    const from = previous.current;
    previous.current = score;
    const element = ref.current;
    if (!element || score <= from) {
      return;
    }
    navigator.vibrate?.(30);
    if (!allowsMotion()) {
      return;
    }
    const level = stageOf(score);
    const weight = weightOf(level);
    element.animate(
      [
        { scale: 1, fontWeight: weightOf(stageOf(from)) },
        {
          scale: 1.2 + level * 0.05,
          fontWeight: Math.min(900, weight + 200),
          offset: 0.3,
        },
        { scale: 1, fontWeight: weight },
      ],
      { duration: 500 + level * 40, easing: "ease-out" }
    );
    const reach = 1 + level * 0.5;
    element.animate(
      {
        translate: [0, -1, 1, -1, 1, -0.6, 0.6, -0.3, 0].map(
          (side) => `${side * reach}px 0`
        ),
      },
      { duration: 360 + level * 30 }
    );
  }, [score]);

  return (
    <div
      className="text-primary/50 flex origin-right flex-row-reverse tabular-nums"
      ref={ref}
      style={{ fontSize: `${1 + stage * 0.1}em`, fontWeight: weightOf(stage) }}
    >
      <span className="sr-only">{score}</span>
      {Array.from(String(score))
        .reverse()
        .map((digit, place) => (
          <span
            aria-hidden="true"
            className="h-[1lh] overflow-hidden"
            // biome-ignore lint/suspicious/noArrayIndexKey: A digit is identified by its place.
            key={place}
          >
            <span
              className="flex flex-col transition-[translate] duration-500 ease-out motion-reduce:transition-none"
              style={{ translate: `0 ${Number(digit) * -10}%` }}
            >
              {DIGITS.map((n) => (
                <span className="h-[1lh]" key={n}>
                  {n}
                </span>
              ))}
            </span>
          </span>
        ))}
    </div>
  );
};
