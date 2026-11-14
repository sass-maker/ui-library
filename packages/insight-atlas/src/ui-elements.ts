import { createUiControl } from "@saas-maker/ui/lib/dom-controls";
import type { NativeControlTag } from "@saas-maker/ui/lib/native-control-styles";

const nativeTags = new Set([
  "button",
  "a",
  "input",
  "textarea",
  "select",
  "details",
  "summary",
  "dialog",
  "progress",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
]);

export function atlasElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  value?: string,
  className?: string
): HTMLElementTagNameMap[K] {
  const node = nativeTags.has(tag)
    ? createUiControl(tag as NativeControlTag, {}, [], {
        variant: tag === "button" ? "ghost" : undefined,
        size: tag === "button" ? "content" : undefined,
        className: [
          tag === "button"
            ? "grid justify-stretch"
            : "",
          className,
        ]
          .filter(Boolean)
          .join(" "),
      })
    : document.createElement(tag);
  if (value !== undefined) node.textContent = value;
  if (!nativeTags.has(tag) && className) node.className = className;
  return node as HTMLElementTagNameMap[K];
}
