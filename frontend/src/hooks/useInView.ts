// src/hooks/useInView.ts
import { useEffect, useRef, useState } from "react";

/**
 * Tracks whether an element has scrolled into the viewport, once.
 * Used to trigger CSS reveal transitions (fade/slide-in) on scroll,
 * without hijacking native scroll behavior.
 */
export function useInView<T extends HTMLElement>(
  options?: IntersectionObserverInit,
) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(
    () => typeof IntersectionObserver === "undefined",
  );

  useEffect(() => {
    // Very old browsers: state above already defaults to visible.
    if (typeof IntersectionObserver === "undefined") return;

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px", ...options },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [options]);

  return { ref, inView };
}
