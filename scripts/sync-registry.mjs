import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const sourceRoot = path.join(root, "packages/ui/src");
const manifest = JSON.parse(await readFile(path.join(root, "packages/ui/package.json"), "utf8"));
const registryPath = path.join(root, "registry.json");
const registry = JSON.parse(await readFile(registryPath, "utf8"));
const existing = new Map(registry.items.map(item => [item.name, item]));
const categories = ["components", "recipes", "effects", "molecules", "organisms"];
const generated = new Map();

async function resolveImport(from, specifier) {
  const target = path.resolve(path.dirname(from), specifier);
  for (const suffix of [".tsx", ".ts", "/index.tsx", "/index.ts"]) {
    try { await readFile(target + suffix); return target + suffix; } catch (error) { if (error.code !== "ENOENT" && error.code !== "ENOTDIR") throw error; }
  }
  throw new Error(`Unresolved registry import ${specifier} in ${from}`);
}

for (const category of categories) {
  for (const filename of (await readdir(path.join(sourceRoot, category))).sort()) {
    if (!filename.endsWith(".tsx") || filename === "upload-types.tsx") continue;
    const name = filename.slice(0, -4);
    const visited = new Set();
    const dependencies = new Set();
    async function visit(file) {
      if (visited.has(file)) return;
      if (!file.startsWith(sourceRoot + path.sep)) throw new Error(`Registry import escapes UI source: ${file}`);
      visited.add(file);
      const source = await readFile(file, "utf8");
      for (const node of ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true).statements) {
        if ((!ts.isImportDeclaration(node) && !ts.isExportDeclaration(node)) || !node.moduleSpecifier || !ts.isStringLiteral(node.moduleSpecifier)) continue;
        const specifier = node.moduleSpecifier.text;
        if (specifier.startsWith(".")) await visit(await resolveImport(file, specifier));
        else {
          const packageName = specifier.startsWith("@") ? specifier.split("/").slice(0,2).join("/") : specifier.split("/")[0];
          if (packageName === "react" || packageName === "react-dom") continue;
          const version = manifest.dependencies[packageName];
          if (!version) throw new Error(`Unpinned registry dependency: ${packageName}`);
          dependencies.add(`${packageName}@${version}`);
        }
      }
    }
    await visit(path.join(sourceRoot, category, filename));
    const old = existing.get(name);
    generated.set(name, {
      name,
      type: category === "organisms" ? "registry:block" : "registry:ui",
      title: old?.title ?? name.replace(/(^|-)([a-z])/g, (_, separator, letter) => (separator ? " " : "") + letter.toUpperCase()),
      description: old?.description ?? `Fleet UI ${category === "organisms" ? "organism" : "molecule"}: ${name.replaceAll("-", " ")}. Uses semantic tokens and shared atomic components.`,
      dependencies: [...dependencies].sort(),
      registryDependencies: ["theme"],
      files: [...[...visited].sort().map(file => ({
        path: path.relative(root, file).split(path.sep).join("/"),
        type: "registry:ui",
        target: "src/components/fleet/" + path.relative(sourceRoot, file).split(path.sep).join("/"),
      })), { path: "THIRD_PARTY_NOTICES.md", type: "registry:file", target: "THIRD_PARTY_NOTICES.fleet-ui.md" },
        { path: "LICENSE", type: "registry:file", target: "LICENSE.fleet-ui" }],
    });
  }
}
registry.items = [...registry.items.filter(item => !generated.has(item.name)), ...generated.values()];
const output = JSON.stringify(registry, null, 2) + "\n";
if (process.argv.includes("--check")) {
  if (await readFile(registryPath, "utf8") !== output) throw new Error("Registry is stale. Run pnpm registry:sync.");
  console.log(`Verified ${generated.size} source modules and transitive imports in ${registry.items.length} registry items.`);
} else {
  await writeFile(registryPath, output);
  console.log(`Generated ${generated.size} source modules in ${registry.items.length} registry items.`);
}
