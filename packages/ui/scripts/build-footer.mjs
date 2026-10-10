import { build, transform } from "esbuild";
import { readFile, writeFile, unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as icons from "lucide-react";
import { compile } from "@tailwindcss/node";
const ui = fileURLToPath(new URL("../", import.meta.url));
process.chdir(ui);
const runtime = fileURLToPath(
  new URL("../footer/html-runtime.js", import.meta.url),
);
const plugin = {
  name: "footer-static",
  setup(b) {
    b.onLoad(
      { filter: /blocks\/(footer|assistant-logos)\.tsx$/ },
      async ({ path }) => ({
        contents:
          "import { h, Fragment } from " +
          JSON.stringify(runtime) +
          ";\n" +
          (await readFile(path, "utf8")).replace(
            'import * as React from "react";',
            "",
          ),
        loader: "tsx",
      }),
    );
    b.onResolve({ filter: /^lucide-react$/ }, () => ({
      path: "icons",
      namespace: "static-icons",
    }));
    b.onLoad({ filter: /.*/, namespace: "static-icons" }, () => ({
      contents:
        "import { raw, escapeHtml } from " +
        JSON.stringify(runtime) +
        ";\n" +
        [
          "ArrowUpRightIcon",
          "CrosshairIcon",
          "ImageIcon",
          "MessageSquareIcon",
          "SendIcon",
          "SparklesIcon",
          "XIcon",
        ]
          .map((name) => {
            const svg = renderToStaticMarkup(
              createElement(icons[name], {
                className: "__CLASS__",
                "aria-hidden": true,
              }),
            );
            return `export const ${name} = (props) => raw(${JSON.stringify(svg)}.replace('__CLASS__', escapeHtml(props.className || '')));`;
          })
          .join("\n"),
      loader: "js",
      resolveDir: ui,
    }));
  },
};
for (const [entry, outfile] of [
  ["footer/html.js", "footer-html.js"],
  ["footer/element.js", "footer.js"],
]) {
  await build({
    entryPoints: [entry],
    outfile,
    bundle: true,
    format: "esm",
    target: "es2022",
    minify: true,
    plugins: [plugin],
    jsx: "transform",
    jsxFactory: "h",
    jsxFragment: "Fragment",
    legalComments: "none",
    tsconfigRaw: {
      compilerOptions: {
        jsx: "react",
        jsxFactory: "h",
        jsxFragmentFactory: "Fragment",
      },
    },
  });
}
// Extract only tokens/presets, Tailwind mappings and footer component roles.
// No fonts, animations, page surfaces or unrelated component styles are shipped.
const theme = await readFile("src/styles/theme.css", "utf8");
let tokens = theme.slice(
  theme.indexOf(":root {"),
  theme.indexOf("@layer base"),
);
// Keep only semantic roles referenced by footer utilities and their dependencies.
const rolesNeeded =
  /^(font-|display-|ui-case|eyebrow-|radius|brand(?:-|:)|background|foreground|surface:|card:|primary(?:-|:)|muted-foreground|accent:|border:|input:|ring:|shadow-color|color-(?:background|foreground|surface|card|primary|muted-foreground|accent|border|input|ring|brand)|shadow-(?:xs|2xl))/;
tokens = tokens.replace(/^\s*--([^\n]+);/gm, (declaration, content) =>
  rolesNeeded.test(content) ? declaration : "",
);
const mappingStart = tokens.indexOf("@theme inline");
tokens =
  tokens
    .slice(0, mappingStart)
    .replace(/--font-(sans|display|text|mono):[^;]+;/g, "") +
  tokens.slice(mappingStart);
tokens = tokens.replace(":root {", ":where(:root) {");
const roles = ["font-display", "eyebrow", "container-page"]
  .map((name) => theme.match(new RegExp("  \\." + name + " \\{[^}]+\\}"))[0])
  .join("\n");
const darkGallery = theme.slice(
  theme.indexOf('[data-theme="gallery"][data-mode="dark"]'),
  theme.indexOf('html[style*="--font-"]'),
);
const css = `@layer theme, base, components, utilities;
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities) source(none);
@source "../src/blocks/footer.tsx";
${tokens}
${darkGallery}
@layer components { ${roles}
:where(h1,h2,h3,h4).font-display { text-transform:var(--display-case); }
.ui-case { text-transform:var(--ui-case); }
}
/* Defaults have zero specificity, so a page's theme/font overrides win. */
:where(:root) { --font-sans:ui-sans-serif,system-ui,sans-serif; --font-display:ui-sans-serif,system-ui,sans-serif; --font-text:var(--font-sans); --font-mono:ui-monospace,monospace; }
studio-footer { display:block; }
@layer base {
:where(studio-footer) { font-family:var(--font-sans); color:var(--foreground); line-height:1.5; }
:where(studio-footer *,studio-footer *::before,studio-footer *::after) { box-sizing:border-box; border:0 solid; }
:where(studio-footer h2,studio-footer p,studio-footer ul,studio-footer fieldset) { margin:0; padding:0; }
:where(studio-footer ul) { list-style:none; }
:where(studio-footer a) { color:inherit; text-decoration:inherit; }
:where(studio-footer button,studio-footer input,studio-footer textarea) { font:inherit; color:inherit; background:transparent; }
:where(studio-footer button) { cursor:pointer; }
:where(studio-footer svg,studio-footer img) { display:block; vertical-align:middle; }
:where(studio-footer img) { max-width:100%; }
:where(studio-footer dialog:not([open])) { display:none; }
:where(studio-footer :focus-visible) { outline:2px solid var(--ring); outline-offset:2px; }
}
`;
await writeFile("footer/input.css", css);
try {
  const compiler = await compile(css, {
    base: ui + "/footer",
    onDependency() {},
  });
  const source = await readFile("src/blocks/footer.tsx", "utf8");
  const candidates = [
    ...new Set(source.match(/[A-Za-z0-9_:[\]#%.,()\/!+>-]+/g)),
  ];
  await writeFile(
    "footer.css",
    (
      await transform(compiler.build(candidates), {
        loader: "css",
        minify: true,
      })
    ).code,
  );
} finally {
  await unlink("footer/input.css");
}
