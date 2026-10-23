/** Adapted from ibelick/motion-primitives (120f64f6ca60348e251f929e9c81f11ccbe45eda).
 * https://github.com/ibelick/motion-primitives/blob/120f64f6ca60348e251f929e9c81f11ccbe45eda/components/core/animated-background.tsx
 * MIT; original copyright and permission notice in THIRD_PARTY_NOTICES.md.
 * Fleet changes: semantic tokens, framework-independent imports, and isolated demos.
 */
'use client';
import { cn } from '../lib/utils';
import { useReducedMotion } from '../lib/use-reduced-motion';
import { motionTiming } from '../lib/motion';
import { AnimatePresence, Transition, motion } from 'motion/react';
import {
  Children,
  cloneElement,
  ReactElement,
  useEffect,
  useState,
  useId,
  type HTMLAttributes,
} from 'react';

export type AnimatedBackgroundProps = {
  children:
    | ReactElement<HTMLAttributes<HTMLElement> & { 'data-id': string; 'data-checked'?: string }>[]
    | ReactElement<HTMLAttributes<HTMLElement> & { 'data-id': string; 'data-checked'?: string }>;
  defaultValue?: string;
  onValueChange?: (newActiveId: string | null) => void;
  className?: string;
  transition?: Transition;
  enableHover?: boolean;
};

export function AnimatedBackground({
  children,
  defaultValue,
  onValueChange,
  className,
  transition,
  enableHover = false,
}: AnimatedBackgroundProps) {
  const reduced = useReducedMotion();
  const [activeId, setActiveId] = useState<string | null>(defaultValue ?? null);
  const uniqueId = useId();

  const handleSetActiveId = (id: string | null) => {
    setActiveId(id);

    if (onValueChange) {
      onValueChange(id);
    }
  };

  useEffect(() => {
    if (defaultValue !== undefined) {
      setActiveId(defaultValue);
    }
  }, [defaultValue]);

  return Children.map(children, (child, index) => {
    const id = child.props['data-id'];

    const interactionProps = enableHover
      ? {
          onMouseEnter: (event: React.MouseEvent<HTMLElement>) => { child.props.onMouseEnter?.(event); if(!event.defaultPrevented)handleSetActiveId(id); },
          onFocus: (event:React.FocusEvent<HTMLElement>) => { child.props.onFocus?.(event); if(!event.defaultPrevented)handleSetActiveId(id); },
          onMouseLeave: (event:React.MouseEvent<HTMLElement>) => { child.props.onMouseLeave?.(event); if(!event.defaultPrevented)handleSetActiveId(null); },
          onBlur: (event:React.FocusEvent<HTMLElement>) => { child.props.onBlur?.(event); if(!event.defaultPrevented)handleSetActiveId(null); },
        }
      : {
          onClick: (event:React.MouseEvent<HTMLElement>) => { child.props.onClick?.(event); if(!event.defaultPrevented)handleSetActiveId(id); },
        };

    return cloneElement(
      child,
      {
        key: index,
        className: cn('relative inline-flex', child.props.className),
        'data-checked': activeId === id ? 'true' : 'false',
        ...interactionProps,
      },
      <>
        <AnimatePresence initial={false}>
          {activeId === id && (
            <motion.span
              layoutId={reduced ? undefined : `background-${uniqueId}`}
              className={cn('absolute inset-0', className)}
              transition={reduced ? motionTiming.feedback : transition ?? motionTiming.layout}
              initial={{ opacity: defaultValue ? 1 : 0 }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
            />
          )}
        </AnimatePresence>
        <span className='relative z-10'>{child.props.children}</span>
      </>
    );
  });
}
