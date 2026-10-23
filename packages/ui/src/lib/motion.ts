import type { Transition } from "motion/react";

/** Shared timing for interface motion. Fast feedback; a softer settle for layout. */
export const motionTiming = {
  feedback: { duration: 0.14, ease: [0.2, 0, 0, 1] },
  content: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
  layout: { type: "spring", visualDuration: 0.28, bounce: 0 },
  exit: { duration: 0.14, ease: [0.4, 0, 1, 1] },
} satisfies Record<string, Transition>;
