import { Tetris } from "@/futures/tetris/tetris";

export default async function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center gap-10">
      <h1 className="font-black text-6xl">Tetris</h1>
      <Tetris />
    </main>
  );
}
