"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { type ComponentProps, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "cursor-pointer rounded-md border py-12 font-black text-5xl transition-all duration-200 w-full inline-flex items-center justify-center gap-2",
    "hover:-translate-x-1 hover:-translate-y-1 hover:bg-accent hover:text-accent-foreground hover:shadow-[0.25rem_0.25rem_#000]",
    "active:translate-x-0 active:translate-y-0 active:shadow-none",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        outline: "border border-input bg-white text-primary",
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
  disabled,
  ...props
}: ComponentProps<typeof Button> & VariantProps<typeof buttonVariants>) => {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return (
    <Button
      {...props}
      type="button"
      disabled={disabled || !hydrated}
      onClick={onClick}
      className={cn(buttonVariants({ variant, className }))}
    >
      {children}
    </Button>
  );
};
