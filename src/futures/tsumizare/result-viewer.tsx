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

const svgStringToCanvas = ({
  svgString,
  width,
  height,
}: {
  svgString: string;
  width: number;
  height: number;
}): Promise<HTMLCanvasElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get 2d context"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas);
    };
    img.onerror = (e) => reject(e);
    img.src = `data:image/svg+xml;base64,${btoa(svgString)}`;
  });
};

const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob | null> => {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
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
    const svgString = await blob.text();
    const canvas = await svgStringToCanvas({
      svgString,
      width: 320,
      height: 320,
    });
    const pngBlob = await canvasToBlob(canvas);
    if (!pngBlob) {
      console.error("Failed to convert canvas to blob");
      return;
    }

    if (navigator.share) {
      try {
        const file = new File([pngBlob], "capture.png", {
          type: "image/png",
        });
        await navigator.share({
          files: [file],
          title: `TsumiZare Result: ${new Date().toISOString()} points`,
          text: `あー楽しかった！ #TsumiZare \n ${process.env.NEXT_PUBLIC_APP_URL}`,
        });
        console.log("Shared successfully");
      } catch (error) {
        console.error("Failed to share:", error);
      }
    } else {
      console.log("Sharing is not supported");
      const link = document.createElement("a");
      link.href = URL.createObjectURL(pngBlob);
      link.click();
    }
  };

  const downloadResultImage = async () => {
    const blob = await generateResultImage({ score, filledCellsNumber });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `TsumiZare-result-${new Date().toISOString()}.png`;
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
