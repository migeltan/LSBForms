// src/hooks/useScrollProgress.ts
import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Returns a 0-1 value representing how far the given element has scrolled
 * past the top of the viewport (0 = untouched, 1 = fully scrolled past).
 * Used for the hero's scroll-linked fade/settle effect. Pure CSS can't
 * react to scroll position, so this is a small rAF-throttled listener
 * instead of a scroll-hijacking library.
 */
export function useScrollProgress<T extends HTMLElement>(): [
  RefObject<T | null>,
  number,
] {
  const ref = useRef<T | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    function measure() {
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const total = rect.height || 1;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      setProgress(scrolled / total);
    }

    function onScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    }

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return [ref, progress];
}
