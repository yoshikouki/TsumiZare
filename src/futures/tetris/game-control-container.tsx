import { cn } from "@/lib/utils";

export const GameControlContainer = ({
  children,
  isVisible,
}: {
  children: React.ReactNode;
  isVisible: boolean;
}) => {
  return (
    <div
      className={cn(
        "pointer-events-none absolute flex w-full max-w-xs flex-col items-center justify-center space-y-4 opacity-0 transition duration-200",
        isVisible && "pointer-events-auto opacity-100",
      )}
    >
      {children}
    </div>
  );
};
