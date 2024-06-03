import { cn } from "@/lib/utils";

const length = 31;
const gap = (100 - length * 3) / 2;
const width = length * 3 + gap * 2;
const position1 = 0;
const position2 = length + gap;
const position3 = length * 2 + gap * 2;
const borderRadius = 4;
export const Logo = ({ className }: { className?: string }) => (
  <svg
    width={width}
    height={width}
    viewBox={`0 0 ${width} ${width}`}
    xmlns="http://www.w3.org/2000/svg"
    className={cn(className)}
  >
    <title>TsumiZare</title>
    <rect
      x={position1}
      y={position1}
      width={length}
      height={length}
      rx={borderRadius}
      ry={borderRadius}
      className={cn("fill-primary")}
    />
    <rect
      x={position2}
      y={position1}
      width={length}
      height={length}
      rx={borderRadius}
      ry={borderRadius}
      className={cn("fill-primary")}
    />
    <rect
      x={position3}
      y={position1}
      width={length}
      height={length}
      rx={borderRadius}
      ry={borderRadius}
      className={cn("fill-primary")}
    />
    <rect
      x={position1}
      y={position2}
      width={length}
      height={length}
      rx={borderRadius}
      ry={borderRadius}
      className={cn("fill-primary/5")}
    />
    <rect
      x={position2}
      y={position2}
      width={length}
      height={length}
      rx={borderRadius}
      ry={borderRadius}
      className={cn("fill-primary")}
    />
    <rect
      x={position3}
      y={position2}
      width={length}
      height={length}
      rx={borderRadius}
      ry={borderRadius}
      className={cn("fill-primary/5")}
    />
    <rect
      x={position1}
      y={position3}
      width={length}
      height={length}
      rx={borderRadius}
      ry={borderRadius}
      className={cn("fill-primary")}
    />
    <rect
      x={position2}
      y={position3}
      width={length}
      height={length}
      rx={borderRadius}
      ry={borderRadius}
      className={cn("fill-primary/5")}
    />
    <rect
      x={position3}
      y={position3}
      width={length}
      height={length}
      rx={borderRadius}
      ry={borderRadius}
      className={cn("fill-primary")}
    />
  </svg>
);
