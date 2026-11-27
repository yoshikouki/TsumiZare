"use client";

import { useEffect, useRef } from "react";
import { allowsMotion } from "@/lib/motion";

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

// Grows from regular toward bold as the score climbs. 900 is kept for the pop.
const weightOf = (score: number) =>
  Math.min(700, Math.round(400 + 75 * Math.log10(1 + score)));

export const Score = ({ score }: { score: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const previous = useRef(score);

  useEffect(() => {
    const from = previous.current;
    previous.current = score;
    if (score <= from) {
      return;
    }
    navigator.vibrate?.(30);
    if (!allowsMotion()) {
      return;
    }
    ref.current?.animate(
      [
        { scale: 1, fontWeight: weightOf(from) },
        { scale: 1.25, fontWeight: 900, offset: 0.3 },
        { scale: 1, fontWeight: weightOf(score) },
      ],
      { duration: 600, easing: "ease-out" }
    );
  }, [score]);

  return (
    <div
      className="text-primary/50 flex origin-right flex-row-reverse tabular-nums"
      ref={ref}
      style={{ fontWeight: weightOf(score) }}
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
