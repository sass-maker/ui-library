import ts from "typescript";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { buildExampleSources } from "./example-source.ts";

const root = fileURLToPath(new URL("../", import.meta.url));
const snippets = buildExampleSources();
const files = new Map(Object.entries(snippets).map(([name, source]) => [path.join(root, "__copyable_" + name + ".tsx"), source]));
const options = { strict: true, noEmit: true, skipLibCheck: true, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, types: ["react"] };
const host = ts.createCompilerHost(options);
const sourceFile = host.getSourceFile.bind(host);
host.getSourceFile = (filename, languageVersion, onError, shouldCreateNewSourceFile) => files.has(filename)
  ? ts.createSourceFile(filename, files.get(filename), languageVersion, true, ts.ScriptKind.TSX)
  : sourceFile(filename, languageVersion, onError, shouldCreateNewSourceFile);
const exists = host.fileExists.bind(host);
host.fileExists = filename => files.has(filename) || exists(filename);
const program = ts.createProgram([...files.keys()], options, host);
const diagnostics = ts.getPreEmitDiagnostics(program);
if (diagnostics.length) {
  console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, { getCurrentDirectory: () => root, getCanonicalFileName: file => file, getNewLine: () => "\n" }));
  process.exit(1);
}
function checkReferences(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) checkReferences(filename);
    else if (entry.name.endsWith(".stories.tsx")) for (const match of readFileSync(filename, "utf8").matchAll(/sourceSnippets\.(\w+)/g)) {
      if (!snippets[match[1]]) throw new Error("Missing copyable source for " + match[1]);
    }
  }
}
checkReferences(path.join(root, "stories"));
console.log(Object.keys(snippets).length + " standalone source examples compile with their real dependencies.");
