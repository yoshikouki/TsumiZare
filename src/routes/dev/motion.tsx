import { Hono } from "hono";
import { MotionCatalog } from "@/futures/tsumizare/motion-catalog";

// A development-only page that replays each motion of the game screen.
export default new Hono().get("/", (c) =>
  import.meta.env.DEV ? c.render(<MotionCatalog />) : c.notFound()
);
