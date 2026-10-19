import { useEffect, useRef } from "react";

import {
  noteProgress,
  recordVisit,
  unlock,
  useAchievements,
} from "@/achievements";
import { achievementsMarkdown } from "@/content/achievements";
import { ACHIEVEMENTS_PATH } from "@/content/files";
import { useTheme } from "@/ThemeContext";
import { colorSchemes } from "@/themes";
import { useEditor } from "./EditorContext";

const MARATHON_MS = 30 * 60 * 1000;

// Keeps documents/achievements.md in step with what has been unlocked
export const AchievementsFileSync = () => {
  const { unlocked } = useAchievements();
  const { contents, replaceFile, setNote } = useEditor();
  const text = achievementsMarkdown(unlocked);
  const current = contents[ACHIEVEMENTS_PATH];

  useEffect(() => {
    if (current !== text) replaceFile(ACHIEVEMENTS_PATH, text);
  }, [current, text, replaceFile]);

  useEffect(() => {
    setNote(ACHIEVEMENTS_PATH, {
      level: "ok",
      message: "updates as you unlock things, saved in this browser",
    });
  }, [setNote]);

  return null;
};

// Achievements for the visit itself, how long it lasts and switching themes
export const AchievementWatchers = () => {
  const { scheme } = useTheme();
  const firstScheme = useRef(true);

  useEffect(() => {
    recordVisit();
    const timer = setTimeout(() => unlock("marathon"), MARATHON_MS);
    return () => clearTimeout(timer);
  }, []);

  // the scheme the page loaded with counts as seen, but only a switch can unlock
  useEffect(() => {
    const seen = noteProgress("schemes", scheme);
    if (firstScheme.current) {
      firstScheme.current = false;
      return;
    }
    if (seen >= colorSchemes.length) unlock("chameleon");
  }, [scheme]);

  return null;
};
