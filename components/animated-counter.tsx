"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

interface AnimatedCounterProps {
  /** The final numeric value. */
  value: number;
  /** Characters prefixed to the number, e.g. "$". */
  prefix?: string;
  /** Characters appended to the number, e.g. "×" or "s". */
  suffix?: string;
  /** Number of decimal places to preserve. */
  decimals?: number;
  /** Animation duration in ms. */
  duration?: number;
  className?: string;
}

/**
 * Counts up to `value` when scrolled into view. Uses a direct IntersectionObserver
 * (framer-motion's useInView was silently failing on hydration; the manual observer
 * is deterministic). Respects reduced motion — jumps to final value.
 */
export function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1400,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    const node = ref.current;
    if (!node) return;

    const start = () => {
      if (startedRef.current) return;
      startedRef.current = true;

      let raf = 0;
      const t0 = performance.now();
      const tick = (now: number) => {
        const elapsed = now - t0;
        const progress = Math.min(elapsed / duration, 1);
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        setDisplay(value * eased);
        if (progress < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          start();
          observer.disconnect();
        }
      },
      { rootMargin: "-60px 0px", threshold: 0.01 }
    );
    observer.observe(node);

    // Fallback safety: if the observer hasn't fired within 1s but the element
    // is already in the viewport (hydration race), kick the animation manually.
    const fallback = setTimeout(() => {
      if (startedRef.current) return;
      const rect = node.getBoundingClientRect();
      const inViewport =
        rect.top < window.innerHeight && rect.bottom > 0;
      if (inViewport) start();
    }, 1000);

    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, [value, duration, reduce]);

  const formatted = display.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
