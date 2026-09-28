// src/hooks/useScrollDirection.ts
import { useEffect, useRef, useState } from "react";

/**
 * Tracks scroll direction to drive the header's hide-on-scroll-down /
 * reveal-on-scroll-up behavior. Stays visible near the top of the page
 * regardless of direction, so it doesn't flicker on tiny scroll jitters.
 */
export function useScrollDirection(revealThreshold = 80) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const frame = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;

    function measure() {
      const y = window.scrollY;
      const delta = y - lastY.current;

      if (y < revealThreshold) {
        setHidden(false);
      } else if (Math.abs(delta) > 4) {
        setHidden(delta > 0); // scrolling down (delta > 0) → hide
      }

      lastY.current = y;
    }

    function onScroll() {
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(measure);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame.current);
      window.removeEventListener("scroll", onScroll);
    };
  }, [revealThreshold]);

  return hidden;
}
