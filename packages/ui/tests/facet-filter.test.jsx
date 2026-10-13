// @vitest-environment happy-dom
import React, { act } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FacetFilter } from "../src/blocks/filter-bar";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const roots = [];
async function mount(node, hydrate = false) {
  const container = document.createElement("div"); document.body.append(container);
  if (hydrate) container.innerHTML = renderToString(node);
  let root;
  await act(async () => { root = hydrate ? hydrateRoot(container, node) : createRoot(container); if (!hydrate) root.render(node); });
  roots.push({ root, container });
  return { container, update: async node => act(async () => root.render(node)) };
}
afterEach(async () => { for (const { root, container } of roots.splice(0)) { await act(async () => root.unmount()); container.remove(); } });
async function click(button) { await act(async () => button.click()); }
const items = () => [...document.querySelectorAll('[cmdk-item]')];

describe("FacetFilter popover presence", () => {
  it("does not allocate or format option lists during closed SSR/hydration/updates", async () => {
    const read = vi.fn(() => 12);
    const options = Array.from({ length: 544 }, (_, i) => ({ value: `Category ${i}`, get count() { return read(); } }));
    const view = selected => <FacetFilter label="category" options={options} selected={selected} onChange={vi.fn()} />;
    const { container, update } = await mount(view([]), true);
    expect(read).not.toHaveBeenCalled(); expect(items()).toHaveLength(0);
    await update(view(["Category 2"]));
    expect(read).not.toHaveBeenCalled(); expect(container.textContent).toContain("Category 2");
    await click(container.querySelector("button"));
    expect(items()).toHaveLength(544);
    expect(items()[543].textContent).toContain("Category 54312");
    expect(read).toHaveBeenCalled();
  });
  it("opens with every current option/count and keeps controlled selection and callbacks current", async () => {
    const old = vi.fn(), current = vi.fn();
    const view = (options, selected, onChange) => <FacetFilter label="category" options={options} selected={selected} onChange={onChange} />;
    const { container, update } = await mount(view([{ value: "Old", count: 1 }], [], old));
    await update(view([{ value: "Tools", count: 7 }, { value: "Science", count: 0 }], ["Tools"], current));
    await click(container.querySelector("button"));
    expect(items()).toHaveLength(2); expect(items()[0].textContent).toContain("Tools7"); expect(items()[1].textContent).toContain("Science0");
    expect(items()[0].getAttribute("aria-checked")).toBe("true");
    expect(document.activeElement.getAttribute("placeholder")).toBe("Find category…");
    await click(items()[1]); expect(current).toHaveBeenLastCalledWith(["Tools", "Science"]); expect(old).not.toHaveBeenCalled();
    expect(items()[1].getAttribute("aria-checked")).toBe("false"); // no uncontrolled selection
    await update(view([{ value: "Tools", count: 9 }, { value: "Science", count: 2 }], ["Tools", "Science"], current));
    expect(items()[1].getAttribute("aria-checked")).toBe("true"); expect(items()[0].textContent).toContain("Tools9");
    await click([...document.querySelectorAll("button")].find(button => button.textContent === "clear")); expect(current).toHaveBeenLastCalledWith([]);
  });
});
