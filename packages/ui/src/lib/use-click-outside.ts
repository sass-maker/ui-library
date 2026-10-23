"use client";

import { useEffect, useRef, type RefObject } from "react";

/** Outside-pointer helper for nonmodal disclosures. Modal focus belongs to Radix. */
export default function useClickOutside<T extends HTMLElement>(ref: RefObject<T | null>, callback: () => void) {
  const latest = useRef(callback);
  useEffect(() => { latest.current = callback; }, [callback]);
  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      if (ref.current && !event.composedPath().includes(ref.current)) latest.current();
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [ref]);
}
