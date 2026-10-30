import { transform } from "lightningcss";

const root = "footer[data-fleet-footer]";
function parseSelector(selector) {
  let parsed;
  transform({
    filename: "footer-scope.css",
    code: Buffer.from(`${selector}{}`),
    visitor: { Rule(rule) { if (rule.type === "style") parsed = rule.value.selectors[0]; } },
  });
  return parsed;
}
const rootSelector = parseSelector(`:where(${root})`);
const withinFooter = parseSelector(`:where(${root},${root} *)`)[0];
const descendant = { type: "combinator", value: "descendant" };
const isRoot = (selector) => selector.every(part => part.type === "pseudo-class" &&
  (["root", "host"].includes(part.kind) || part.kind === "where" && part.selectors.every(isRoot)));
const isTheme = (selector) => selector.every(part =>
  part.type === "attribute" && /^data-(theme|mode|surface)$/.test(part.name) ||
  part.type === "class" && part.name === "dark");

/** Constrain each matched element, leaving its ancestor/theme conditions intact. */
export function scopeFooterCss(css) {
  let styleDepth = 0;
  const rootDefaults = [];
  const output = transform({
    filename: "footer.css",
    code: Buffer.from(css),
    minify: true,
    visitor: {
      Rule(rule) {
        if (rule.type !== "style") return;
        styleDepth++;
        rootDefaults.push(rule.value.selectors.every(isRoot));
      },
      Selector(selector) {
        if (styleDepth > 1) return;
        // Existing reset/theme adapters already name the footer boundary.
        if (JSON.stringify(selector).includes('"name":"data-fleet-footer"') ||
          selector.length === 1 && selector[0].type === "type" && selector[0].name === "studio-footer") return;
        if (isRoot(selector)) return rootSelector;
        const scoped = [...selector];
        const pseudoElement = scoped.findIndex(part => part.type === "pseudo-element");
        scoped.splice(pseudoElement < 0 ? scoped.length : pseudoElement, 0, withinFooter);
        // A page may declare its theme on html/body rather than on the footer.
        return isTheme(selector) ? [scoped, [...selector, descendant, ...rootSelector]] : scoped;
      },
      Declaration(declaration) {
        // Local defaults must not mask font roles inherited from the page.
        if (rootDefaults.at(-1) && declaration.property === "custom" &&
          /^--font-(sans|display|text|mono)$/.test(declaration.value.name)) return [];
      },
      RuleExit(rule) {
        if (rule.type === "style") { styleDepth--; rootDefaults.pop(); }
      },
    },
  }).code.toString();
  return output.replace(/var\(--font-(sans|display|text|mono)\)/g,
    (_value, role) => `var(--font-${role},${role === "mono" ? "ui-monospace,monospace" : "ui-sans-serif,system-ui,sans-serif"})`)
    .replace(/var\(--(background|foreground|surface|card(?:-foreground)?|primary(?:-foreground)?|muted(?:-foreground)?|accent(?:-foreground)?|border|input|ring|shadow-color|brand(?:-foreground|-soft|-ink)?)\)/g,
      (_value, role) => `var(--${role},var(--fleet-footer-default-${role}))`);
}
