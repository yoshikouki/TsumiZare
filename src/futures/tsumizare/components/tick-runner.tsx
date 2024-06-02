import type { Ref } from "react";

export const TickRunner = ({
  tickRunnerRef,
}: { tickRunnerRef: Ref<HTMLDivElement> }) => {
  return <div ref={tickRunnerRef} />;
};
