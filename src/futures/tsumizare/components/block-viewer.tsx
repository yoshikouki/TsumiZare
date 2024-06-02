import { cn } from "@/lib/utils";
import type { Block } from "../block";

export const BlockViewer = ({
  block,
}: {
  block: Block;
}) => {
  return (
    <div
      className="grid gap-[2px]"
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
              "aspect-square min-w-2 bg-primary",
              cell ? "opacity-100" : "opacity-0",
            )}
          />
        )),
      )}
    </div>
  );
};
