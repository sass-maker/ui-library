"use client";

import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from "react";

export type ResourceFetcher<T> = (signal: AbortSignal) => Promise<T>;
export interface ResourceOptions<T> {
  initialData?: T;
  isEmpty?: (data: T) => boolean;
  staleTime?: number;
  cacheTime?: number;
  retries?: number;
  retryDelay?: number;
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  /** Opt-in JSON session cache; TTL is independent of staleTime. */
  persist?: { ttl: number };
  client?: ResourceClient;
}
type Snapshot<T> = { data: T | undefined; error: Error | undefined; fetching: boolean; updated: number };
type Entry = {
  snapshot: Snapshot<unknown>; listeners: Set<() => void>;
  controller?: AbortController; promise?: Promise<void>;
  eviction?: ReturnType<typeof setTimeout>; revalidate?: () => Promise<void>;
};
export type ResourceResult<T> = {
  isRevalidating: boolean; retry: () => Promise<void>;
  mutate: (value: T | ((previous: T | undefined) => T)) => void;
} & (
  | { status: "loading"; data: undefined; error: undefined }
  | { status: "success" | "empty"; data: T; error: undefined }
  | { status: "error"; data: T | undefined; error: Error }
);
const blank: Snapshot<unknown> = { data: undefined, error: undefined, fetching: false, updated: 0 };
const storageKey = (key: string) => `saas-maker:resource:${key}`;
const defaultEmpty = (data: unknown) => Array.isArray(data) ? data.length === 0
  : !!data && typeof data === "object" && "items" in data && Array.isArray(data.items) && data.items.length === 0;
function retryable(error: unknown) {
  const status = error && typeof error === "object" && "status" in error ? Number(error.status) : undefined;
  return status !== undefined ? status >= 500 && status < 600 : error instanceof TypeError;
}
function pause(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const abort = () => { clearTimeout(timer); reject(new DOMException("cancelled", "AbortError")); };
    const timer = setTimeout(() => { signal.removeEventListener("abort", abort); resolve(); }, ms);
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) abort();
  });
}
export function createResourceClient() {
  const entries = new Map<string, Entry>();
  function entry<T>(key: string, options: ResourceOptions<T> = {}): Entry {
    let current = entries.get(key);
    if (!current) {
      let snapshot: Snapshot<unknown> = blank;
      if (options.initialData !== undefined) snapshot = { ...blank, data: options.initialData, updated: Date.now() };
      else if (options.persist && typeof window !== "undefined") {
        try {
          const stored = JSON.parse(window.sessionStorage.getItem(storageKey(key)) ?? "null");
          if (stored && Date.now() - stored.updated < options.persist.ttl) snapshot = { ...blank, data: stored.data, updated: stored.updated };
        } catch { /* Storage is optional (private browsing, quota, invalid JSON). */ }
      }
      current = { snapshot, listeners: new Set() };
      entries.set(key, current);
    }
    return current;
  }
  function publish(current: Entry, patch: Partial<Snapshot<unknown>>) {
    current.snapshot = { ...current.snapshot, ...patch };
    for (const listener of current.listeners) listener();
  }
  async function run<T>(key: string, fetcher: ResourceFetcher<T>, options: ResourceOptions<T> = {}) {
    const current = entry(key, options);
    current.revalidate = () => run(key, fetcher, options);
    if (current.promise) return current.promise;
    const controller = new AbortController();
    current.controller = controller;
    publish(current, { fetching: true, error: undefined });
    const work = async () => {
      try {
        let data: T;
        for (let attempt = 0; ; attempt++) {
          try { data = await fetcher(controller.signal); break; }
          catch (error) {
            if (controller.signal.aborted || attempt >= (options.retries ?? 2) || !retryable(error)) throw error;
            await pause((options.retryDelay ?? 500) * 2 ** attempt * (0.75 + Math.random() * 0.5), controller.signal);
          }
        }
        if (controller.signal.aborted) return;
        publish(current, { data, error: undefined, updated: Date.now() });
        if (options.persist && typeof window !== "undefined") {
          try { window.sessionStorage.setItem(storageKey(key), JSON.stringify({ data, updated: current.snapshot.updated })); } catch { /* optional */ }
        }
      } catch (error) {
        if (!controller.signal.aborted) publish(current, { error: error instanceof Error ? error : new Error("request failed") });
      } finally {
        if (current.controller === controller) {
          current.promise = undefined;
          current.controller = undefined;
          publish(current, { fetching: false });
          if (!current.listeners.size) scheduleEviction(key, current, options.cacheTime ?? 300_000);
        }
      }
    };
    // Defer fetcher execution until promise assignment, including synchronous throws.
    current.promise = Promise.resolve().then(work);
    return current.promise;
  }
  function scheduleEviction(key: string, current: Entry, cacheTime: number) {
    clearTimeout(current.eviction);
    if (cacheTime === Infinity) return;
    current.eviction = setTimeout(() => {
      if (!current.listeners.size && !current.promise) entries.delete(key);
    }, cacheTime);
  }
  return {
    entry,
    subscribe(key: string, listener: () => void, cacheTime = 300_000) {
      const current = entry(key);
      clearTimeout(current.eviction);
      current.listeners.add(listener);
      return () => {
        current.listeners.delete(listener);
        if (!current.listeners.size) {
          current.controller?.abort();
          // A replacement subscriber must not dedupe against an aborted request.
          current.promise = undefined;
          current.controller = undefined;
          publish(current, { fetching: false });
          scheduleEviction(key, current, cacheTime);
        }
      };
    },
    run,
    invalidate(key: string) {
      const current = entries.get(key);
      if (current) {
        publish(current, { updated: 0 });
        if (current.listeners.size) void current.revalidate?.();
      }
      if (typeof window !== "undefined") {
        try { window.sessionStorage.removeItem(storageKey(key)); } catch { /* optional */ }
      }
    },
    prefetch: run,
    mutate<T>(key: string, value: T | ((previous: T | undefined) => T)) {
      const current = entry(key);
      current.controller?.abort(); current.controller = undefined; current.promise = undefined;
      if (typeof window !== "undefined") {
        try { window.sessionStorage.removeItem(storageKey(key)); } catch { /* optional */ }
      }
      publish(current, { data: typeof value === "function" ? (value as (previous: T | undefined) => T)(current.snapshot.data as T | undefined) : value, error: undefined, fetching: false, updated: Date.now() });
    },
  };
}
export type ResourceClient = ReturnType<typeof createResourceClient>;
export const resourceClient = createResourceClient();
export const invalidate = resourceClient.invalidate;
export const prefetch = resourceClient.prefetch;

