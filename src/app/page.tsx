import { Tetris } from "@/futures/tetris/tetris";
import { TetrisProvider } from "@/futures/tetris/tetris-provider";
import { ClientHeader } from "./header.client";

export default async function HomePage() {
  return (
    <TetrisProvider>
      <main className="flex flex-col items-center gap-10">
        <header
          className={
            "pointer-events-none absolute z-10 items-center justify-center py-4"
          }
        >
          <span className="pointer-events-auto">
            <ClientHeader />
          </span>
        </header>
        <Tetris />
      </main>
    </TetrisProvider>
  );
}
