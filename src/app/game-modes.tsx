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
import { TypographyH2 } from "@/components/ui/typography";

export const GameModes = () => {
  return (
    <>
      <TypographyH2>ゲームモード</TypographyH2>
      <Link href="/">
        <Card className="py-4">
          <CardHeader>
            <CardTitle>TsumiZare</CardTitle>
            <CardDescription>標準モード</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button type="button" className="w-full">
              遊ぶ
            </Button>
          </CardFooter>
        </Card>
      </Link>
      <Link href="/modes/no-tick">
        <Card className="py-4">
          <CardHeader>
            <CardTitle>つみき</CardTitle>
            <CardDescription>
              ブロックが自動で落下せず、自由に操作できます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            積み木遊びのように楽しめる、子ども向けのモードです。
          </CardContent>
          <CardFooter>
            <Button type="button" className="w-full">
              遊ぶ
            </Button>
          </CardFooter>
        </Card>
      </Link>
    </>
  );
};
