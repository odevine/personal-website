import { useEffect, useState } from "react";
import { Box } from "@mui/material";

import { DiveTone } from "@/content/dive";
import { reducedMotion } from "@/motion";

// The game's own palette, so these lines keep its colors whatever the site's theme is
const colors: Record<DiveTone, string> = {
  base: "#5dff6a",
  dim: "#5dff6a",
  nav: "#4dffff",
  loot: "#ffee4d",
  threat: "#ff5b5b",
  corp: "#7d9bff",
  corrupt: "#ff4dff",
};

export const TYPE_MS = 18;

const Typed = ({ text }: { text: string }) => {
  const [shown, setShown] = useState(reducedMotion() ? text.length : 0);
  useEffect(() => {
    if (shown >= text.length) return;
    const timer = setTimeout(() => setShown(shown + 1), TYPE_MS);
    return () => clearTimeout(timer);
  }, [shown, text]);
  return <>{text.slice(0, shown)}</>;
};

// A line of terminal output in the game's look, the corrupt ones tear apart
export const DiveLine = ({
  tone = "base",
  text,
  type = false,
}: {
  tone?: DiveTone;
  text: string;
  type?: boolean;
}) => {
  const color = colors[tone];
  return (
    <Box
      component="span"
      data-text={text}
      sx={{
        position: "relative",
        display: "inline-block",
        color,
        opacity: tone === "dim" ? 0.65 : 1,
        textShadow: `0 0 6px ${color}99`,
        ...(tone === "corrupt" && {
          "&::after": {
            content: "attr(data-text)",
            position: "absolute",
            left: 0,
            top: 0,
            color: "#4dffff",
            textShadow: "none",
            "@keyframes dive-tear": {
              "0%, 100%": { clipPath: "inset(0 0 0 0)", transform: "none" },
              "20%": {
                clipPath: "inset(10% 0 55% 0)",
                transform: "translateX(-4px)",
              },
              "45%": {
                clipPath: "inset(60% 0 5% 0)",
                transform: "translateX(4px)",
              },
              "70%": {
                clipPath: "inset(30% 0 40% 0)",
                transform: "translateX(-2px)",
              },
            },
            animation: reducedMotion()
              ? "none"
              : "dive-tear 1.4s steps(1) infinite",
            "@media (prefers-reduced-motion: reduce)": { animation: "none" },
          },
        }),
      }}
    >
      {type ? <Typed text={text} /> : text || "\u00a0"}
    </Box>
  );
};
