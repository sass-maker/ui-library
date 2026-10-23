// @vitest-environment happy-dom
import React, { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WorkspaceSettings } from "../src/organisms/workspace-settings";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const roots = [];
const initial = { name: "Kith Studio", email: "hello@example.com", releaseNotifications: true, weeklyDigest: false, securityAlerts: true };

function mount(node) {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  roots.push({ root, container });
  act(() => root.render(node));
  return container;
}
const button = (container, text) => [...container.querySelectorAll("button")].find(node => node.textContent === text);
const submit = container => act(() => container.querySelector("form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));

function SharedDraft({ onSave }) {
  const [value, setValue] = useState(initial);
  return <>
    <button onClick={() => setValue({ ...value, name: "" })}>Clear shared name</button>
    <button onClick={() => setValue({ ...value, name: "  A considered workspace  ", email: " hello@example.com " })}>Change shared name</button>
    <button onClick={() => setValue({ ...value, name: "A newer draft" })}>Change while saving</button>
    <WorkspaceSettings value={value} onValuesChange={setValue} onSave={onSave} />
  </>;
}

beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
  vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
});
afterEach(() => {
  for (const { root, container } of roots.splice(0)) { act(() => root.unmount()); container.remove(); }
  vi.unstubAllGlobals();
});

describe("shared workspace draft", () => {
  it("validates shared edits, focuses the invalid field, and clears errors when another layer corrects it", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const container = mount(<SharedDraft onSave={save} />);
    act(() => button(container, "Clear shared name").click());
    submit(container);
    expect(save).not.toHaveBeenCalled();
    expect(container.querySelector("input[name=workspaceName]").getAttribute("aria-invalid")).toBe("true");
    expect(document.activeElement).toBe(container.querySelector("input[name=workspaceName]"));
    act(() => button(container, "Change shared name").click());
    expect(container.querySelector("input[name=workspaceName]").getAttribute("aria-invalid")).not.toBe("true");
    await act(async () => submit(container));
    expect(save).toHaveBeenCalledWith({ ...initial, name: "A considered workspace" });
    expect(container.querySelector("input[name=workspaceName]").value).toBe("A considered workspace");
    expect(container.querySelector("input[name=email]").value).toBe(initial.email);
  });

  it("preserves a newer shared draft when an older save resolves, then discards to what was actually saved", async () => {
    let resolve;
    const container = mount(<SharedDraft onSave={() => new Promise(done => { resolve = done; })} />);
    act(() => button(container, "Change shared name").click());
    submit(container);
    act(() => button(container, "Change while saving").click());
    await act(async () => resolve());
    expect(container.querySelector("input[name=workspaceName]").value).toBe("A newer draft");
    expect(container.textContent).toContain("Unsaved changes");
    expect(container.textContent).not.toContain("All changes saved.");
    act(() => button(container, "Discard").click());
    expect(container.querySelector("input[name=workspaceName]").value).toBe("A considered workspace");
    expect(container.textContent).not.toContain("Unsaved changes");
  });

  it("discards invalid edits without leaving error styling behind", () => {
    const container = mount(<SharedDraft onSave={vi.fn()} />);
    act(() => button(container, "Clear shared name").click());
    submit(container);
    act(() => button(container, "Discard").click());
    expect(container.querySelector("input[name=workspaceName]").value).toBe(initial.name);
    expect(container.querySelector("[aria-invalid=true]")).toBeNull();
    expect(container.querySelector('button[type=submit]').disabled).toBe(true);
  });
});

