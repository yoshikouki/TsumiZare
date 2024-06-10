import type { Ref } from "react";

export const TickRunner = ({ ref }: { ref: Ref<HTMLDivElement> }) => {
  return <div ref={ref} />;
};
