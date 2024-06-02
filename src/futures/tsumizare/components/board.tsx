import type { BoardConfig } from "../board";

import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";

export const Board = ({
  children,
  boardRef,
  boardConfig,
}: {
  children: React.ReactNode;
  boardRef: React.Ref<HTMLDivElement>;
  boardConfig: BoardConfig;
}) => {
  return (
    <div
      className="flex h-full w-full flex-col items-center px-4"
      ref={boardRef}
    >
      <div
        className={cn("grid max-h-svh w-full max-w-xs gap-1")}
        style={{
          gridTemplateRows: `repeat(${boardConfig.rowsNumber}, 1fr)`,
          gridTemplateColumns: `repeat(${boardConfig.colsNumber}, 1fr)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

const cellVariants = cva("aspect-square rounded-sm bg-primary/5", {
  variants: {
    variant: {
      empty: "rounded-sm bg-primary/5",
      filled: "rounded-none bg-primary",
      active: "bg-primary/90",
      belowActiveBlock: "bg-primary/10",
    },
  },
  defaultVariants: {
    variant: "empty",
  },
});

export const BoardCell = ({
  variant,
  className,
}: {
  variant: VariantProps<typeof cellVariants>["variant"];
  className?: string;
}) => {
  return <div className={cn(cellVariants({ variant, className }))} />;
};
