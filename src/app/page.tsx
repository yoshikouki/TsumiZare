import { Header } from "./header";
import { TsumiZare } from "@/futures/tsumizare/tsumizare";
import { TsumiZareProvider } from "@/futures/tsumizare/tsumizare-provider";
import { Header } from "./header";

export default async function HomePage() {
  return (
    <TsumiZareProvider>
      <Header />
      <main className="flex min-h-svh flex-col items-center">
        <TsumiZare />
      </main>
    </TsumiZareProvider>
  );
}
