import type { Ref } from "react";

export const TickRunner = ({ ref }: { ref: Ref<HTMLDivElement> }) => (
  <div ref={ref} />
);
