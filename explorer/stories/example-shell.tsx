import type { ReactNode } from "react";
import { ArrowUpRight, Box, Component, Layers3 } from "lucide-react";

const levels = {
  Atoms: { label: "Atom", description: "The smallest useful building block.", Icon: Box },
  Molecules: { label: "Molecule", description: "A focused interaction, composed from atoms.", Icon: Component },
  Organisms: { label: "Organism", description: "A complete section with a job to do.", Icon: Layers3 },
};

export function ExampleShell({ title, name, description, importPath, children }: {
  title: string; name: string; description?: string; importPath?: string; children: ReactNode;
}) {
  const [category] = title.split("/");
  const level = category === "Atoms" ? levels.Atoms : category === "Molecules" ? levels.Molecules : category === "Organisms" ? levels.Organisms : undefined;
  if (!level) return <div className="explorer-unframed">{children}</div>;
  const { Icon } = level;
  return <main className="example-shell" data-level={category.toLowerCase()} data-contextual={name === "In Context" || undefined}>
    <header className="example-heading">
      <div className="example-breadcrumb"><Icon aria-hidden size={14} /><span>{level.label}</span><span aria-hidden>/</span><span>{title.split("/").slice(1).join(" / ")}</span></div>
      <div className="example-heading-row"><div><h1>{title.split("/").at(-1)}</h1><p>{description?.split("\n")[0]?.replace(/Import from `[^`]+`\.\s*/, "") || level.description}</p></div><span className="example-state">{name}</span></div>
    </header>
    <div className="example-stage">{children}</div>
    <footer className="example-footer"><span>{level.label} <span aria-hidden>→</span> {category === "Atoms" ? "compose into molecules" : category === "Molecules" ? "compose into organisms" : "compose into templates"}</span>
      {importPath && <code>{importPath}</code>}<span>Source & accessibility in the panel below <ArrowUpRight aria-hidden size={12} /></span></footer>
  </main>;
}
