// @vitest-environment happy-dom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DataTable } from "../src/components/data-table";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const rows = [
  { id: "a", product: "Alpha", effort: 0, result: null },
  { id: "b", product: "Bravo", effort: null, result: 0 },
  { id: "c", product: "Charlie", effort: 3, result: 5 },
  { id: "d", product: "Delta", effort: 1, result: 2 },
  { id: "e", product: "Echo", effort: 2, result: 1 },
];
const columns = [
  { id: "product", header: "Product", value: row => row.product, hideable: false },
  { id: "effort", header: "Effort", value: row => row.effort, align: "right", group: "Product & feature parity" },
  { id: "result", header: "Result", value: row => row.result, align: "right", group: "Product & feature parity" },
];
const base = { data: rows, columns, getRowId: row => row.id, label: "scoreboard", pageSize: 5 };
const roots = [];
function mount(node) {
  const container = document.createElement("div"); document.body.append(container);
  let root;
  act(() => { root = createRoot(container); root.render(node); });
  roots.push({ root, container });
  return { container, update: node => act(() => root.render(node)) };
}
afterEach(() => { for (const { root, container } of roots.splice(0)) { act(() => root.unmount()); container.remove(); } });
const visibleIds = container => [...container.querySelectorAll("tbody tr[data-row] td[data-column-id=product]")].map(cell => cell.textContent);

describe("DataTable grouped headers", () => {
  it("renders semantic grouped and leaf headers with spans and a single selection header", () => {
    const { container } = mount(<DataTable {...base} selection={{ selected: [], onChange: vi.fn() }} />);
    const headerRows = container.querySelectorAll("thead tr");
    expect(headerRows).toHaveLength(2);
    const parent = container.querySelector('th[data-group-header="Product & feature parity"]');
    expect(parent.textContent).toBe("Product & feature parity");
    expect(parent.getAttribute("scope")).toBe("colgroup");
    expect(parent.colSpan).toBe(2);
    expect(container.querySelectorAll("thead th[data-column-id]")).toHaveLength(3);
    expect([...container.querySelectorAll("thead th[data-column-id]")].map(th => th.getAttribute("scope"))).toEqual(["col", "col", "col"]);
    const selectionHeader = container.querySelector('thead th:has([aria-label="Select all rows on this page"])');
    expect(selectionHeader.rowSpan).toBe(2);
    expect(container.querySelectorAll('thead [aria-label="Select all rows on this page"]')).toHaveLength(1);
    expect(container.querySelector('thead th[data-column-id="effort"]').style.top).toBe("40px");
    expect(container.querySelector('thead th[data-group-header]').className).toContain("top-0");
    expect(container.querySelector('tbody td[data-column-id="effort"]')).not.toBeNull();
  });

  it("sorts Effort and Result independently in both directions, keeping zero ahead of null", () => {
    const { container } = mount(<DataTable {...base} />);
    const effort = container.querySelector('button[aria-label="Product & feature parity: Effort"]');
    const result = container.querySelector('button[aria-label="Product & feature parity: Result"]');
    expect(effort).not.toBeNull(); expect(result).not.toBeNull();

    act(() => effort.click());
    expect(container.querySelector('th[data-column-id="effort"]').getAttribute("aria-sort")).toBe("descending");
    expect(visibleIds(container)).toEqual(["Charlie", "Echo", "Delta", "Alpha", "Bravo"]);
    act(() => effort.click());
    expect(container.querySelector('th[data-column-id="effort"]').getAttribute("aria-sort")).toBe("ascending");
    expect(visibleIds(container)).toEqual(["Alpha", "Delta", "Echo", "Charlie", "Bravo"]);

    act(() => result.click());
    expect(container.querySelector('th[data-column-id="result"]').getAttribute("aria-sort")).toBe("descending");
    expect(visibleIds(container)).toEqual(["Charlie", "Delta", "Echo", "Bravo", "Alpha"]);
    act(() => result.click());
    expect(container.querySelector('th[data-column-id="result"]').getAttribute("aria-sort")).toBe("ascending");
    expect(visibleIds(container)).toEqual(["Bravo", "Echo", "Delta", "Charlie", "Alpha"]);
  });

  it("keeps selection, leaf visibility, and pagination on the leaf columns", async () => {
    const change = vi.fn();
    const { container } = mount(<DataTable {...base} pageSize={2} selection={{ selected: [], onChange: change }} />);
    act(() => container.querySelector('thead [aria-label="Select all rows on this page"]').click());
    expect(change).toHaveBeenCalledWith(["a", "b"]);
    expect(container.querySelectorAll("tbody tr[data-row]")).toHaveLength(2);
    expect(container.querySelector('th[data-group-header]').colSpan).toBe(2);

    await act(async () => {
      container.querySelector('[data-slot="dropdown-menu-trigger"]').dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, button: 0 }));
      await Promise.resolve();
    });
    const effortItem = [...document.querySelectorAll('[data-slot="dropdown-menu-checkbox-item"]')].find(item => item.textContent.includes("Effort"));
    expect(effortItem).not.toBeUndefined();
    await act(async () => { effortItem.click(); await Promise.resolve(); });
    expect(container.querySelector('thead th[data-column-id="effort"]')).toBeNull();
    expect(container.querySelector('th[data-group-header]').colSpan).toBe(1);

    act(() => container.querySelector('[aria-label="Next page"]').click());
    expect(visibleIds(container)).toEqual(["Charlie", "Delta"]);
    expect(container.querySelector('thead th[data-column-id="result"]')).not.toBeNull();
  });

  it("keeps the default ungrouped table as one header row with the original labels", () => {
    const { container } = mount(<DataTable {...base} columns={[columns[0], { ...columns[1], group: undefined }]} />);
    expect(container.querySelectorAll("thead tr")).toHaveLength(1);
    expect(container.querySelectorAll("thead [data-group-header]")).toHaveLength(0);
    expect(container.querySelector('thead th[data-column-id="effort"] button').textContent).toContain("Effort");
  });
});
