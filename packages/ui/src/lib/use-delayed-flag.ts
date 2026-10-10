"use client"

import { useEffect, useState } from "react"

/** Skip fast flashes; cap the delay so a slow response shows feedback within 300ms. */
export function useDelayedFlag(flag: boolean, delay = 150): boolean {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (!flag) { setReady(false); return }
    const timer = setTimeout(() => setReady(true), Math.min(300, Math.max(0, delay)))
    return () => clearTimeout(timer)
  }, [flag, delay])
  return flag && ready
}
