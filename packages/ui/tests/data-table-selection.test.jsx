// @vitest-environment happy-dom
import React, { act, Profiler } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DataTable } from "../src/components/data-table";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const roots = [];
const data = Array.from({ length: 65 }, (_, i) => ({ id: String(i), name: `Record ${i}` }));
const columns = [{ id: "name", header: "name", value: row => row.name }];
const base = { data, columns, getRowId: row => row.id, label: "records" };
function mount(node, hydrate = false) {
  const container = document.createElement("div"); document.body.append(container);
  if (hydrate) container.innerHTML = renderToString(node);
  let root;
  act(() => { root = hydrate ? hydrateRoot(container, node) : createRoot(container); if (!hydrate) root.render(node); });
  roots.push({ root, container });
  return { container, update: node => act(() => root.render(node)) };
}
afterEach(() => { for (const { root, container } of roots.splice(0)) { act(() => root.unmount()); container.remove(); } });
const checks = container => [...container.querySelectorAll('tbody [role="checkbox"]')];

describe("controlled DataTable selection", () => {
  it("lets nested cell controls own their keys while retaining row navigation", () => {
    const open = vi.fn();
    const { container } = mount(<DataTable {...base} data={data.slice(0, 2)} onRowClick={open}
      columns={[{ ...columns[0], cell: row => <input aria-label={`Edit ${row.name}`} defaultValue={row.name} /> }]} />);
    const rows = container.querySelectorAll("tr[data-row]");
    const input = rows[0].querySelector("input");
    act(() => input.click());
    expect(open).not.toHaveBeenCalled();
    act(() => input.focus());
    for (const key of ["ArrowDown", "Home", "End", "Enter", " "]) {
      const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
      act(() => input.dispatchEvent(event));
      expect(event.defaultPrevented).toBe(false);
      expect(document.activeElement).toBe(input);
    }
    expect(open).not.toHaveBeenCalled();
    act(() => { rows[0].focus(); rows[0].dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })); });
    expect(open).toHaveBeenCalledWith(data[0]);
    act(() => rows[0].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })));
    expect(document.activeElement).toBe(rows[1]);
  });
  it("hydrates all 50 rows without selection form-bridge update commits", () => {
    const commits = []; const errors = vi.spyOn(console, "error");
    const { container } = mount(<Profiler id="table" onRender={(_, phase) => commits.push(phase)}><DataTable {...base} selection={{ selected: ["2"], onChange: vi.fn() }} /></Profiler>, true);
    expect(container.querySelectorAll("tr[data-row]")).toHaveLength(50);
    expect(checks(container)).toHaveLength(50);
    expect(checks(container)[2].getAttribute("aria-checked")).toBe("true");
    expect(container.querySelectorAll("input")).toHaveLength(0);
    // The table's pagination reset may commit once; each checkbox must not schedule ref updates.
    expect(commits.filter(phase => phase === "nested-update").length).toBeLessThanOrEqual(1);
    expect(errors).not.toHaveBeenCalled(); errors.mockRestore();
  });
  it("keeps current controlled ids, callbacks, labels, cap and row-click isolation", () => {
    const first = vi.fn(), next = vi.fn(), limit = vi.fn(), open = vi.fn();
    const view = selection => <DataTable {...base} onRowClick={open} selection={selection} />;
    const { container, update } = mount(view({ selected: [], onChange: first, max: 1, rowLabel: row => row.name }));
    act(() => checks(container)[0].click()); expect(first).toHaveBeenLastCalledWith(["0"]); expect(open).not.toHaveBeenCalled();
    expect(checks(container)[0].getAttribute("aria-checked")).toBe("false"); // parent controls state
    update(view({ selected: ["0"], onChange: next, max: 1, onLimit: limit, rowLabel: row => `Current ${row.name}` }));
    expect(checks(container)[1].getAttribute("aria-disabled")).toBe("true");
    expect(checks(container)[1].getAttribute("aria-label")).toBe("Select Current Record 1");
    act(() => checks(container)[1].click()); expect(limit).toHaveBeenCalledWith(data[1]); expect(next).not.toHaveBeenCalled();
    act(() => checks(container)[0].click()); expect(next).toHaveBeenLastCalledWith([]); expect(open).not.toHaveBeenCalled();
    const enter = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
    act(() => checks(container)[0].dispatchEvent(enter)); expect(enter.defaultPrevented).toBe(true);
    expect(open).not.toHaveBeenCalled();
  });
  it("selects/deselects the current page, retains off-page ids and shows mixed state", () => {
    const change = vi.fn();
    const view = selected => <DataTable {...base} selection={{ selected, onChange: change }} />;
    const { container, update } = mount(view(["64", "0"]));
    let all = container.querySelector('thead [role="checkbox"]'); expect(all.getAttribute("aria-checked")).toBe("mixed");
    act(() => all.click()); expect(change).toHaveBeenLastCalledWith(["64", "0", ...data.slice(1, 50).map(row => row.id)]);
    update(view(["64", ...data.slice(0, 50).map(row => row.id)])); all = container.querySelector('thead [role="checkbox"]');
    expect(all.getAttribute("aria-checked")).toBe("true"); act(() => all.click()); expect(change).toHaveBeenLastCalledWith(["64"]);
    update(<DataTable {...base} data={[]} selection={{ selected: [], onChange: change }} />);
    expect(container.querySelector('thead [role="checkbox"]').disabled).toBe(true);
  });
  it("retains Radix form event bridging for tables embedded in a form", () => {
    const change = vi.fn(), formClick = vi.fn();
    const { container } = mount(<form onClick={formClick}><DataTable {...base} selection={{ selected: [], onChange: change }} /></form>);
    expect(container.querySelectorAll('input[type="checkbox"]')).toHaveLength(51);
    act(() => checks(container)[0].click()); expect(change).toHaveBeenCalledWith(["0"]);
    expect(formClick).not.toHaveBeenCalled(); // row selection cell still stops propagation
  });
  it("resets the initial hydration selection after a parent layout update", () => {
    const change = vi.fn();
    function Parent() {
      const [selected, setSelected] = React.useState([]);
      React.useLayoutEffect(() => setSelected(["1"]), []);
      return <form><DataTable {...base} selection={{ selected, max: 3, onChange: ids => { change(ids); setSelected(ids); } }} /></form>;
    }
    const { container } = mount(<Parent />, true);
    expect(container.querySelectorAll("tr[data-row]")).toHaveLength(50);
    expect(checks(container)[1].getAttribute("aria-checked")).toBe("true");
    act(() => container.querySelector("form").reset());
    expect(change).toHaveBeenLastCalledWith([]);
    expect(checks(container)[1].getAttribute("aria-checked")).toBe("false");
    expect(container.querySelectorAll("tr[data-row]")).toHaveLength(50);
    change.mockClear();
    act(() => container.querySelector("form").reset());
    expect(change).not.toHaveBeenCalled();
    act(() => checks(container)[1].click());
    expect(change).toHaveBeenLastCalledWith(["1"]);
    act(() => container.querySelector("form").reset());
    expect(change).toHaveBeenLastCalledWith([]);
  });

});
