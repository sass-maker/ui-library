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
// Typography and identity are the standalone footer's inherited public roles.
// Palette roles stay local: unrelated hosts may use incompatible HSL tokens.
const isInheritedRole = (name) => /^--(?:font-(?:sans|display|text|mono|features)|display-[\w-]+|ui-case|eyebrow-[\w-]+|radius|brand(?:-[\w-]+)?)$/.test(name);
const isRoot = (selector) => selector.every(part => part.type === "pseudo-class" &&
  (["root", "host"].includes(part.kind) || part.kind === "where" && part.selectors.every(isRoot)));
const isTheme = (selector) => selector.every(part =>
  part.type === "attribute" && /^data-(theme|mode|surface)$/.test(part.name) ||
  part.type === "class" && part.name === "dark");

/** Constrain each matched element, leaving its ancestor/theme conditions intact. */
export function scopeFooterCss(css) {
  let styleDepth = 0;
  let declarationName;
  const output = transform({
    filename: "footer.css",
    code: Buffer.from(css),
    minify: true,
    visitor: {
      Rule(rule) {
        if (rule.type !== "style") return;
        styleDepth++;
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
        declarationName = undefined;
        if (declaration.property !== "custom") return;
        const name = declaration.value.name;
        // Tailwind's imported font defaults must not mask inherited page fonts.
        if (/^--font-(sans|display|text|mono)$/.test(name)) return [];
        if (isInheritedRole(name)) declarationName = name;
      },
      DashedIdent(name) {
        // The first identifier is the declaration name; references in its value
        // must still resolve inherited page roles before our private defaults.
        if (name !== declarationName) return;
        declarationName = undefined;
        return `--fleet-footer-default-${name.slice(2)}`;
      },
      DeclarationExit() {
        declarationName = undefined;
      },
      RuleExit(rule) {
        if (rule.type === "style") styleDepth--;
      },
    },
  }).code.toString();
  return output.replace(/var\((--[\w-]+)\)/g, (value, name) =>
    isInheritedRole(name) ? `var(${name},var(--fleet-footer-default-${name.slice(2)}))` : value);
}
