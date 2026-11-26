import {
  type Cell,
  type CellVariants,
  LINE_CLEAR_TRANSITION,
  type Row,
} from "blocky-game";
import { cva, type VariantProps } from "class-variance-authority";
import { ViewTransition } from "react";
import { cn } from "@/lib/utils";

const LINE_CLEAR_ROW = { [LINE_CLEAR_TRANSITION]: "auto", default: "none" };

// An empty row looks the same wherever it sits, so only rows with landed cells
// need to be captured and animated.
const hasLandedCells = (row: Row) => row.cells.some((cell) => cell.blockId);

export const Board = ({
  boardRef,
  rows,
  colsNumber,
  isPaused,
  detectCellVariant,
}: {
  boardRef: React.Ref<HTMLDivElement>;
  rows: Row[];
  colsNumber: number;
  isPaused: boolean;
  detectCellVariant: (cell: Cell, x: number, y: number) => CellVariants;
}) => (
  <section
    aria-label="ゲーム盤"
    className={cn(
      "flex h-full w-full flex-col items-center px-4 transition-[filter] duration-200 motion-reduce:transition-none",
      isPaused && "blur-xs"
    )}
    ref={boardRef}
  >
    <div className="flex w-full max-w-xs flex-col gap-1 pb-4">
      {rows.map((row, y) => (
        <ViewTransition
          default={hasLandedCells(row) ? LINE_CLEAR_ROW : "none"}
          key={row.id}
        >
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${colsNumber}, 1fr)` }}
          >
            {row.cells.map((cell, x) => (
              <BoardCell
                key={cell.id}
                variant={detectCellVariant(cell, x, y)}
              />
            ))}
          </div>
        </ViewTransition>
      ))}
    </div>
  </section>
);

// Moving cells switch instantly so the falling block stays crisp. Transitions
// remain only for a new row fading in from @starting-style and for a landing
// block settling into its filled shape.
const cellVariants = cva(
  "bg-primary/5 aspect-square rounded-sm transition-opacity duration-150 ease-out motion-reduce:transition-none starting:opacity-0",
  {
    variants: {
      variant: {
        empty: "",
        filled:
          "bg-primary rounded-none transition-[border-radius,scale] duration-300",
        active: "bg-primary/90 scale-90",
        belowActiveBlock: "bg-primary/10",
      },
    },
    defaultVariants: {
      variant: "empty",
    },
  }
);

export const BoardCell = ({
  variant,
  className,
}: {
  variant: VariantProps<typeof cellVariants>["variant"];
  className?: string;
}) => (
  <div
    data-state={variant}
    className={cn(cellVariants({ variant, className }))}
  />
);
