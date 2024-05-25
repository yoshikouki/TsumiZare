import { type ClientRequest as HonoClientRequest, hc } from "hono/client";
import type { AppType } from ".";

const apiUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:8888/api";

export const client = hc<AppType>(apiUrl);
type ClientRequest = HonoClientRequest<AppType>;
