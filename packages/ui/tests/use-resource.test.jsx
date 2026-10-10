// @vitest-environment happy-dom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createResourceClient, useResource } from "../src/lib/use-resource";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const roots = [];
afterEach(async () => { await act(async () => { for (const root of roots.splice(0)) root.unmount(); }); vi.useRealTimers(); vi.restoreAllMocks(); });
function mount(client, fetcher, options = {}, key = "items") {
  let result;
  function App() { result = useResource(key, fetcher, { client, ...options }); return <div>{result.status}</div>; }
  const root = createRoot(document.createElement("div")); roots.push(root);
  return { get result() { return result; }, render: () => act(async () => root.render(<App />)), unmount: () => act(async () => { root.unmount(); roots.splice(roots.indexOf(root), 1); }) };
}
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
describe("useResource", () => {
  it("dedupes subscribers and serves a fresh cache on revisit", async () => {
    const client = createResourceClient(), pending = deferred(), fetcher = vi.fn(() => pending.promise);
    const a = mount(client, fetcher), b = mount(client, fetcher);
    await a.render(); await b.render(); expect(fetcher).toHaveBeenCalledTimes(1);
    await act(async () => pending.resolve(["record"])); expect(a.result.data).toEqual(["record"]);
    await a.unmount(); await b.unmount(); const revisit = mount(client, fetcher); await revisit.render();
    expect(revisit.result.status).toBe("success"); expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("shows stale data while revalidating and responds to invalidation", async () => {
    const client = createResourceClient(); await client.prefetch("items", async () => ["old"]);
    const pending = deferred(), view = mount(client, () => pending.promise, { staleTime: 0 }); await view.render();
    expect(view.result.data).toEqual(["old"]); expect(view.result.isRevalidating).toBe(true);
    await act(async () => pending.resolve(["new"])); expect(view.result.data).toEqual(["new"]);
    await act(async () => client.invalidate("items")); expect(client.entry("items").snapshot.updated).toBeGreaterThan(0);
  });
  it("aborts only when the last subscriber leaves and aborts on key change", async () => {
    const client = createResourceClient(); let signal;
    const fetcher = s => { signal = s; return new Promise(() => {}); };
    const a = mount(client, fetcher), b = mount(client, fetcher); await a.render(); await b.render();
    await a.unmount(); expect(signal.aborted).toBe(false); await b.unmount(); expect(signal.aborted).toBe(true);
    let key = "a", signals = [];
    function App() { useResource(key, s => { signals.push(s); return new Promise(() => {}); }, { client }); return null; }
    const root = createRoot(document.createElement("div")); roots.push(root);
    await act(async () => root.render(<App />)); key = "b"; await act(async () => root.render(<App />));
    expect(signals[0].aborted).toBe(true); expect(signals[1].aborted).toBe(false);
  });
  it("retries network/5xx with exponential jittered backoff", async () => {
    vi.useFakeTimers(); vi.spyOn(Math, "random").mockReturnValue(0.5);
    const fetcher = vi.fn().mockRejectedValueOnce(new TypeError("network")).mockRejectedValueOnce(Object.assign(new Error("server"), { status: 503 })).mockResolvedValue(["ok"]);
    const view = mount(createResourceClient(), fetcher); await view.render();
    await act(async () => vi.advanceTimersByTimeAsync(499)); expect(fetcher).toHaveBeenCalledTimes(1);
    await act(async () => vi.advanceTimersByTimeAsync(1)); expect(fetcher).toHaveBeenCalledTimes(2);
    await act(async () => vi.advanceTimersByTimeAsync(1000)); expect(fetcher).toHaveBeenCalledTimes(3); expect(view.result.status).toBe("success");
  });
  it("does not retry 4xx, and manual retry recovers", async () => {
    const fetcher = vi.fn().mockRejectedValueOnce(Object.assign(new Error("missing"), { status: 404 })).mockResolvedValue(["ok"]);
    const view = mount(createResourceClient(), fetcher); await view.render(); expect(view.result.status).toBe("error"); expect(fetcher).toHaveBeenCalledTimes(1);
    await act(async () => view.result.retry()); expect(view.result.status).toBe("success");
  });
  it("detects empty collections and supports custom emptiness and mutate", async () => {
    for (const value of [[], { items: [] }]) { const view = mount(createResourceClient(), async () => value); await view.render(); expect(view.result.status).toBe("empty"); }
    const view = mount(createResourceClient(), async () => "", { isEmpty: value => !value }); await view.render(); expect(view.result.status).toBe("empty");
    await act(async () => view.result.mutate("ready")); expect(view.result.data).toBe("ready");
  });
  it("renders initialData on the server without fetching", () => {
    const fetcher = vi.fn(); function App() { const resource = useResource("ssr", fetcher, { initialData: ["server"], client: createResourceClient() }); return <div>{resource.data[0]}</div>; }
    expect(renderToString(<App />)).toContain("server"); expect(fetcher).not.toHaveBeenCalled();
  });
  it("persists with TTL, tolerates storage failures, and expires unused memory", async () => {
    vi.useFakeTimers(); const first = createResourceClient(); await first.prefetch("persisted", async () => ["saved"], { persist: { ttl: 1000 } });
    expect(createResourceClient().entry("persisted", { persist: { ttl: 1000 } }).snapshot.data).toEqual(["saved"]);
    await vi.advanceTimersByTimeAsync(1001); expect(createResourceClient().entry("persisted", { persist: { ttl: 1000 } }).snapshot.data).toBeUndefined();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
    await first.prefetch("blocked", async () => ["ok"], { persist: { ttl: 1000 }, cacheTime: 10 });
    expect(first.entry("blocked").snapshot.data).toEqual(["ok"]); await vi.advanceTimersByTimeAsync(10); expect(first.entry("blocked").snapshot.data).toBeUndefined();
  });
  it("revalidates stale resources on focus/reconnect, with opt-outs", async () => {
    const fetcher = vi.fn(async () => ["ok"]), view = mount(createResourceClient(), fetcher, { staleTime: 0 }); await view.render();
    await act(async () => window.dispatchEvent(new Event("focus"))); await act(async () => window.dispatchEvent(new Event("online"))); expect(fetcher).toHaveBeenCalledTimes(3);
    const off = vi.fn(async () => ["ok"]), other = mount(createResourceClient(), off, { staleTime: 0, revalidateOnFocus: false, revalidateOnReconnect: false }); await other.render();
    await act(async () => window.dispatchEvent(new Event("focus"))); await act(async () => window.dispatchEvent(new Event("online"))); expect(off).toHaveBeenCalledTimes(1);
  });
});
