import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";

const buttonVariants = cva(
  [
    "cursor-pointer rounded-md border p-12 font-black text-6xl transition-all duration-200 w-full",
    "hover:translate-x-[-0.25rem] hover:translate-y-[-0.25rem] hover:bg-accent hover:text-accent-foreground hover:shadow-[0.25rem_0.25rem_#000]",
    "active:translate-x-0 active:translate-y-0 active:shadow-none",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        outline: "border border-input bg-background text-primary",
        secondary: "bg-secondary text-secondary-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const GameControlButton = ({
  children,
  onClick,
  className,
  variant,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
}) => {
  return (
    <Button
      type="button"
      onClick={onClick}
      className={cn(buttonVariants({ variant, className }))}
    >
      {children}
    </Button>
  );
};
