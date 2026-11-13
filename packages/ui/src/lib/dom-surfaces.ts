import { cardStyles } from "../components/card"

export function createUiSurface<Tag extends "div" | "section" | "article" | "aside">(tag: Tag, className?: string, document: Document = globalThis.document): HTMLElementTagNameMap[Tag] {
  const element = document.createElement(tag)
  element.dataset.slot = "card"
  element.className = cardStyles(className)
  return element
}
