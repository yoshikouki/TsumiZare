"use client";

import { ImageDown, Share } from "lucide-react";

import { Button } from "@/components/ui/button";
import satori from "satori";
import { scoreboard } from "./result-scoreboard";

const generateResultImage = async ({
  score,
  filledCellsNumber,
}: {
  score: number;
  filledCellsNumber: number;
}) => {
  const fontData = await fetch("/fonts/Inter-Black.ttf").then((res) =>
    res.arrayBuffer(),
  );

  const svgString = await satori(scoreboard({ score, filledCellsNumber }), {
    width: 320,
    height: 320,
    debug: false,
    fonts: [
      {
        name: "Roboto",
        data: fontData,
        weight: 900,
        style: "normal",
      },
    ],
  });
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  return blob;
};

export const ResultViewer = ({
  score,
  filledCellsNumber,
}: {
  score: number;
  filledCellsNumber: number;
}) => {
  const shareResultImage = async () => {
    const blob = await generateResultImage({ score, filledCellsNumber });
    if (navigator.share) {
      try {
        const file = new File([blob], "capture.svg", { type: "image/svg+xml" });
        await navigator.share({
          files: [file],
          title: `TsumiZare Result: ${new Date().toISOString()} points`,
          text: "私の戦績をみてーーーーー! #TumiZare",
        });
        console.log("Shared successfully");
      } catch (error) {
        console.error("Failed to share:", error);
      }
    } else {
      console.log("Sharing is not supported");
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.click();
    }
  };

  const downloadResultImage = async () => {
    const blob = await generateResultImage({ score, filledCellsNumber });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `TsumiZare-result-${new Date().toISOString()}.svg`;
    link.click();
  };

  return (
    <>
      <div className="aspect-square w-full">
        {scoreboard({ score, filledCellsNumber })}
      </div>

      <div className="flex w-full gap-2">
        <Button onClick={shareResultImage} variant={"outline"} size="icon">
          <Share />
        </Button>
        <Button onClick={downloadResultImage} variant={"outline"} size="icon">
          <ImageDown />
        </Button>
      </div>
    </>
  );
};
