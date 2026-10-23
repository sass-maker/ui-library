import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import type { Plugin } from "vite";

const directory = new URL("../stories/", import.meta.url);
const helperNames = ["recipe-examples.tsx", "workflow-examples.tsx", "workspace-examples.tsx"];
const fixtureName = "composition-fixtures.ts";
const read = (name: string) => ts.createSourceFile(name, readFileSync(new URL(name, directory), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

function namesIn(node: ts.Node) {
  const names = new Set<string>();
  const visit = (child: ts.Node) => { if (ts.isIdentifier(child)) names.add(child.text); ts.forEachChild(child, visit); };
  visit(node);
  return names;
}

function definitions(file: ts.SourceFile) {
  const result = new Map<string, ts.Statement>();
  for (const node of file.statements) {
    if (ts.isVariableStatement(node)) for (const declaration of node.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name)) result.set(declaration.name.text, node);
    }
    if (ts.isFunctionDeclaration(node) && node.name) result.set(node.name.text, node);
  }
  return result;
}

function importText(node: ts.ImportDeclaration, file: ts.SourceFile, used: Set<string>) {
  if (!ts.isStringLiteral(node.moduleSpecifier) || node.moduleSpecifier.text.startsWith(".") || node.moduleSpecifier.text.startsWith("@storybook/")) return;
  const clause = node.importClause;
  if (!clause) return;
  const parts: string[] = [];
  if (clause.name && used.has(clause.name.text)) parts.push(clause.name.text);
  const bindings = clause.namedBindings;
  if (bindings && ts.isNamespaceImport(bindings) && used.has(bindings.name.text)) parts.push("* as " + bindings.name.text);
  if (bindings && ts.isNamedImports(bindings)) {
    const selected = bindings.elements.filter(binding => used.has(binding.name.text));
    if (selected.length) parts.push("{ " + selected.map(binding => binding.getText(file)).join(", ") + " }");
  }
  if (parts.length) return "import " + (clause.isTypeOnly ? "type " : "") + parts.join(", ") + " from " + JSON.stringify(node.moduleSpecifier.text) + ";";
}

/** Build copyable examples from the implementation, with only their actual dependencies. */
export function buildExampleSources() {
  const fixture = read(fixtureName);
  const result: Record<string, string> = {};
  for (const name of helperNames) {
    const file = read(name);
    const available = new Map([...definitions(fixture), ...definitions(file)]);
    for (const node of file.statements) {
      if (!ts.isFunctionDeclaration(node) || !node.name || !node.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)) continue;
      const used = namesIn(node);
      const included = new Set<ts.Statement>([node]);
      const declarations: string[] = [];
      const include = (identifier: string) => {
        const dependency = available.get(identifier);
        if (!dependency || included.has(dependency)) return;
        included.add(dependency);
        for (const reference of namesIn(dependency)) { used.add(reference); include(reference); }
        declarations.push(dependency.getText().replace(/^export\s+/, ""));
      };
      for (const identifier of [...used]) include(identifier);
      const imports = [...file.statements, ...fixture.statements].filter(ts.isImportDeclaration).map(declaration => importText(declaration, declaration.getSourceFile(), used)).filter((text): text is string => !!text);
      result[node.name.text] = [
        '"use client";',
        "// Local example data. Replace demo artwork URLs with your own assets.",
        ...new Set(imports),
        "",
        ...declarations,
        "",
        node.getText(file),
      ].join("\n");
    }
  }
  return result;
}

export function exampleSourcePlugin(): Plugin {
  const id = "virtual:fleet-example-source";
  const resolved = "\0" + id;
  const watched = [...helperNames, fixtureName].map(name => fileURLToPath(new URL(name, directory)));
  return {
    name: "fleet-example-source",
    resolveId(source) { if (source === id) return resolved; },
    load(source) {
      if (source !== resolved) return;
      watched.forEach(file => this.addWatchFile(file));
      return "export const sourceSnippets = " + JSON.stringify(buildExampleSources()) + ";";
    },
    handleHotUpdate(context) {
      if (!watched.includes(context.file)) return;
      const module = context.server.moduleGraph.getModuleById(resolved);
      if (module) { context.server.moduleGraph.invalidateModule(module); return [module]; }
    },
  };
}
