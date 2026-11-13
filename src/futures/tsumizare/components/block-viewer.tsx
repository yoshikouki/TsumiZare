// biome-ignore-all lint/suspicious/noArrayIndexKey: This stateless grid uses fixed coordinates as cell identities.
import type { Block } from "blocky-game";
import { cn } from "@/lib/utils";

export const BlockViewer = ({
  block,
  className,
}: {
  block: Block;
  className?: string;
}) => (
  <div
    className={cn("grid gap-[2px]", className)}
    style={{
      gridTemplateColumns: `repeat(${block.shape[0].length}, 1fr)`,
      gridTemplateRows: `repeat(${block.shape.length}, 1fr)`,
    }}
  >
    {block.shape.map((row, rowIndex) =>
      row.map((cell, cellIndex) => (
        <div
          key={`${block.id}-${rowIndex}-${cellIndex}`}
          className={cn(
            "bg-primary aspect-square min-w-2",
            cell ? "opacity-100" : "opacity-0"
          )}
        />
      ))
    )}
  </div>
);
