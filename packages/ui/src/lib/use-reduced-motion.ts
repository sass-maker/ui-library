"use client";

import { createContext, createElement, useContext, useSyncExternalStore, type ReactNode } from "react";

const Preference = createContext<boolean | undefined>(undefined);
const query = "(prefers-reduced-motion: reduce)";
const subscribe = (notify: () => void) => {
  const media = window.matchMedia(query);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};
const snapshot = () => window.matchMedia(query).matches;
const serverSnapshot = () => true;

/** Optional explicit preference for previews or an application's motion settings. */
export function ReducedMotionProvider({ reduced, children }: { reduced?: boolean; children: ReactNode }) {
  return createElement(Preference.Provider, { value: reduced }, children);
}

/** Follows live OS changes; server rendering always starts with the static state. */
export function useReducedMotion() {
  const override = useContext(Preference);
  const system = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  return override ?? system;
}
