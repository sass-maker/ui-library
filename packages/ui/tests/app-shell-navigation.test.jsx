// @vitest-environment happy-dom
import React, { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "../src/blocks/app";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const roots = [];
function mount(node) {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  roots.push({ root, container });
  act(() => root.render(node));
  return container;
}
afterEach(async () => {
  for (const { root, container } of roots.splice(0)) { await act(async () => root.unmount()); container.remove(); }
});
const props = { brand: { name: "Site Health" }, nav: [{ title: "Workspace", items: [{ label: "Projects", href: "#projects", active: true, count: 3 }] }] };

describe("AppShell optional navigation", () => {
  it("keeps native popover and full desktop sidebar as the default", () => {
    const container = mount(<AppShell {...props}><button>Product action</button></AppShell>);
    expect(container.firstElementChild.dataset.slot).toBe("app-shell");
    expect(container.querySelector('[data-slot="app-sidebar"]').className).toContain("w-60");
    expect(container.querySelector('[popover="auto"]')).not.toBeNull();
    expect(container.querySelector('[aria-label="Collapse sidebar"]')).toBeNull();
    expect(container.querySelector("main button").hasAttribute("data-slot")).toBe(false);
  });
  it("renders a controlled, accessible desktop icon rail", () => {
    function Harness() {
      const [collapsed, setCollapsed] = useState(false);
      return <AppShell {...props} collapsible collapsed={collapsed} onCollapsedChange={setCollapsed}><p>Content</p></AppShell>;
    }
    const container = mount(<Harness />);
    act(() => container.querySelector('[aria-label="Collapse sidebar"]').click());
    const sidebar = container.querySelector('[data-slot="app-sidebar"]');
    expect(sidebar.dataset.collapsed).toBe("true");
    expect(sidebar.className).toContain("w-16");
    const expand = sidebar.querySelector("button");
    expect(expand.getAttribute("aria-expanded")).toBe("false");
    expect(expand.getAttribute("aria-controls")).toBe(sidebar.id);
    expect(sidebar.querySelector("a").title).toBe("Projects");
    expect(sidebar.querySelector("a span:not([aria-hidden])").className).toBe("sr-only");
    act(() => expand.click());
    expect(sidebar.dataset.collapsed).toBe("false");
  });
  it("uses the shared modal Sheet, closes on routed links, restores focus and dismisses with Escape", async () => {
    const navigate = vi.fn();
    const container = mount(<AppShell {...props} modalNavigation onNavigate={navigate}><button>Product action</button></AppShell>);
    expect(container.querySelector("[popover]")).toBeNull();
    const trigger = container.querySelector('[aria-label="Open navigation"]');
    trigger.focus();
    await act(async () => trigger.click());
    let dialog = document.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(container.closest('[aria-hidden="true"]')).not.toBeNull();
    const modified = new MouseEvent("click", { ctrlKey: true, bubbles: true, cancelable: true });
    await act(async () => dialog.querySelector("a").dispatchEvent(modified));
    expect(modified.defaultPrevented).toBe(false);
    expect(document.querySelector('[role="dialog"]')).toBe(dialog);
    expect(navigate).not.toHaveBeenCalled();
    await act(async () => dialog.querySelector("a").click());
    expect(navigate).toHaveBeenCalledWith("#projects");
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    await vi.waitFor(() => expect(document.activeElement).toBe(trigger));
    await act(async () => trigger.click());
    dialog = document.querySelector('[role="dialog"]');
    await act(async () => dialog.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    await vi.waitFor(() => expect(document.activeElement).toBe(trigger));
  });
});
