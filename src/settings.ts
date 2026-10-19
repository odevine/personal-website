export type AccentKey =
  "default" | "accent1" | "accent2" | "accent3" | "accent4" | "accent5";

export interface Settings {
  accent: AccentKey;
  font: "sans" | "mono";
  /** Body text size in px, the text styles scale from it */
  fontSize: number;
  /** Corner radius in px */
  radius: number;
  reduceMotion: boolean;
  background: "dots" | "grid" | "none";
  /** Window background opacity, 0.5 to 1 */
  windowOpacity: number;
  /** Multiplier on the accent glow around the active window, 0 turns it off */
  windowGlow: number;
  /** Multiplier on the backdrop drift speed, 0 pauses it */
  backdropSpeed: number;
  /** Multiplier on the backdrop accent opacity */
  backdropIntensity: number;
}

export const accentKeys: AccentKey[] = [
  "default",
  "accent1",
  "accent2",
  "accent3",
  "accent4",
  "accent5",
];

export const MAX_RADIUS = 16;

export const defaultSettings: Settings = {
  accent: "default",
  font: "mono",
  fontSize: 14,
  radius: 8,
  reduceMotion: false,
  background: "dots",
  windowOpacity: 1,
  windowGlow: 0.5,
  backdropSpeed: 1.2,
  backdropIntensity: 0.8,
};

const STORAGE_KEY = "settings";

// A different accent every time the page loads, so none is kept between visits
const randomAccent = (): AccentKey =>
  accentKeys[Math.floor(Math.random() * accentKeys.length)];

// Merges stored values over the defaults so new settings keep their defaults
export const loadSettings = (): Settings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const merged: Settings = {
      ...defaultSettings,
      reduceMotion,
      ...(stored ? JSON.parse(stored) : {}),
      accent: randomAccent(),
    };
    return { ...merged, radius: Math.min(merged.radius, MAX_RADIUS) };
  } catch {
    return { ...defaultSettings, accent: randomAccent() };
  }
};

export const saveSettings = (settings: Settings) => {
  try {
    // the accent is left out, it is picked fresh on each load
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...settings, accent: undefined }),
    );
  } catch {
    // storage can be unavailable, settings then last for the session only
  }
};
