"use client";

import { Award, Box, Crown, Share } from "lucide-react";

import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import { useRef } from "react";

export const ResultViewer = ({
  score,
  filledCellsNumber,
}: {
  score: number;
  filledCellsNumber: number;
}) => {
  const resultImageRef = useRef<HTMLDivElement | null>(null);
  const shareResult = async () => {
    if (!resultImageRef.current) {
      console.error("No result image ref");
      return;
    }
    const canvas = await html2canvas(resultImageRef.current);
    if (navigator.share) {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error("No blob");
          return;
        }
        const file = new File([blob], "capture.png", { type: "image/png" });
        navigator
          .share({
            files: [file],
            title: "キャプチャ画像",
            text: "私の戦績をみてーーーーー! #TumiZare",
          })
          .then(() => console.log("画像が共有されました"))
          .catch((error) => console.error("共有に失敗しました", error));
      });
    } else {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "capture.png";
      link.click();
    }
  };
  return (
    <>
      <div
        className="flex aspect-square w-full flex-col items-center justify-center gap-4 rounded border bg-background"
        ref={resultImageRef}
      >
        <div className="mb-8 flex items-center justify-center gap-1">
          <Crown className="fill-primary stroke-primary" size="40" />
        </div>

        <div className="inline-flex items-center justify-center gap-2">
          <Award className="stroke-primary" size="32" />
          <span className="font-black text-4xl">{score}</span>
        </div>

        <div className="inline-flex items-center justify-center gap-2">
          <Box className="stroke-primary" size="28" />
          <span className="font-black text-4xl">{filledCellsNumber}</span>
        </div>
      </div>

      <div className="w-full">
        <Button onClick={shareResult} variant={"outline"} size="icon">
          <Share />
        </Button>
      </div>
    </>
  );
};
