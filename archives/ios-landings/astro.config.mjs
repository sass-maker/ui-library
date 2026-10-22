import { existsSync } from "node:fs";
import { readFile, readdir, unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { catalog, resolveProductId } from "./src/lib/catalog.ts";

const productId = resolveProductId(process.env.PRODUCT);
const site = catalog[productId];
// A product with a SaaS Maker UI-library content file renders its home page
// from that file; every other route keeps the factory layout.
const templateHome = existsSync(new URL(`./products/${productId}/content.json`, import.meta.url));
const home = templateHome ? "./src/components/TemplateHome.astro" : "./src/components/EditorialHome.astro";

export default defineConfig({
  site: site.url,
  output: "static",
  trailingSlash: "ignore",
  publicDir: `./products/${productId}/public`,
  outDir: `./dist/${productId}`,
  integrations: [react(), ...(productId === "kith" ? [{
    name: "kith-unused-artwork",
    hooks: {
      "astro:build:done": async ({ dir }) => {
        // Astro emits imported originals alongside responsive variants. Retain
        // public fallback URLs, but omit unreferenced copies of the story art.
        const files = await readdir(dir, { recursive: true });
        const html = (await Promise.all(files.filter(file => file.endsWith(".html"))
          .map(file => readFile(new URL(file, dir), "utf8")))).join("\n");
        for (const file of files.filter(file => /^_astro\/(book-stage|coastal-walk-v2|memory-table-v2)\.[^.]+\.webp$/.test(file))) {
          if (!html.includes(`/${file}`)) await unlink(new URL(file, dir));
        }
      }
    }
  }] : [])],
  build: {
    format: "directory",
    inlineStylesheets: "always"
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: { "@factory/home": fileURLToPath(new URL(home, import.meta.url)) }
    },
    define: {
      "import.meta.env.PRODUCT": JSON.stringify(productId),
      "import.meta.env.TEMPLATE_HOME": JSON.stringify(templateHome)
    },
    css: { transformer: "lightningcss" },
    build: { cssMinify: "lightningcss" }
  }
});
