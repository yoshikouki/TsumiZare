import { BLOCKS, BlockyGameProvider } from "blocky-game";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TypographyH2,
  TypographyH3,
  TypographyH4,
  TypographyLead,
  TypographyMuted,
  TypographyP,
} from "@/components/ui/typography";
import { BlockViewer } from "@/futures/tsumizare/components/block-viewer";
import { TsumiZare } from "@/futures/tsumizare/tsumizare";
import { ArrowBigLeft, ArrowBigRight, Smartphone } from "lucide-react";
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
              <CardFooter>
                <Button type="button" className="w-full">
                  遊ぶ
                </Button>
              </CardFooter>
            </Card>
          </Link>
        </section>

        <section id="how-to-play" className="w-full max-w-xs space-y-4 py-4">
          <TypographyH2>プレイ方法</TypographyH2>
          <Tabs defaultValue="touch" className="space-y-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="touch">スマホ</TabsTrigger>
              <TabsTrigger value="keyboard">PC</TabsTrigger>
            </TabsList>
            <TabsContent value="touch" className="space-y-8">
              <div className="space-y-4">
                <TypographyH3>タッチ操作</TypographyH3>
                <TypographyMuted>
                  スマートフォン・タブレットで遊ぶ場合
                </TypographyMuted>
              </div>
              <div className="space-y-4">
                <TypographyH4>移動</TypographyH4>
                <div className="flex aspect-square w-full flex-1 flex-col items-center justify-center gap-4 rounded-xl border">
                  <BlockViewer
                    className="w-1/4 animate-swipe-x"
                    block={{
                      id: "z-block",
                      shape: BLOCKS.Z,
                      position: { x: 0, y: 0 },
                    }}
                  />
                  <div className="aspect-square w-1/4 animate-swipe-x rounded-full border-white bg-primary/5" />
                </div>
              </div>
              <div className="space-y-4">
                <TypographyH4>回転</TypographyH4>
                <div className="flex aspect-square w-full flex-1 flex-col items-center justify-center gap-4 rounded-xl border">
                  <BlockViewer
                    className="w-1/4 animate-rotate"
                    block={{
                      id: "z-block",
                      shape: BLOCKS.Z,
                      position: { x: 0, y: 0 },
                    }}
                  />
                  <div className="aspect-square w-1/4 animate-touch rounded-full border-white bg-primary/5" />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="keyboard" className="space-y-8">
              <div className="space-y-4">
                <TypographyH3>キーボード操作</TypographyH3>
                <TypographyMuted>パソコンで遊ぶ場合</TypographyMuted>
              </div>
              <div className="space-y-4">
                <TypographyH4>移動</TypographyH4>
                <div className="flex aspect-square w-full flex-1 flex-col items-center justify-center gap-10 rounded-xl border">
                  <BlockViewer
                    className="w-1/4 animate-swipe-x"
                    block={{
                      id: "z-block",
                      shape: BLOCKS.Z,
                      position: { x: 0, y: 0 },
                    }}
                  />
                  <div className="flex w-full justify-center gap-8">
                    <ArrowBigLeft className="size-20 fill-primary" />
                    <ArrowBigRight className="size-20 fill-primary" />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <TypographyH4>回転</TypographyH4>
                <div className="flex aspect-square w-full flex-1 flex-col items-center justify-center gap-4 rounded-xl border">
                  <BlockViewer
                    className="w-1/4 animate-rotate"
                    block={{
                      id: "z-block",
                      shape: BLOCKS.Z,
                      position: { x: 0, y: 0 },
                    }}
                  />
                  <div className="animate-touch border px-8 py-4">Space</div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </BlockyGameProvider>
  );
}
