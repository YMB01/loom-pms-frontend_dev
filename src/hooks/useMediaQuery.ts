"use client";

import { useEffect, useState } from "react";

/**
 * Subscribes to a CSS media query. Initial render uses `false` (SSR-safe);
 * updates on mount and on breakpoint changes.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
