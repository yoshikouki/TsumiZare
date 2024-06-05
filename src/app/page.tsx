import { BlockyGameProvider } from "blocky-game";
import Link from "next/link";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  TypographyH2,
  TypographyLead,
  TypographyP,
} from "@/components/ui/typography";
import { TsumiZare } from "@/futures/tsumizare/tsumizare";
import { cn } from "@/lib/utils";
import { GameModes } from "./game-modes";
import { GitHubIcon } from "./github-icon";
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
            <Link
              href="https://github.com/yoshikouki/TsumiZare/tree/main/packages/blocky-game"
              target="_blank"
              className="flex items-center gap-2"
            >
              <GitHubIcon className="w-5 flex-none" /> GitHub
            </Link>
          </Button>
          <TypographyP>
            当アプリへのフィードバックもお待ちしております。
          </TypographyP>
        </section>
      </main>
    </BlockyGameProvider>
  );
}
