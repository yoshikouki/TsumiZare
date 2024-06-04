import { BlockyGameProvider } from "blocky-game";
import Link from "next/link";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TypographyH2, TypographyLead } from "@/components/ui/typography";
import { TsumiZare } from "@/futures/tsumizare/tsumizare";
import { cn } from "@/lib/utils";
import { GameModes } from "./game-modes";
import { Header } from "./header";
import { HowToPlay } from "./how-to-play";

export default function HomePage() {
  return (
    <BlockyGameProvider>
      <Header>
        <Link href="/" className="flex items-center gap-2">
          <Logo className={cn("size-8")} />
          <h1 className={"font-black text-4xl"}>TsumiZare</h1>
        </Link>
      </Header>

      <main className="flex flex-col items-center gap-4">
        <TsumiZare />

        <section id="about" className="max-w-xs space-y-4 pt-20 pb-32">
          <TypographyH2 className="sr-only">TsumiZare とは</TypographyH2>
          <TypographyLead>
            TsumiZare "積戯" は、
            <br />
            テトリスのようなブロック落としゲームです。
          </TypographyLead>
        </section>

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
