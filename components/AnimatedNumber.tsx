"use client";

import { useEffect, useState } from "react";

interface AnimatedNumberProps {
  target: number;
  duration?: number;
  prefix?: string;
  className?: string;
}

export default function AnimatedNumber({
  target,
  duration = 650,
  prefix = "+",
  className = "",
}: AnimatedNumberProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    // Check user preference for reduced motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || target <= 0) {
      setCurrent(target);
      return;
    }

    let startTime: number | null = null;
    let animationFrame: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Quad ease-out
      const easedProgress = 1 - Math.pow(1 - progress, 2);
      setCurrent(Math.round(easedProgress * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    animationFrame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return (
    <span className={className}>
      {prefix}
      {current}
    </span>
  );
}
