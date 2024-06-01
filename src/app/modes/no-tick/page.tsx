import { Header } from "@/app/header";
import { NoTickGame } from "./no-tick-game";
import { TsumiZareProvider } from "@/futures/tsumizare/tsumizare-provider";

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
