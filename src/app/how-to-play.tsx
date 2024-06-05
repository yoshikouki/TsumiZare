import { BLOCKS } from "blocky-game";
import { ArrowBigLeft, ArrowBigRight } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TypographyH2 } from "@/components/ui/typography";
import {
  TypographyH3,
  TypographyH4,
  TypographyMuted,
} from "@/components/ui/typography";
import { BlockViewer } from "@/futures/tsumizare/components/block-viewer";

export const HowToPlay = () => {
  return (
    <>
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
            <div className="flex aspect-square w-full flex-1 flex-col items-center justify-center gap-10 rounded-xl border">
              <BlockViewer
                className="w-1/4 animate-swipe-x"
                block={{
                  id: "z-block",
                  shape: BLOCKS.Z,
                  position: { x: 0, y: 0 },
                }}
              />
              <div className="aspect-square w-1/6 animate-swipe-x rounded-full border-white bg-primary/5" />
            </div>
          </div>
          <div className="space-y-4">
            <TypographyH4>回転</TypographyH4>
            <div className="flex aspect-square w-full flex-1 flex-col items-center justify-center gap-10 rounded-xl border">
              <BlockViewer
                className="w-1/4 animate-rotate"
                block={{
                  id: "z-block",
                  shape: BLOCKS.Z,
                  position: { x: 0, y: 0 },
                }}
              />
              <div className="aspect-square w-1/6 animate-touch rounded-full border-white bg-primary/5" />
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
                <ArrowBigLeft className="size-12 fill-primary" />
                <ArrowBigRight className="size-12 fill-primary" />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <TypographyH4>回転</TypographyH4>
            <div className="flex aspect-square w-full flex-1 flex-col items-center justify-center gap-10 rounded-xl border">
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
    </>
  );
};
