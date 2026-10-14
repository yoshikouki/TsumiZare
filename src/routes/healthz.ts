import { Hono } from "hono";
import type { AppEnv } from "@/lib/app-env";

export default new Hono<AppEnv>().get("/", (c) => {
  c.header("Cache-Control", "no-store");
  return c.json({
    status: "ok",
    gitSha: c.env?.DEPLOYMENT_GIT_SHA || null,
    versionId: c.env?.CF_VERSION_METADATA?.id || null,
  });
});
