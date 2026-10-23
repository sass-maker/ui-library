/** Adapted from magicuidesign/magicui (efe76fc5755eca1142dd4f74c1d6f0ace2887e3c).
 * https://github.com/magicuidesign/magicui/blob/efe76fc5755eca1142dd4f74c1d6f0ace2887e3c/apps/www/registry/magicui/number-ticker.tsx
 * MIT; original copyright and permission notice in THIRD_PARTY_NOTICES.md.
 * Fleet changes: semantic tokens, framework-independent imports, and isolated demos.
 */
"use client"

import { useEffect, useRef, type ComponentPropsWithoutRef } from "react"
import { useInView, useMotionValue, useSpring } from "motion/react"

import { useReducedMotion } from "../lib/use-reduced-motion"
import { cn } from "../lib/utils"

interface NumberTickerProps extends ComponentPropsWithoutRef<"span"> {
  value: number
  startValue?: number
  direction?: "up" | "down"
  delay?: number
  decimalPlaces?: number
}

export function NumberTicker({
  value,
  startValue = 0,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
  ...props
}: NumberTickerProps) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(direction === "down" ? value : startValue)
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  })
  const isInView = useInView(ref, { once: true, margin: "0px" })

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null

    if (reduced) {
      springValue.jump(direction === "down" ? startValue : value)
      if(ref.current) ref.current.textContent = Intl.NumberFormat("en-US",{minimumFractionDigits:decimalPlaces,maximumFractionDigits:decimalPlaces}).format(direction === "down" ? startValue : value)
      return
    }
    if (isInView) {
      timer = setTimeout(() => {
        motionValue.set(direction === "down" ? startValue : value)
      }, delay * 1000)
    }

    return () => {
      if (timer !== null) {
        clearTimeout(timer)
      }
    }
  }, [motionValue, springValue, isInView, delay, value, direction, startValue, reduced, decimalPlaces])

  useEffect(
    () =>
      springValue.on("change", (latest) => {
        if (ref.current) {
          ref.current.textContent = Intl.NumberFormat("en-US", {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
          }).format(Number(latest.toFixed(decimalPlaces)))
        }
      }),
    [springValue, decimalPlaces]
  )

  return (
    <span
      ref={ref}
      className={cn(
        "inline-block text-foreground tabular-nums",
        className
      )}
      {...props}
    >
      {reduced ? (direction === "down" ? startValue : value).toLocaleString("en-US", {minimumFractionDigits:decimalPlaces,maximumFractionDigits:decimalPlaces}) : startValue}
    </span>
  )
}
