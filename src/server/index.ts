import { Hono } from "hono";

export const app = new Hono();

const routes = app.get("/time", (c) => {
  return c.json({
    message: new Date().toISOString(),
  });
});

export type AppType = typeof routes;
