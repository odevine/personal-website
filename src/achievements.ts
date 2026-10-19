import { useEffect, useSyncExternalStore } from "react";

import { AchievementId, achievements } from "@/content/achievements";

interface StoredState {
  /** Achievement id to the ISO time it was unlocked */
  unlocked: Record<string, string>;
  visits: number;
}

interface State extends StoredState {
  /** Unlocks waiting for their toast, oldest first */
  queue: AchievementId[];
}

const STORAGE_KEY = "achievements";
const SESSION_KEY = "visited";

const known = new Set<string>(achievements.map((def) => def.id));

// Reading storage never unlocks anything, it only restores what was earned
const load = (): StoredState => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    const unlocked: Record<string, string> = {};
    for (const [id, when] of Object.entries(parsed?.unlocked ?? {})) {
      if (known.has(id) && typeof when === "string") unlocked[id] = when;
    }
    const visits = Number.isFinite(parsed?.visits)
      ? Math.max(0, Math.floor(parsed.visits))
      : 0;
    return { unlocked, visits };
  } catch {
    return { unlocked: {}, visits: 0 };
  }
};

let state: State = { ...load(), queue: [] };
const listeners = new Set<() => void>();

const commit = (next: State) => {
  state = next;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ unlocked: next.unlocked, visits: next.visits }),
    );
  } catch {
    // storage can be unavailable, progress then lasts for this page load only
  }
  listeners.forEach((listener) => listener());
};

export const subscribeAchievements = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getAchievements = () => state;

/** Re-renders a component when anything is unlocked or a toast is dismissed */
export const useAchievements = () =>
  useSyncExternalStore(subscribeAchievements, getAchievements);

/** Records an achievement and queues its toast, later calls do nothing */
export const unlock = (id: AchievementId) => {
  if (state.unlocked[id]) return;
  commit({
    ...state,
    unlocked: { ...state.unlocked, [id]: new Date().toISOString() },
    queue: [...state.queue, id],
  });
};

/** Forgets every unlock, the visit count and any progress, and clears waiting toasts */
export const resetAchievements = () => {
  progress.clear();
  commit({ unlocked: {}, visits: 0, queue: [] });
};

/** Removes the toast being shown */
export const dismissToast = () => {
  if (!state.queue.length) return;
  state = { ...state, queue: state.queue.slice(1) };
  listeners.forEach((listener) => listener());
};

// Covers the effect running twice in development and sessionStorage being blocked
let visitChecked = false;

/** Counts this visit once per browser session and unlocks the visit based ones */
export const recordVisit = () => {
  if (visitChecked) return;
  visitChecked = true;

  if (new Date().getHours() < 5) unlock("night-owl");

  try {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // without session storage every page load counts as a visit
  }
  commit({ ...state, visits: state.visits + 1 });
  if (state.visits >= 5) unlock("regular");
};

// Progress towards achievements that need several steps lasts for the page load
const progress = new Map<string, Set<string>>();

/** Adds a step to a group and returns how many distinct steps it now has */
export const noteProgress = (group: string, step: string): number => {
  const steps = progress.get(group) ?? new Set<string>();
  steps.add(step);
  progress.set(group, steps);
  return steps.size;
};

/**
 * Unlocks once a condition has held, with the same value of `key`, for the
 * delay. Live edited files use this so a half typed value does not unlock.
 */
export const useUnlockWhenStable = (
  id: AchievementId,
  active: boolean,
  key: string,
  delay = 1500,
) => {
  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => unlock(id), delay);
    return () => clearTimeout(timer);
  }, [id, active, key, delay]);
};
