import { MouseEvent } from "react";
import { flushSync } from "react-dom";
import { IconButton } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

import { useTheme } from "@/ThemeContext";

export const ThemeToggle = () => {
  const { toggleTheme, mode } = useTheme();

  const handleToggle = (event: MouseEvent<HTMLButtonElement>) => {
    // Bail out gracefully where the View Transitions API isn't supported
    // (or the user prefers reduced motion) — just flip the theme instantly.
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!document.startViewTransition || prefersReducedMotion) {
      toggleTheme();
      return;
    }

    // Origin of the ripple is the point that was clicked.
    const x = event.clientX;
    const y = event.clientY;
    // Radius needed to reach the furthest corner of the viewport.
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    const transition = document.startViewTransition(() => {
      // flushSync forces React to apply the theme change synchronously so the
      // new DOM is captured by the time startViewTransition's callback resolves.
      flushSync(() => {
        toggleTheme();
      });
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
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

  return (
    <IconButton
      onClick={handleToggle}
      color="secondary"
    >
      {mode === "light" ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
};
