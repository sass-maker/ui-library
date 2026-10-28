import { readFile } from "node:fs/promises"
import path from "node:path"
import { build } from "esbuild"
import { expect, it } from "vitest"

it("bundles the app block using only its declared installed registry files", async () => {
  const root = path.resolve("../..")
  const registry = JSON.parse(await readFile(path.join(root, "registry.json"), "utf8"))
  const app = registry.items.find((item: { name: string }) => item.name === "app")
  const files = new Map<string, string>(app.files.filter((file: { target?: string }) => file.target?.endsWith(".ts") || file.target?.endsWith(".tsx"))
    .map((file: { path: string; target: string }) => [path.resolve("/installed", file.target), path.join(root, file.path)]))
  const entry = "/installed/src/components/fleet/blocks/app.tsx"
  expect(files.has(entry)).toBe(true)
  expect(app.dependencies).toContain("radix-ui@1.6.7")
  expect(app.dependencies).toContain("class-variance-authority@0.7.1")
  expect(app.dependencies).toContain("lucide-react@1.48.0")
  const output = await build({
    entryPoints: [entry], bundle: true, write: false, format: "esm", jsx: "automatic", logLevel: "silent",
    plugins: [{ name: "installed-registry", setup(builder) {
      builder.onResolve({ filter: /.*/ }, args => {
        if (!args.path.startsWith(".") && args.kind !== "entry-point") return { path: args.path, external: true }
        const target = args.kind === "entry-point" ? args.path : path.resolve(path.dirname(args.importer), args.path)
        const file = [target, `${target}.tsx`, `${target}.ts`].find(candidate => files.has(candidate))
        if (!file) throw new Error(`Registry does not install ${target}`)
        return { path: file, namespace: "registry" }
      })
      builder.onLoad({ filter: /.*/, namespace: "registry" }, async args => ({
        contents: await readFile(files.get(args.path)!, "utf8"), loader: args.path.endsWith(".tsx") ? "tsx" : "ts",
      }))
    } }],
  })
  expect(output.outputFiles[0].text).toContain("modalNavigation")
})
