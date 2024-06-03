import { Header } from "@/app/header";
import { BlockyGameProvider } from "blocky-game";
import { NoTickGame } from "./no-tick-game";

export default function NoTickModePage() {
  return (
    <BlockyGameProvider>
      <Header />
      <main className="flex min-h-svh flex-col items-center">
        <NoTickGame />
      </main>
    </BlockyGameProvider>
  );
}
