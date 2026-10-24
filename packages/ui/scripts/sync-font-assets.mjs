import { copyFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = path.join(root, "src/fonts");
const additions = {
  "instrument-sans": { axis: "wght", styles: ["normal", "italic"] },
  manrope: { axis: "wght", styles: ["normal"] },
  "bricolage-grotesque": { axis: "opsz", styles: ["normal"] },
  "ibm-plex-sans": { axis: "wght", styles: ["normal", "italic"] },
};
const names = ["figtree", "geist", "geist-mono", "newsreader", "fraunces", "instrument-serif", ...Object.keys(additions)];
await mkdir(path.join(output, "licenses"), { recursive: true });
const families = [];
for (const name of names) {
  const packageName = `${name === "instrument-serif" ? "@fontsource" : "@fontsource-variable"}/${name}`;
  const source = path.join(root, "node_modules", packageName);
  const metadata = JSON.parse(await readFile(path.join(source, "metadata.json"), "utf8"));
  const pkg = JSON.parse(await readFile(path.join(source, "package.json"), "utf8"));
  if (metadata.license.type !== "OFL-1.1") throw new Error(`Unexpected license for ${name}`);
  const license = `licenses/${name}-OFL.txt`;
  await copyFile(path.join(source, "LICENSE"), path.join(output, license));
  const added = additions[name];
  if (added) for (const style of added.styles) {
    await copyFile(path.join(source, `files/${name}-latin-${added.axis}-${style}.woff2`), path.join(output, `${name}-latin-${style}.woff2`));
  }
  const files = (await readdir(output)).filter(file => file.startsWith(name === "newsreader" ? "newsreader-" : `${name}-latin-`) && file.endsWith(".woff2")).sort();
  const assets = await Promise.all(files.map(async file => {
    const bytes = await readFile(path.join(output, file));
    return { file, bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex"), ...(added ? { upstreamFile: `files/${name}-latin-${added.axis}-${file.includes("-italic.") ? "italic" : "normal"}.woff2`, modified: false } : { modified: true, build: "../../scripts/build-fonts.sh" }) };
  }));
  families.push({ family: metadata.family, package: packageName, version: pkg.version, license: { ...metadata.license, file: license }, styles: metadata.styles, assets });
}
await writeFile(path.join(output, "sources.json"), JSON.stringify({ subset: "latin", families }, null, 2) + "\n");
console.log(`Retained ${families.length} OFL licenses and ${families.flatMap(f => f.assets).length} font asset records.`);
