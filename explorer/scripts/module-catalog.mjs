import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const slug = value => value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const object = node => {
  while (node && (ts.isSatisfiesExpression(node) || ts.isAsExpression(node) || ts.isParenthesizedExpression(node))) node = node.expression;
  return node && ts.isObjectLiteralExpression(node) ? node : undefined;
};
const property = (node, name) => node?.properties.find(item => ts.isPropertyAssignment(item) && (ts.isIdentifier(item.name) || ts.isStringLiteral(item.name) ? item.name.text : item.name.getText()) === name)?.initializer;
const literal = node => node && ts.isStringLiteral(node) ? node.text : undefined;

async function storyFiles(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await storyFiles(file));
    else if (entry.name.endsWith(".stories.tsx")) result.push(file);
  }
  return result;
}

/** Public explorer inventory, generated from source and checked against the built story index. */
export async function buildModuleCatalog(root, manifest, registry) {
  const stories = [];
  for (const file of (await storyFiles(path.join(root, "explorer/stories"))).sort()) {
    const ast = ts.createSourceFile(file, await readFile(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const declarations = ast.statements.filter(ts.isVariableStatement).flatMap(statement => [...statement.declarationList.declarations]);
    const meta = declarations.find(item => ts.isIdentifier(item.name) && item.name.text === "meta");
    const config = object(meta?.initializer);
    const title = literal(property(config, "title"));
    if (!title) continue;
    const exports = ast.statements.filter(statement => ts.isVariableStatement(statement) && statement.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword))
      .flatMap(statement => [...statement.declarationList.declarations]).filter(item => ts.isIdentifier(item.name));
    if (!exports.length) continue;
    stories.push({
      file,
      title,
      description: literal(property(object(property(object(property(object(property(config, "parameters")), "docs")), "description")), "component"))?.split(/\n\s*\n/)[0].trim(),
      group: literal(property(config, "id")) ?? slug(title),
      exports,
      imports: ast.statements.filter(ts.isImportDeclaration).filter(item => ts.isStringLiteral(item.moduleSpecifier)).map(item => ({
        specifier: item.moduleSpecifier.text,
        names: item.importClause?.namedBindings && ts.isNamespaceImport(item.importClause.namedBindings) ? [item.importClause.namedBindings.name.text]
          : item.importClause?.namedBindings && ts.isNamedImports(item.importClause.namedBindings) ? item.importClause.namedBindings.elements.map(binding => binding.name.text)
            : item.importClause?.name ? [item.importClause.name.text] : [],
      })),
    });
  }
  const explicit = new Map(Object.entries(manifest.exports).filter(([key, value]) => /^\.\/(atoms|molecules|organisms)\//.test(key) && typeof value === "string" && !value.includes("*"))
    .map(([key, value]) => [value.replace(/^\.\//, ""), key.replace(/^\.\//, "")]));
  const entries = [];
  for (const category of ["components", "recipes", "effects", "molecules", "organisms", "blocks"]) {
    for (const filename of (await readdir(path.join(root, "packages/ui/src", category))).sort()) {
      if (!filename.endsWith(".tsx") || filename === "upload-types.tsx") continue;
      const name = filename.slice(0, -4);
      const sourcePath = `packages/ui/src/${category}/${filename}`;
      const alias = explicit.get(`src/${category}/${filename}`);
      const layer = alias?.startsWith("atoms/") ? "Atoms" : alias?.startsWith("organisms/") || ["organisms", "blocks"].includes(category) ? "Organisms" : "Molecules";
      const importPath = `@saas-maker/ui/${alias ?? `${category}/${name}`}`;
      const originalImport = `@saas-maker/ui/${category}/${name}`;
      const candidates = stories.filter(story => story.imports.some(item => item.specifier === importPath || item.specifier === originalImport))
        .sort((left, right) => Number(path.basename(right.file) === `${name}.stories.tsx`) - Number(path.basename(left.file) === `${name}.stories.tsx`));
      const story = candidates[0];
      if (!story) throw new Error(`No working story import found for ${sourcePath}`);
      const importedNames = story.imports.filter(item => item.specifier === importPath || item.specifier === originalImport).flatMap(item => item.names);
      const example = path.basename(story.file) === `${name}.stories.tsx` ? story.exports[0] : story.exports.find(item => importedNames.some(identifier => new RegExp(`\\b${identifier}\\b`).test(item.initializer?.getText() ?? ""))) ?? story.exports[0];
      const ast = ts.createSourceFile(filename, await readFile(path.join(root, sourcePath), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      const symbols = [];
      let defaultName;
      for (const statement of ast.statements) {
        if (ts.isExportDeclaration(statement) && !statement.isTypeOnly && statement.exportClause && ts.isNamedExports(statement.exportClause)) symbols.push(...statement.exportClause.elements.filter(item => !item.isTypeOnly).map(item => item.name.text));
        if (statement.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)) {
          if (statement.modifiers.some(modifier => modifier.kind === ts.SyntaxKind.DefaultKeyword)) defaultName = statement.name?.text;
          else if (ts.isFunctionDeclaration(statement) && statement.name) symbols.push(statement.name.text);
          else if (ts.isVariableStatement(statement)) symbols.push(...statement.declarationList.declarations.filter(item => ts.isIdentifier(item.name)).map(item => item.name.text));
        }
      }
      const primary = defaultName ?? symbols.find(symbol => /^[A-Z]/.test(symbol));
      const item = registry.items.find(item => item.name === name && item.files.some(file => file.path === sourcePath));
      // Some established blocks have an alternate registry name or ship inside
      // another registry item. Match their actual source, preserving package names.
      const dependencyItem = item ?? registry.items.find(item => item.files.some(file => file.path === sourcePath));
      if (!dependencyItem) throw new Error(`No registry dependency metadata found for ${sourcePath}`);
      entries.push({
        id: `${category}/${name}`,
        name: item?.title && item.title !== name ? item.title : name.replace(/(^|-)([a-z])/g, (_, separator, letter) => (separator ? " " : "") + letter.toUpperCase()),
        layer,
        family: category,
        description: story.description && !/^Import from/.test(story.description) ? story.description : item?.description && !/^(Components module|Fleet UI)/.test(item.description) ? item.description : "",
        section: story.title.split("/").slice(0, -1).join(" / "),
        importPath,
        importName: defaultName ?? primary ?? "Module",
        importStatement: defaultName ? `import ${defaultName} from "${importPath}";` : primary ? `import { ${primary} } from "${importPath}";` : `import * as Module from "${importPath}";`,
        sourcePath,
        sourceRef: `v${manifest.version}`,
        storyId: `${story.group}--${slug(example.name.text)}`,
        registryName: dependencyItem.name,
        dependencies: dependencyItem.dependencies ?? [],
      });
    }
  }
  return entries.sort((left, right) => left.name.localeCompare(right.name, "en", { sensitivity: "base", numeric: true }));
}
