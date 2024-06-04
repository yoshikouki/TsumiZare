import { BlockyGameProvider } from "blocky-game";
import Link from "next/link";

import { GameModes } from "@/app/game-modes";
import { Header } from "@/app/header";
import { HowToPlay } from "@/app/how-to-play";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { NoTickGame } from "./no-tick-game";

export default function NoTickModePage() {
  return (
    <BlockyGameProvider>
      <Header>
        <div className="flex w-full max-w-xs items-center justify-between">
          <Link href="/" className="flex-1">
            <Logo className={cn("size-8")} />
          </Link>
          <h1 className={"grow text-center font-black text-4xl"}>つみき</h1>
          <div className="flex-1" />
        </div>
      </Header>

      <main className="flex flex-col items-center gap-4">
        <NoTickGame />

        <section id="game-modes" className="flex max-w-xs flex-col gap-4 py-4">
          <GameModes />
        </section>

        <section id="how-to-play" className="w-full max-w-xs space-y-4 py-4">
          <HowToPlay />
        </section>
      </main>
    </BlockyGameProvider>
  );
}
