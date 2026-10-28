// @vitest-environment happy-dom
import React, { act, createRef } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NativeSelect, NativeDisclosure, NativeSummary, NativeDialog, NativeProgress, NativeInput } from "../src/components/native-controls";
import { Button } from "../src/components/button";
import { Textarea } from "../src/components/textarea";
import { Table, TableBody, TableCell, TableRow } from "../src/components/table";
import { createNativeControl, createUiControl } from "../src/lib/dom-controls";

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
afterEach(() => {
  for (const { root, container } of roots.splice(0)) { act(() => root.unmount()); container.remove(); }
});

describe("native React controls", () => {
  it("retains native progress max/value and indeterminate semantics", () => {
    const ref = createRef();
    const container = mount(<><NativeProgress ref={ref} max={500} value={125} aria-label="Coverage" /><NativeProgress /></>);
    expect(ref.current).toBeInstanceOf(HTMLProgressElement);
    expect(ref.current.max).toBe(500);
    expect(ref.current.value).toBe(125);
    expect(ref.current.position).toBe(.25);
    expect(container.querySelectorAll("progress")[1].hasAttribute("value")).toBe(false);
  });
  it("retains native dialog refs, modal methods and close events", () => {
    const ref = createRef();
    const closed = vi.fn();
    mount(<NativeDialog ref={ref} onClose={closed}><form method="dialog"><button value="done">Done</button></form></NativeDialog>);
    expect(ref.current).toBeInstanceOf(HTMLDialogElement);
    act(() => ref.current.showModal());
    expect(ref.current.open).toBe(true);
    act(() => ref.current.close("done"));
    expect(ref.current.open).toBe(false);
    expect(ref.current.returnValue).toBe("done");
    expect(closed).toHaveBeenCalledOnce();
    expect(ref.current.querySelector("form").method).toBe("dialog");
  });
  it("preserves select refs, native options, disabled state and change values", () => {
    const ref = createRef();
    const changed = vi.fn();
    const container = mount(<><NativeSelect ref={ref} defaultValue="one" name="project" onChange={e => changed(e.currentTarget.value)}><option value="one">One</option><option value="two">Two</option></NativeSelect><NativeSelect disabled /></>);
    expect(ref.current).toBeInstanceOf(HTMLSelectElement);
    expect(ref.current.value).toBe("one");
    act(() => { ref.current.value = "two"; ref.current.dispatchEvent(new Event("change", { bubbles: true })); });
    expect(changed).toHaveBeenCalledWith("two");
    expect(container.querySelectorAll("select")[1].disabled).toBe(true);
    expect(ref.current.name).toBe("project");
  });
  it("keeps disclosure children/open state and intrinsic checkbox/radio geometry", () => {
    const checkbox = createRef();
    const changed = vi.fn();
    const container = mount(<><NativeDisclosure open><NativeSummary>Evidence</NativeSummary><p>Source detail</p></NativeDisclosure><NativeInput ref={checkbox} type="checkbox" onChange={changed} /><NativeInput type="radio" name="choice" /><NativeInput type="file" accept=".json" /><NativeInput type="hidden" value="id" readOnly /></>);
    expect(container.querySelector("details").open).toBe(true);
    expect(container.querySelector("details").firstElementChild.tagName).toBe("SUMMARY");
    for (const input of container.querySelectorAll('[type="checkbox"], [type="radio"]')) {
      expect(input.className).toContain("size-4");
      expect(input.className).not.toContain("w-full");
      expect(input.className).not.toContain("min-h-11");
    }
    act(() => checkbox.current.click());
    expect(checkbox.current.checked).toBe(true);
    expect(changed).toHaveBeenCalledOnce();
    expect(container.querySelector('[type="file"]').accept).toBe(".json");
    expect(container.querySelector('[type="hidden"]').className).toBe("");
  });
});

describe("imperative native constructors", () => {
  it("shares the real styles of React components, including table parts", () => {
    const container = mount(<><Button variant="outline" size="sm">Save</Button><NativeSelect /><NativeInput type="checkbox" /><Textarea /><NativeDialog /><NativeDisclosure /><NativeSummary /><NativeProgress /><Table><TableBody><TableRow><TableCell /></TableRow></TableBody></Table></>);
    const matches = [["button", { variant: "outline", size: "sm" }], ["select"], ["input"], ["textarea"], ["dialog"], ["details"], ["summary"], ["progress"], ["table"], ["tbody"], ["tr"], ["td"]];
    for (const [tag, options] of matches) {
      const attrs = tag === "input" ? { type: "checkbox" } : {};
      expect(createUiControl(tag, attrs, [], options).className).toBe(container.querySelector(tag).className);
    }
  });
  it("preserves attrs, children, native events, form defaults and disabled clicks", () => {
    const child = document.createElement("strong");
    child.textContent = "Save";
    const button = createUiControl("button", { class: "custom", name: "intent", value: "save", "aria-expanded": false }, [child, 0]);
    expect(button.type).toBe("submit");
    expect(button.value).toBe("save");
    expect(button.firstChild).toBe(child);
    expect(button.textContent).toBe("Save0");
    expect(button.className).toContain("custom");
    expect(button.getAttribute("aria-expanded")).toBe("false");
    const clicked = vi.fn();
    button.addEventListener("click", clicked);
    button.click();
    expect(clicked).toHaveBeenCalledOnce();
    const disabled = createUiControl("button", { disabled: "" });
    disabled.addEventListener("click", clicked);
    disabled.click();
    expect(disabled.disabled).toBe(true);
    expect(clicked).toHaveBeenCalledOnce();
    const checkbox = createUiControl("input", { type: "checkbox", checked: true, disabled: false });
    expect(checkbox.checked).toBe(true);
    expect(checkbox.disabled).toBe(false);
    const changed = vi.fn();
    checkbox.addEventListener("change", changed);
    document.body.append(checkbox);
    checkbox.click();
    expect(checkbox.checked).toBe(false);
    expect(changed).toHaveBeenCalledOnce();
    checkbox.remove();
    const progress = createUiControl("progress", { max: 400, value: 100 });
    expect(progress.max).toBe(400);
    expect(progress.value).toBe(100);
  });
  it("uses an explicit owner document and rejects layout/tag stamping", () => {
    const other = document.implementation.createHTMLDocument("frame");
    const select = createNativeControl(other, "select", { id: "filter" }, []);
    expect(select.ownerDocument).toBe(other);
    expect(select.id).toBe("filter");
    expect(() => createUiControl("div")).toThrow("Unsupported UI control");
    expect(() => createUiControl("span")).toThrow("Unsupported UI control");
    expect(() => createUiControl("script")).toThrow("Unsupported UI control");
  });
});
