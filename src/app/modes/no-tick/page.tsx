import { Header } from "@/app/header";
import { TsumiZareProvider } from "../../../../packages/tsumizare/src/components/tsumizare-provider";
import { NoTickGame } from "./no-tick-game";

export default function NoTickModePage() {
  return (
    <TsumiZareProvider>
      <Header />
      <main className="flex min-h-svh flex-col items-center">
        <NoTickGame />
      </main>
    </TsumiZareProvider>
  );
}
