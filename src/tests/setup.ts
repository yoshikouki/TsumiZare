import { GlobalRegistrator } from "@happy-dom/global-registrator";

// Bun.serve requires native responses rather than Happy DOM's replacement.
export const NativeResponse = globalThis.Response;

GlobalRegistrator.register();
