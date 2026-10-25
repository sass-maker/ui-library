/** Adapted from ibelick/motion-primitives (120f64f6ca60348e251f929e9c81f11ccbe45eda).
 * https://github.com/ibelick/motion-primitives/blob/120f64f6ca60348e251f929e9c81f11ccbe45eda/components/core/image-comparison.tsx
 * MIT; original copyright and permission notice in THIRD_PARTY_NOTICES.md.
 * Fleet changes: semantic tokens, framework-independent imports, and isolated demos.
 */
'use client';
import { cn } from '../lib/utils';
import { useState, createContext, useContext } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import {
  motion,
  MotionValue,
  SpringOptions,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';

const ImageComparisonContext = createContext<
  | {
      sliderPosition: number;
      setSliderPosition: (pos: number) => void;
      motionSliderPosition: MotionValue<number>;
    }
  | undefined
>(undefined);

export type ImageComparisonProps = {
  children: React.ReactNode;
  className?: string;
  enableHover?: boolean;
  springOptions?: SpringOptions;
};

const DEFAULT_SPRING_OPTIONS = {
  bounce: 0,
  duration: 0,
};

function ImageComparison({
  children,
  className,
  enableHover,
  springOptions,
}: ImageComparisonProps) {
  const [isDragging, setIsDragging] = useState(false);
  const motionValue = useMotionValue(50);
  const motionSliderPosition = useSpring(
    motionValue,
    springOptions ?? DEFAULT_SPRING_OPTIONS
  );
  const [sliderPosition, setSliderPosition] = useState(50);

  const handleDrag = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging && !enableHover) return;

    const containerRect = (
      event.currentTarget as HTMLElement
    ).getBoundingClientRect();
    const x =
      'touches' in event
        ? event.touches[0].clientX - containerRect.left
        : (event as React.MouseEvent).clientX - containerRect.left;

    const percentage = Math.min(
      Math.max((x / containerRect.width) * 100, 0),
      100
    );
    motionValue.set(percentage);
    setSliderPosition(percentage);
  };

  return (
    <ImageComparisonContext.Provider
      value={{ sliderPosition, setSliderPosition, motionSliderPosition }}
    >
      <div
        className={cn(
          'relative select-none overflow-hidden rounded-xl has-focus-visible:ring-[3px] has-focus-visible:ring-ring',
          enableHover && 'cursor-ew-resize',
          className
        )}
        onMouseMove={handleDrag}
        onMouseDown={() => !enableHover && setIsDragging(true)}
        onMouseUp={() => !enableHover && setIsDragging(false)}
        onMouseLeave={() => !enableHover && setIsDragging(false)}
        onTouchMove={handleDrag}
        onTouchStart={() => !enableHover && setIsDragging(true)}
        onTouchEnd={() => !enableHover && setIsDragging(false)}
      >
        {children}
        <input type="range" aria-label="Compare images" aria-valuetext={`${Math.round(sliderPosition)}% of the comparison revealed`} min={0} max={100} value={sliderPosition}
          onChange={event => { const value=Number(event.currentTarget.value); motionValue.set(value); setSliderPosition(value); }}
          className="absolute inset-0 z-20 m-0 h-full w-full cursor-ew-resize opacity-0" />
      </div>
    </ImageComparisonContext.Provider>
  );
}

const ImageComparisonImage = ({
  className,
  alt,
  src,
  position,
}: {
  className?: string;
  alt: string;
  src: string;
  position: 'left' | 'right';
}) => {
  const { motionSliderPosition } = useContext(ImageComparisonContext)!;
  const leftClipPath = useTransform(
    motionSliderPosition,
    (value) => `inset(0 0 0 ${value}%)`
  );
  const rightClipPath = useTransform(
    motionSliderPosition,
    (value) => `inset(0 ${100 - value}% 0 0)`
  );

  return (
    <motion.img
      src={src}
      alt={alt}
      className={cn('absolute inset-0 h-full w-full object-cover', className)}
      style={{
        clipPath: position === 'left' ? leftClipPath : rightClipPath,
      }}
    />
  );
};

const ImageComparisonSlider = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  const { motionSliderPosition } = useContext(ImageComparisonContext)!;

  const left = useTransform(motionSliderPosition, (value) => `${value}%`);

  return (
    <motion.div
      aria-hidden
      className={cn('pointer-events-none absolute bottom-0 top-0 w-0.5 -translate-x-1/2 bg-white/90', className)}
      style={{
        left,
      }}
    >
      {children === undefined ? <span data-slot="comparison-handle" className="absolute left-1/2 top-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm"><ArrowLeftRight className="size-4" /></span> : children}
    </motion.div>
  );
};

export { ImageComparison, ImageComparisonImage, ImageComparisonSlider };
