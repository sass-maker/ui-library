/** Adapted from ibelick/motion-primitives (120f64f6ca60348e251f929e9c81f11ccbe45eda).
 * https://github.com/ibelick/motion-primitives/blob/120f64f6ca60348e251f929e9c81f11ccbe45eda/components/core/text-morph.tsx
 * MIT; original copyright and permission notice in THIRD_PARTY_NOTICES.md.
 * Fleet changes: semantic tokens, framework-independent imports, and isolated demos.
 */
'use client';
import { cn } from '../lib/utils';
import { useReducedMotion } from '../lib/use-reduced-motion';
import { motionTiming } from '../lib/motion';
import { AnimatePresence, motion, Transition, Variants } from 'motion/react';
import { useMemo, useId } from 'react';

export type TextMorphProps = {
  children: string;
  as?: React.ElementType;
  className?: string;
  style?: React.CSSProperties;
  variants?: Variants;
  transition?: Transition;
};

export function TextMorph({
  children,
  as: Component = 'p',
  className,
  style,
  variants,
  transition,
}: TextMorphProps) {
  const uniqueId = useId();
  const reduced = useReducedMotion();

  const characters = useMemo(() => {
    const charCounts: Record<string, number> = {};

    return children.split('').map((char) => {
      const lowerChar = char.toLowerCase();
      charCounts[lowerChar] = (charCounts[lowerChar] || 0) + 1;

      return {
        id: `${uniqueId}-${lowerChar}${charCounts[lowerChar]}`,
        label: char === ' ' ? '\u00A0' : char,
      };
    });
  }, [children, uniqueId]);

  const defaultVariants: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const defaultTransition: Transition = {
    type: 'spring',
    stiffness: 280,
    damping: 18,
    mass: 0.3,
  };

  return (
    <Component className={cn(className)} style={style}>
      <span className='sr-only'>{children}</span>
      <AnimatePresence mode='popLayout' initial={false}>
        {characters.map((character) => (
          <motion.span
            key={character.id}
            layoutId={reduced ? undefined : character.id}
            className='inline-block'
            aria-hidden='true'
            initial='initial'
            animate='animate'
            exit='exit'
            variants={reduced ? defaultVariants : variants || defaultVariants}
            transition={reduced ? motionTiming.feedback : transition || defaultTransition}
          >
            {character.label}
          </motion.span>
        ))}
      </AnimatePresence>
    </Component>
  );
}
