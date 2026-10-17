import { flushSync } from "react-dom";

import { reducedMotion } from "@/motion";

// Swaps the color scheme with a circular reveal that grows from (x, y)
export const transitionToScheme = (
  setScheme: (name: string) => void,
  name: string,
  x: number,
  y: number,
) => {
  if (!document.startViewTransition || reducedMotion()) {
    setScheme(name);
    return;
  }

  const { innerWidth: w, innerHeight: h } = window;
  const endRadius = Math.hypot(Math.max(x, w - x), Math.max(y, h - y));

  // Percentages resolve against the transition layer itself, so the origin
  // stays on the click point when the layer is scaled (high-DPR displays)
  const cx = `${(x / w) * 100}%`;
  const cy = `${(y / h) * 100}%`;
  const reach = `${(endRadius / (Math.hypot(w, h) / Math.SQRT2)) * 100}%`;

  const transition = document.startViewTransition(() => {
    // flushSync puts the new palette in the DOM before the "new" snapshot
    flushSync(() => setScheme(name));
  });

  transition.ready.then(() => {
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0% at ${cx} ${cy})`,
          `circle(${reach} at ${cx} ${cy})`,
        ],
      },
      {
        duration: 500,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      },
    );
  });
};
