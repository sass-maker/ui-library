/** Adapted from ibelick/motion-primitives (120f64f6ca60348e251f929e9c81f11ccbe45eda).
 * https://github.com/ibelick/motion-primitives/blob/120f64f6ca60348e251f929e9c81f11ccbe45eda/components/core/animated-number.tsx
 * MIT; original copyright and permission notice in THIRD_PARTY_NOTICES.md.
 * Fleet changes: semantic tokens, framework-independent imports, and isolated demos.
 */
'use client';
import { cn } from '../lib/utils';
import { motion, SpringOptions, useSpring, useTransform } from 'motion/react';
import { useEffect } from 'react';
import { useReducedMotion } from '../lib/use-reduced-motion';

export type AnimatedNumberProps = {
  value: number;
  className?: string;
  springOptions?: SpringOptions;
  as?: "span" | "p" | "div";
};

export function AnimatedNumber({
  value,
  className,
  springOptions,
  as = 'span',
}: AnimatedNumberProps) {
  const MotionComponent = as === "div" ? motion.div : as === "p" ? motion.p : motion.span;
  const reduced = useReducedMotion();

  const spring = useSpring(value, springOptions);
  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString()
  );

  useEffect(() => {
    if (reduced) spring.jump(value); else spring.set(value);
  }, [spring, value, reduced]);

  return (
    <MotionComponent className={cn('tabular-nums', className)}>
      {display}
    </MotionComponent>
  );
}
