import { Hono } from "hono";
import { Logo } from "@/components/logo";
import { GameModes } from "@/components/site/game-modes";
import { Header } from "@/components/site/header";
import { HowToPlay } from "@/components/site/how-to-play";
import { NoTickGame } from "@/futures/tsumizare/no-tick-game";
import { GameSession } from "@/futures/tsumizare/game-session";
import { cn } from "@/lib/utils";

export function NoTickModePage() {
  return (
    <GameSession gravity={null}>
      <Header>
        <div className="flex w-full max-w-xs items-center justify-between">
          <a href="/" className="flex-1">
            <Logo className={cn("size-8")} />
          </a>
          <h1 className={"grow text-center text-4xl font-black"}>つみき</h1>
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
    </GameSession>
  );
}

export default new Hono().get("/", (c) => c.render(<NoTickModePage />));
