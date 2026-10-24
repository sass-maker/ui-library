// @vitest-environment happy-dom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { CopyButton } from "../src/recipes/copy-button";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const roots = [];
let descriptor;
beforeEach(() => {
  descriptor = Object.getOwnPropertyDescriptor(navigator, "clipboard");
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
});
afterEach(() => {
  for (const { root, container } of roots.splice(0)) { act(() => root.unmount()); container.remove(); }
  if (descriptor) Object.defineProperty(navigator, "clipboard", descriptor);
  else delete navigator.clipboard;
  vi.unstubAllGlobals();
});
function mount(writeText, onCopy = vi.fn()) {
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  roots.push({ root, container });
  act(() => root.render(<CopyButton value="Complete product source" onCopy={onCopy} />));
  return { button: container.querySelector("button"), status: () => container.querySelector("[aria-live]").textContent };
}

it("acknowledges a pending copy without reporting completion", async () => {
  let resolve;
  const onCopy = vi.fn();
  const ui = mount(() => new Promise(done => { resolve = done; }), onCopy);
  act(() => ui.button.click());
  expect(ui.status()).toBe("Copying…");
  expect(onCopy).not.toHaveBeenCalled();
  await act(async () => resolve());
  expect(ui.status()).toBe("Copied");
  expect(onCopy).toHaveBeenCalledWith("Complete product source");
});

it("reports denied clipboard access and allows a successful retry", async () => {
  const onCopy = vi.fn();
  const ui = mount(vi.fn().mockRejectedValueOnce(new Error("Permission denied")).mockResolvedValueOnce(undefined), onCopy);
  await act(async () => ui.button.click());
  expect(ui.status()).toBe("Couldn't copy");
  expect(onCopy).not.toHaveBeenCalled();
  await act(async () => ui.button.click());
  expect(ui.status()).toBe("Copied");
  expect(onCopy).toHaveBeenCalledOnce();
});

it("does not let an older write overwrite the latest failed attempt", async () => {
  const jobs = [];
  const onCopy = vi.fn();
  const ui = mount(() => new Promise((resolve, reject) => jobs.push({ resolve, reject })), onCopy);
  act(() => ui.button.click());
  act(() => ui.button.click());
  await act(async () => jobs[1].reject(new Error("Permission denied")));
  await act(async () => jobs[0].resolve());
  expect(ui.status()).toBe("Couldn't copy");
  expect(onCopy).not.toHaveBeenCalled();
});
