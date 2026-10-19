import { useEffect } from "react";

import { TrophyIcon } from "@/Components/ui/icons";
import { dismissToast, useAchievements } from "@/achievements";
import { achievements, achievementsMarkdown } from "@/content/achievements";
import { ACHIEVEMENTS_PATH } from "@/content/files";
import { useDesktop } from "./DesktopContext";
import styles from "./AchievementToast.module.css";

const SHOW_MS = 4800;
// Several unlocks at once move along faster
const SHOW_QUEUED_MS = 2200;

// One toast at a time, resting on the bottom edge of the window area so the dock stays clear
export const AchievementToast = () => {
  const { queue, unlocked } = useAchievements();
  const { openFileAs } = useDesktop();
  const id = queue[0];
  const def = achievements.find((entry) => entry.id === id);
  const queued = queue.length > 1;

  useEffect(() => {
    if (!id) return;
    const timer = setTimeout(dismissToast, queued ? SHOW_QUEUED_MS : SHOW_MS);
    return () => clearTimeout(timer);
  }, [id, queued]);

  return (
    <div role="status" aria-live="polite" className={styles.shelf}>
      {def && (
        <button
          key={def.id}
          type="button"
          className={styles.toast}
          onClick={() => {
            openFileAs(
              ACHIEVEMENTS_PATH,
              achievementsMarkdown(unlocked),
              "preview",
            );
            dismissToast();
          }}
        >
          <TrophyIcon small className={styles.icon} />
          <span className={styles.text}>
            <span className="t-caption t-secondary">achievement unlocked</span>
            <span className={`t-body2 t-mono t-nowrap ${styles.name}`}>
              {def.name}
            </span>
            <span className="t-caption t-secondary">{def.description}</span>
          </span>
        </button>
      )}
    </div>
  );
};
