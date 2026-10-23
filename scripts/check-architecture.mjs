import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = fileURLToPath(new URL("../", import.meta.url));
const sourceRoot = path.join(root, "packages/ui/src");
const manifest = JSON.parse(await readFile(path.join(root, "packages/ui/package.json"), "utf8"));
const layers = new Map();
for (const [specifier, target] of Object.entries(manifest.exports)) {
  const level = specifier.startsWith("./atoms/") ? 1 : specifier.startsWith("./molecules/") ? 2 : specifier.startsWith("./organisms/") ? 3 : 0;
  if (level && typeof target === "string" && !target.includes("*")) layers.set(path.resolve(root, "packages/ui", target), level);
}
function levelOf(file) {
  if (layers.has(file)) return layers.get(file);
  const directory = path.relative(sourceRoot, file).split(path.sep)[0];
  if (directory === "components") throw new Error(`Classify component in package exports: ${file}`);
  return { recipes: 2, effects: 2, molecules: 2, organisms: 3, blocks: 3 }[directory] ?? 0;
}
async function resolveImport(file, specifier) {
  for (const extension of [".tsx", ".ts"]) {
    const target = path.resolve(path.dirname(file), specifier) + extension;
    try { await readFile(target); return target; } catch (error) { if (error.code !== "ENOENT" && error.code !== "ENOTDIR") throw error; }
  }
}
const counts = { atoms: 0, molecules: 0, organisms: 0 };
for (const category of ["components", "recipes", "effects", "molecules", "organisms", "blocks"]) {
  for (const filename of await readdir(path.join(sourceRoot, category))) {
    if (!filename.endsWith(".tsx") || filename === "upload-types.tsx") continue;
    const file = path.join(sourceRoot, category, filename);
    const level = levelOf(file);
    counts[["", "atoms", "molecules", "organisms"][level]]++;
    const source = await readFile(file, "utf8");
    for (const node of ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true).statements) {
      if ((!ts.isImportDeclaration(node) && !ts.isExportDeclaration(node)) || !node.moduleSpecifier || !ts.isStringLiteral(node.moduleSpecifier)) continue;
      const specifier = node.moduleSpecifier.text;
      if (!specifier.startsWith(".")) continue;
      const target = await resolveImport(file, specifier);
      if (target && levelOf(target) > level) throw new Error(`Upward atomic dependency: ${path.relative(sourceRoot,file)} → ${path.relative(sourceRoot,target)}`);
    }
  }
}
console.log(`Verified atomic dependency direction: ${counts.atoms} atoms, ${counts.molecules} molecules, ${counts.organisms} organisms.`);
