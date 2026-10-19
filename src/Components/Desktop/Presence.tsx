import { useEffect, useRef, useState } from "react";

import styles from "./Presence.module.css";

import { reducedMotion } from "@/motion";
import {
  PRESENCE_LINE,
  PRESENCE_SHUDDER,
  PRESENCE_START,
  presenceLines,
} from "./presenceEvents";

// Time before the first sign, then between signs
const FIRST_MIN_MS = 6000;
const FIRST_SPREAD_MS = 6000;
const GAP_MIN_MS = 15000;
const GAP_SPREAD_MS = 40000;
const CREATURE_MS = 18000;

const pick = <T,>(items: T[]): T | undefined =>
  items[Math.floor(Math.random() * items.length)];

const shown = (el: HTMLElement) => {
  const style = getComputedStyle(el);
  return style.display !== "none" && style.visibility !== "hidden";
};

// One window shakes for a moment with its colors split apart
const shudder = () => {
  const windows = [
    ...document.querySelectorAll<HTMLElement>("[data-window]:not([inert])"),
  ].filter(shown);
  pick(windows)?.animate(
    [
      { translate: "0px 0px", filter: "none" },
      {
        translate: "-4px 1px",
        filter: "drop-shadow(3px 0 #0ff) drop-shadow(-3px 0 #f0f)",
      },
      { translate: "5px -2px", filter: "none" },
      {
        translate: "-3px 0px",
        filter: "drop-shadow(-3px 0 #0ff) drop-shadow(3px 0 #f0f)",
      },
      { translate: "0px 0px", filter: "none" },
    ],
    { duration: 420, easing: "steps(6, end)" },
  );
};

// A dock icon drops out and comes back
const flicker = () => {
  const icons = [...document.querySelectorAll<HTMLElement>("[data-dock-app]")];
  pick(icons)?.animate(
    [
      { opacity: 1 },
      { opacity: 0 },
      { opacity: 1 },
      { opacity: 0 },
      { opacity: 1 },
    ],
    { duration: 600, easing: "steps(5, end)" },
  );
};

const say = () =>
  window.dispatchEvent(
    new CustomEvent(PRESENCE_LINE, { detail: pick(presenceLines) }),
  );

interface Creature {
  id: number;
  top: number;
  fromLeft: boolean;
}

// A dark shape drifts across the backdrop and is gone
const CreatureShape = ({
  creature,
  onDone,
}: {
  creature: Creature;
  onDone: () => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const [from, to] = creature.fromLeft ? [-70, 110] : [110, -70];
    const animation = ref.current?.animate(
      [
        { transform: `translateX(${from}vw)`, opacity: 0 },
        { opacity: 0.8, offset: 0.2 },
        { opacity: 0.8, offset: 0.8 },
        { transform: `translateX(${to}vw)`, opacity: 0 },
      ],
      { duration: CREATURE_MS, easing: "linear", fill: "forwards" },
    );
    if (animation) animation.onfinish = onDone;
    return () => animation?.cancel();
    // the animation runs once for this creature
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={ref}
      className={styles.creature}
      style={{
        top: `${creature.top}%`,
        transform: creature.fromLeft ? undefined : "scaleX(-1)",
      }}
    />
  );
};

// After the dive command, signs of something below show up now and then
export const Presence = () => {
  const [active, setActive] = useState(false);
  const [creatures, setCreatures] = useState<Creature[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    const start = () => setActive(true);
    window.addEventListener(PRESENCE_START, start);
    return () => window.removeEventListener(PRESENCE_START, start);
  }, []);

  // the dive asks for a shake at its worst moments, whether or not the presence is active
  useEffect(() => {
    const shake = () => {
      if (!reducedMotion()) shudder();
    };
    window.addEventListener(PRESENCE_SHUDDER, shake);
    return () => window.removeEventListener(PRESENCE_SHUDDER, shake);
  }, []);

  useEffect(() => {
    if (!active) return;
    let timer: ReturnType<typeof setTimeout>;
    const stir = () => {
      // with motion turned down only the terminal line is left
      const signs = reducedMotion()
        ? [say]
        : [
            shudder,
            flicker,
            say,
            () =>
              setCreatures((current) => [
                ...current,
                {
                  id: nextId.current++,
                  top: 15 + Math.random() * 60,
                  fromLeft: Math.random() < 0.5,
                },
              ]),
          ];
      pick(signs)?.();
      timer = setTimeout(stir, GAP_MIN_MS + Math.random() * GAP_SPREAD_MS);
    };
    timer = setTimeout(stir, FIRST_MIN_MS + Math.random() * FIRST_SPREAD_MS);
    return () => clearTimeout(timer);
  }, [active]);

  return (
    <div aria-hidden className={styles.layer}>
      {creatures.map((creature) => (
        <CreatureShape
          key={creature.id}
          creature={creature}
          onDone={() =>
            setCreatures((current) =>
              current.filter((entry) => entry.id !== creature.id),
            )
          }
        />
      ))}
    </div>
  );
};
