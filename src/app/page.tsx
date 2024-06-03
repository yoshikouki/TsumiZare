import { Button } from "@/components/ui/button";
import { TsumiZare } from "@/futures/tsumizare/tsumizare";
import { BlockGameProvider } from "block-game";
import Link from "next/link";
import { Header } from "./header";

export default async function HomePage() {
  return (
    <BlockGameProvider>
      <Header />
      <main className="flex min-h-svh flex-col items-center">
        <TsumiZare />

        <div>
          <Button asChild variant="outline">
            <Link href="/modes/no-tick">Freeze Fun Mode</Link>
          </Button>
        </div>
      </main>
    </BlockGameProvider>
  );
}
