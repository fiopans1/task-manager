import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Keeps the current single-tree mobile/desktop sidebar behaviour.
 *
 * Rendering one tree instead of duplicating the navigation also avoids
 * duplicate ids and duplicate link matches in tests.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT,
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}
