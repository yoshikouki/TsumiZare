import { Tetris } from "@/futures/tetris/tetris";
import { TetrisProvider } from "@/futures/tetris/tetris-provider";
import { Header } from "./header";

export default async function HomePage() {
  return (
    <TetrisProvider>
      <main className="flex min-h-svh flex-col">
        <Header />
        <Tetris />
      </main>
    </TetrisProvider>
  );
}
