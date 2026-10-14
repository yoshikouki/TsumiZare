import { BlockyGameProvider } from "blocky-game";
import { Hono } from "hono";

import { Logo } from "@/components/logo";
import { GameModes } from "@/components/site/game-modes";
import { GitHubIcon } from "@/components/site/github-icon";
import { Header } from "@/components/site/header";
import { HowToPlay } from "@/components/site/how-to-play";
import { Button } from "@/components/ui/button";
import {
  TypographyH2,
  TypographyLead,
  TypographyP,
} from "@/components/ui/typography";
import { TsumiZare } from "@/futures/tsumizare/tsumizare";
import { cn } from "@/lib/utils";

export function HomePage() {
  return (
    <BlockyGameProvider>
      <Header>
        <a href="/" className="flex items-center gap-2">
          <Logo className={cn("size-8")} />
          <h1 className={"font-black text-4xl"}>TsumiZare</h1>
        </a>
      </Header>

      <main className="flex flex-col items-center gap-4">
        <TsumiZare />

        <section id="about" className="max-w-xs space-y-4 pt-20 pb-32">
          <TypographyH2 className="sr-only">TsumiZare とは</TypographyH2>
          <TypographyLead>
            TsumiZare "積戯" は、
            <br />
            テトリス風のパズルゲームです。
          </TypographyLead>
          <TypographyLead>
            ゲームがまだ難しい子どもでもプレイできるモードを用意しています。
          </TypographyLead>
        </section>

        <section id="game-modes" className="flex max-w-xs flex-col gap-4 py-4">
          <GameModes />
        </section>

        <section id="how-to-play" className="w-full max-w-xs space-y-4 py-4">
          <HowToPlay />
        </section>

        <section id="development" className="flex max-w-xs flex-col gap-4 py-4">
          <TypographyH2>開発</TypographyH2>
          <TypographyP>
            ブロックゲームをライブラリとして公開しています。ゲームを作りたい方はご利用ください。
          </TypographyP>
          <Button asChild variant="outline">
            <a
              href="https://github.com/yoshikouki/TsumiZare/tree/main/packages/blocky-game"
              target="_blank"
              className="flex items-center gap-2"
              rel="noopener"
            >
              <GitHubIcon className="w-5 flex-none" /> GitHub
            </a>
          </Button>
          <TypographyP>
            当アプリへのフィードバックもお待ちしております。
          </TypographyP>
        </section>
      </main>
    </BlockyGameProvider>
  );
}

export default new Hono().get("/", (c) => c.render(<HomePage />));
