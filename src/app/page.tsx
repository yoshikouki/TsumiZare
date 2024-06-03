import { Button } from "@/components/ui/button";
import {
  TypographyH2,
  TypographyH3,
  TypographyLead,
  TypographyP,
} from "@/components/ui/typography";
import { TsumiZare } from "@/futures/tsumizare/tsumizare";
import { BlockyGameProvider } from "blocky-game";
import Link from "next/link";
import { Header } from "./header";

export default async function HomePage() {
  return (
    <BlockyGameProvider>
      <Header />
      <main className="flex flex-col items-center gap-4">
        <TsumiZare />

        <section id="about" className="max-w-xs space-y-4 py-4">
          <TypographyH2 className="sr-only">TsumiZare とは</TypographyH2>
          <TypographyLead>
            TsumiZare "積戯" は、
            <br />
            テトリスのようなブロック落としゲームです。
          </TypographyLead>
        </section>
        <section id="game-modes" className="max-w-xs space-y-4 py-4">
          <TypographyH2>ゲームモード</TypographyH2>
          <TypographyH3>幼児向け</TypographyH3>
          <Button asChild variant="outline" className="">
            <Link href="/modes/no-tick">Freeze Fun Mode</Link>
          </Button>
          <TypographyP>
            幼児向けに設計されたモードです。ブロックが自動で落下せず、自由に操作できます。積み木遊びのように楽しめます。
          </TypographyP>
        </section>
        <section id="how-to-play" className="max-w-xs space-y-4 py-4">
          <TypographyH2>プレイ方法</TypographyH2>
          <h3 className="font-semibold text-xl">スマホ</h3>
          <TypographyP>
            タッチ操作でブロックを動かし、タップで回転。画面下部のボタンでブロックの落下速度を調整。
          </TypographyP>
          <h3 className="font-semibold text-xl">PC</h3>
          <TypographyP>
            矢印キーでブロックを動かし、スペースキーで回転。下矢印キーでブロックを早く落とす。
          </TypographyP>
        </section>
      </main>
    </BlockyGameProvider>
  );
}
