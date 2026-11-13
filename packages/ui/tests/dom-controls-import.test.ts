// @vitest-environment node
import { expect, it } from "vitest"

it("imports without a browser and requires a document only on construction", async () => {
  expect(typeof globalThis.document).toBe("undefined")
  const { createUiControl } = await import("../src/lib/dom-controls")
  expect(typeof globalThis.document).toBe("undefined")
  expect(() => createUiControl("select")).toThrow("requires a Document")
})


it("bundles native adapters without React or Radix runtime imports", async () => {
  const { build } = await import("esbuild")
  const bundle = await build({
    entryPoints: [new URL("../src/lib/dom-controls.ts", import.meta.url).pathname, new URL("../src/lib/dom-surfaces.ts", import.meta.url).pathname],
    bundle: true,
    outdir: "unused-native-test-output",
    write: false,
    metafile: true,
    format: "esm",
    platform: "browser",
  })
  expect(Object.keys(bundle.metafile.inputs).filter((file) => /node_modules\/(?:react|react-dom|radix-ui|@radix-ui)\//.test(file))).toEqual([])
})
