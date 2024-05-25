import { client } from "@/server/client";
import { ClientComponent } from "./client-component";

export default async function HomePage() {
  const res = await client.time.$get();
  const { message } = await res.json();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10">
      <h1 className="font-black text-6xl">HonoN</h1>
      <div className="text-2xl tabular-nums">S: {message}</div>
      <ClientComponent />
    </main>
  );
}
