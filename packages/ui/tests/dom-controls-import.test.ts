// @vitest-environment node
import { expect, it } from "vitest"

it("imports without a browser and requires a document only on construction", async () => {
  expect(typeof globalThis.document).toBe("undefined")
  const { createUiControl } = await import("../src/lib/dom-controls")
  expect(typeof globalThis.document).toBe("undefined")
  expect(() => createUiControl("select")).toThrow("requires a Document")
})
