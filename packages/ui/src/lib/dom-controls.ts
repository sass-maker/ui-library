import { nativeControlStyles, type NativeControlStyleOptions, type NativeControlTag } from "./native-control-styles"

export type UiControlAttributes = Record<string, string | number | boolean | null | undefined>
export type UiControlChild = Node | string | number | null | undefined | false
export type UiControlOptions = NativeControlStyleOptions & { document?: Document }

const supportedTags = new Set<NativeControlTag>([
  "button", "a", "input", "textarea", "select", "details", "summary", "dialog", "progress",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption",
])

/** Creates the actual native control. No DOM or browser state is read at import time. */
export function createUiControl<Tag extends NativeControlTag>(
  tag: Tag,
  attributes: UiControlAttributes = {},
  children: readonly UiControlChild[] = [],
  options: UiControlOptions = {},
): HTMLElementTagNameMap[Tag] {
  if (!supportedTags.has(tag)) throw new TypeError(`Unsupported UI control: ${tag}`)
  const document = options.document ?? globalThis.document
  if (!document) throw new Error("createUiControl requires a Document")
  const element = document.createElement(tag)
  element.dataset.slot = tag === "details" ? "native-disclosure" : `native-${tag}`
  for (const [key, value] of Object.entries(attributes)) {
    if (value == null) continue
    // ARIA/data false are meaningful strings; HTML boolean false is absence.
    const labelled = key.startsWith("aria-") || key.startsWith("data-")
    if (value === false && !labelled) continue
    element.setAttribute(key, value === true && !labelled ? "" : String(value))
  }
  element.className = nativeControlStyles(tag, {
    ...options,
    type: attributes.type == null ? undefined : String(attributes.type),
    className: [element.className, options.className].filter(Boolean).join(" "),
  })
  for (const child of children) {
    if (child != null && child !== false) element.append(typeof child === "object" ? child : document.createTextNode(String(child)))
  }
  return element
}

/** Explicit-document form for SSR, iframes and callers with multiple documents. */
export function createNativeControl<Tag extends NativeControlTag>(
  document: Document,
  tag: Tag,
  attributes: UiControlAttributes = {},
  children: readonly UiControlChild[] = [],
  options: Omit<UiControlOptions, "document"> = {},
) {
  return createUiControl(tag, attributes, children, { ...options, document })
}
