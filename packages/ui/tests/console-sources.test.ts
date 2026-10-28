import { describe, expect, it } from "vitest";
import { compile } from "@tailwindcss/node";
import { createRequire } from "node:module";
import { cp, mkdtemp, readFile, realpath, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

// Use the scanner from the site's pinned Tailwind Vite dependency, as production does.
const siteRequire = createRequire(resolve("../../site/package.json"));
const viteRequire = createRequire(siteRequire.resolve("@tailwindcss/vite"));
const { Scanner } = viteRequire("@tailwindcss/oxide");

describe("Console isolated-install CSS sources", () => {
  it("keeps consumer and declared Console utilities without unrelated package scans", async () => {
    const ui = resolve("src"), templates = resolve("../templates/src");
    const compiled = await compile(await readFile(resolve(templates, "console.css"), "utf8"), { base: templates, onDependency() {} });
    const app = await realpath(await mkdtemp(resolve(tmpdir(), "console-sources-")));
    const installedUi = resolve(app, "node_modules/.pnpm/ui/node_modules/@saas-maker/ui/src");
    const installedTemplates = resolve(app, "node_modules/.pnpm/templates/node_modules/@saas-maker/templates/src");
    await cp(ui, installedUi, { recursive: true });
    await cp(templates, installedTemplates, { recursive: true });
    await writeFile(resolve(app, "page.html"), '<main class="min-h-[413px] text-sm">consumer</main>');
    const sources = compiled.sources.map(source => ({ ...source, base: source.base.replace(ui, installedUi).replace(templates, installedTemplates) }));
    const root = { base: app, pattern: "**/*", negated: false };
    // Reproduce the unwanted directory promotion with the same installed paths.
    const before = new Scanner({ sources: [root, ...sources.filter(source => !source.negated)] });
    expect(before.scan()).toContain("blur-[90px]");
    const after = new Scanner({ sources: [root, ...sources] });
    const candidates = after.scan();
    const declared = new Scanner({ sources: sources.filter(source => !source.negated) });
    declared.scan();
    expect(declared.files).toHaveLength(37);
    expect(after.files.filter(file => file.startsWith(installedUi) || file.startsWith(installedTemplates)).sort()).toEqual(declared.files.sort());
    expect(candidates).not.toContain("blur-[90px]");
    expect(after.files.some(file => file.endsWith("/frames.tsx"))).toBe(false);
    expect(after.files.some(file => file.endsWith("/gallery-page.tsx"))).toBe(false);
    for (const name of ["data-table.tsx", "checkbox.tsx", "filter-bar.tsx", "search-palette.tsx", "record-detail.tsx", "console-page.tsx", "Base.astro", "select.tsx", "toggle-group.tsx", "toggle.tsx"]) {
      expect(after.files.some(file => file.endsWith(`/${name}`))).toBe(true);
    }
    const css = compiled.build(candidates);
    expect(css).toContain("min-height: 413px");
    expect(css).toContain("border-separate");
    expect(candidates).toContain("data-[state=checked]:border-primary");
    expect(css.includes('data-state="checked"')).toBe(true);
    expect(css).toContain("focus-visible");
    expect(candidates).toContain("motion-safe:enabled:active:scale-[0.97]");
    expect(candidates).toContain("[&::-webkit-progress-value]:bg-primary");
    expect(css).toContain('data-mode="dark"');
  });
});
