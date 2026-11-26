import type { BoardConfig } from "blocky-game";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const Board = ({
  children,
  boardRef,
  boardConfig,
  isPaused,
}: {
  children: React.ReactNode;
  boardRef: React.Ref<HTMLDivElement>;
  boardConfig: BoardConfig;
  isPaused: boolean;
}) => (
  <section
    aria-label="ゲーム盤"
    className={cn(
      "flex h-full w-full flex-col items-center px-4 transition-[filter] duration-200 motion-reduce:transition-none",
      isPaused && "blur-xs"
    )}
    ref={boardRef}
  >
    <div
      className={cn("grid w-full max-w-xs gap-1 pb-4")}
      style={{
        gridTemplateRows: `repeat(${boardConfig.rowsNumber}, 1fr)`,
        gridTemplateColumns: `repeat(${boardConfig.colsNumber}, 1fr)`,
      }}
    >
      {children}
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
