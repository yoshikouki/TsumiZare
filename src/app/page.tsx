import { BlockyGameProvider } from "blocky-game";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TypographyH2,
  TypographyLead,
  TypographyP,
} from "@/components/ui/typography";
import { TsumiZare } from "@/futures/tsumizare/tsumizare";
import { Header } from "./header";

export default async function HomePage() {
  return (
    <BlockyGameProvider>
      <Header />
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
          <TypographyH2>ゲームモード</TypographyH2>
          <Link href="/modes/no-tick">
            <Card className="py-4">
              <CardHeader>
                <CardTitle>つみき</CardTitle>
                <CardDescription>
                  積み木遊びのように楽しめる、子ども向けのモードです。
                </CardDescription>
              </CardHeader>
              <CardContent>
                ブロックが自動で落下せず、自由に操作できます。
              </CardContent>
            </Card>
          </Link>
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
