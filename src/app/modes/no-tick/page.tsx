import { Header } from "@/app/header";
import { TsumiZare } from "@/futures/tsumizare/tsumizare";
import { TsumiZareProvider } from "@/futures/tsumizare/tsumizare-provider";

export default function NoTickModePage() {
  return (
    <TsumiZareProvider>
      <Header />
      <main className="flex min-h-svh flex-col items-center">
        <TsumiZare />
      </main>
    </TsumiZareProvider>
  );
}