export function useResource<T>(key: string, fetcher: ResourceFetcher<T>, options: ResourceOptions<T> = {}): ResourceResult<T> {
  const client = options.client ?? resourceClient;
  const latest = useRef({ fetcher, options });
  useEffect(() => { latest.current = { fetcher, options }; });
  const current = client.entry(key, options);
  const serverSnapshot = useMemo<Snapshot<T>>(() => ({ data: options.initialData, error: undefined, fetching: false, updated: 0 }), [key, options.initialData]);
  const subscribe = useCallback((listener: () => void) => client.subscribe(key, listener, options.cacheTime), [client, key, options.cacheTime]);
  const snapshot = useSyncExternalStore(subscribe, () => current.snapshot as Snapshot<T>, () => serverSnapshot);
  const retry = useCallback(() => client.run(key, latest.current.fetcher, latest.current.options), [client, key]);
  useEffect(() => {
    const revalidate = () => {
      if (Date.now() - client.entry(key).snapshot.updated >= (latest.current.options.staleTime ?? 30_000)) void retry();
    };
    revalidate();
    const focus = () => { if (latest.current.options.revalidateOnFocus !== false) revalidate(); };
    const online = () => { if (latest.current.options.revalidateOnReconnect !== false) revalidate(); };
    window.addEventListener("focus", focus); window.addEventListener("online", online);
    return () => { window.removeEventListener("focus", focus); window.removeEventListener("online", online); };
  }, [client, key, retry]);
  const mutate = useCallback((value: T | ((previous: T | undefined) => T)) => client.mutate(key, value), [client, key]);
  const common = { retry, mutate, isRevalidating: snapshot.fetching && snapshot.data !== undefined };
  if (snapshot.error) return { ...common, status: "error", data: snapshot.data, error: snapshot.error };
  if (snapshot.data === undefined) return { ...common, status: "loading", data: undefined, error: undefined };
  return { ...common, status: (options.isEmpty ?? defaultEmpty)(snapshot.data) ? "empty" : "success", data: snapshot.data, error: undefined };
}
