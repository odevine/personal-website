import { useEffect, useState } from "react";

import { cx } from "@/Components/ui/cx";
import { DiveTone } from "@/content/dive";
import { reducedMotion } from "@/motion";
import styles from "./DiveLine.module.css";

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
    <span
      data-text={text}
      className={cx(
        styles.line,
        tone === "corrupt" && styles.corrupt,
        tone === "corrupt" && !reducedMotion() && styles.tearing,
      )}
      style={{
        color,
        opacity: tone === "dim" ? 0.65 : 1,
        textShadow: `0 0 6px ${color}99`,
      }}
    >
      {type ? <Typed text={text} /> : text || "\u00a0"}
    </span>
  );
};
