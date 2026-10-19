import { useCallback, useSyncExternalStore } from "react";

/** Whether a CSS media query currently matches, updating when it changes */
export const useMediaQuery = (query: string): boolean => {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
};

/** Below this width the desktop shows one window at a time */
export const MOBILE_QUERY = "(max-width: 899.95px)";
