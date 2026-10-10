// @vitest-environment happy-dom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Skeleton, SkeletonAvatar, SkeletonBlock, SkeletonText } from "../src/components/skeleton";
import { DataTable, DataTableSkeleton } from "../src/components/data-table";
import { CardGridSkeleton, QuoteListSkeleton, ConsolePageSkeleton } from "../src/blocks/skeletons";
import { ErrorState } from "../src/components/error-state";
import { ResourceBoundary } from "../src/blocks/resource-boundary";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const roots = [];
function mount(node) {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  roots.push({ root, container });
  act(() => root.render(node));
  return { container, update: node => act(() => root.render(node)) };
}
afterEach(() => {
  for (const { root, container } of roots.splice(0)) { act(() => root.unmount()); container.remove(); }
  vi.useRealTimers();
});
function markup(node) {
  const container = document.createElement("div");
  container.innerHTML = renderToStaticMarkup(node);
  return container;
}

describe("loading skeletons", () => {
  it("announces once per container and keeps bones decorative", () => {
    for (const element of [<SkeletonText lines={3} />, <SkeletonAvatar />, <SkeletonBlock />, <CardGridSkeleton count={3} />, <QuoteListSkeleton />, <ConsolePageSkeleton />]) {
      const container = markup(element);
      expect(container.querySelectorAll('[role="status"]')).toHaveLength(1);
      expect(container.querySelector('[role="status"]').getAttribute("aria-busy")).toBe("true");
      expect(container.querySelector('[role="status"] .sr-only').textContent).toBe("loading");
      expect([...container.querySelectorAll('[data-slot="skeleton"]')].every(bone => bone.getAttribute("aria-hidden") === "true")).toBe(true);
    }
  });
  it("opts out of motion and reserves an image aspect ratio", () => {
    const bone = markup(<Skeleton />).firstElementChild;
    expect(bone.className).toContain("motion-safe:animate-pulse");
    expect(bone.className).toContain("motion-reduce:animate-none");
    expect(markup(<SkeletonBlock aspectRatio="4 / 3" />).firstElementChild.style.aspectRatio).toBe("4 / 3");
    const lines = markup(<SkeletonText lines={3} />).querySelectorAll('[data-slot="skeleton"]');
    expect(lines).toHaveLength(3);
    expect(lines[2].className).toContain("w-2/3");
  });
  it("uses the same table column widths, header and row geometry for loading", () => {
    const columns = [{ id: "name", header: "name", value: row => row.name, minWidth: "12rem" }, { id: "type", header: "type", value: row => row.type, align: "right" }];
    const standalone = markup(<DataTableSkeleton columns={columns} rows={2} selection />);
    const integrated = markup(<DataTable data={[]} columns={columns} getRowId={row => row.id} label="records" loading skeletonRows={2} />);
    expect(standalone.querySelectorAll("tbody tr")).toHaveLength(2);
    expect(integrated.querySelectorAll("tbody tr")).toHaveLength(2);
    expect(integrated.querySelector("table").getAttribute("aria-busy")).toBe("true");
    expect(integrated.querySelector("th").className).toContain("sticky");
    expect(integrated.querySelector("td").className).toContain("py-2.5");
    expect(integrated.querySelector("td").style.minWidth).toBe("12rem");
    expect(standalone.querySelectorAll("thead th")).toHaveLength(3);
  });
});

describe("resource states", () => {
  it("retries from an alert and escapes safe detail text", () => {
    const retry = vi.fn();
    const { container } = mount(<ErrorState offline onRetry={retry} detail={'<script>unsafe</script>'} />);
    expect(container.querySelector('[role="alert"]')).not.toBeNull();
    expect(container.textContent).toContain("you're offline");
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("details").textContent).toContain("<script>unsafe</script>");
    act(() => container.querySelector("button").click());
    expect(retry).toHaveBeenCalledOnce();
    expect(container.querySelector("button").textContent).toBe("try again");
  });
  it("delays loading, then renders empty, failure, and ready content", () => {
    vi.useFakeTimers();
    const retry = vi.fn(async () => {});
    const resource = { status: "loading", data: undefined, error: undefined, isRevalidating: false, retry };
    const view = state => <ResourceBoundary resource={{ ...resource, ...state }} skeleton={<SkeletonText />}>
      {value => <p data-ready>{value.label}</p>}
    </ResourceBoundary>;
    const { container, update } = mount(view({}));
    expect(container.querySelector('[data-slot="resource-boundary"] > div').style.visibility).toBe("hidden");
    act(() => vi.advanceTimersByTime(149));
    expect(container.querySelector('[data-slot="resource-boundary"] > div').style.visibility).toBe("hidden");
    act(() => vi.advanceTimersByTime(1));
    expect(container.querySelector('[data-slot="resource-boundary"] > div').style.visibility).toBe("visible");
    update(view({ status: "empty", data: [] }));
    expect(container.textContent).toContain("nothing here yet");
    update(view({ status: "empty", data: [], isRevalidating: true }));
    expect(container.textContent).toContain("nothing here yet");
    expect(container.querySelector("[data-ready]")).toBeNull();
    update(view({ status: "error", error: new Error("fail") }));
    expect(container.querySelector('[role="alert"]')).not.toBeNull();
    act(() => container.querySelector("button").click());
    expect(retry).toHaveBeenCalledOnce();
    update(view({ status: "success", data: { label: "ready" } }));
    expect(container.querySelector("[data-ready]").textContent).toBe("ready");
  });
  it("keeps the same stale content node mounted during revalidation and failed updates", () => {
    const resource = { status: "success", data: { label: "cached" }, error: undefined, isRevalidating: false, retry: async () => {} };
    const view = state => <ResourceBoundary resource={{ ...resource, ...state }} skeleton={<SkeletonText />}>
      {value => <p data-ready>{value.label}</p>}
    </ResourceBoundary>;
    const { container, update } = mount(view({}));
    const ready = container.querySelector("[data-ready]");
    update(view({ isRevalidating: true }));
    expect(container.querySelector("[data-ready]")).toBe(ready);
    expect(container.querySelector('[role="status"]').textContent).toBe("updating");
    expect(container.querySelector('[role="status"]').className).toContain("absolute");
    update(view({ status: "error", error: new Error("background fail") }));
    expect(container.querySelector("[data-ready]")).toBe(ready);
    expect(container.querySelector('[role="alert"]').textContent).toContain("try again");
  });
});
