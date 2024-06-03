import { Header } from "@/app/header";
import { BlockGameProvider } from "block-game";
import { NoTickGame } from "./no-tick-game";

export default function NoTickModePage() {
  return (
    <BlockGameProvider>
      <Header />
      <main className="flex min-h-svh flex-col items-center">
        <NoTickGame />
      </main>
    </BlockGameProvider>
  );
}
