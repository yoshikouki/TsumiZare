import { describe, expect, it } from "bun:test";
import { createRequire } from "node:module";

const packageRequire = createRequire(import.meta.url);

describe("React runtime", () => {
  it("uses the same React instance as the test renderer", () => {
    const packageReactPath = packageRequire.resolve("react");
    const testingLibraryPath = packageRequire.resolve("@testing-library/react");
    const testingLibraryRequire = createRequire(testingLibraryPath);
    const reactDomPath = testingLibraryRequire.resolve("react-dom");
    const reactDomRequire = createRequire(reactDomPath);
    const rendererReactPath = reactDomRequire.resolve("react");

    expect(packageReactPath).toBe(rendererReactPath);
  });
});
