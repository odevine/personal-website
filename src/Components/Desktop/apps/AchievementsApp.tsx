import { useState } from "react";

import { Button } from "@/Components/ui/Button";
import { cx } from "@/Components/ui/cx";
import { LockIcon, TrophyIcon } from "@/Components/ui/icons";
import { Progress } from "@/Components/ui/Progress";
import { useAchievements } from "@/achievements";
import {
  achievementGroups,
  achievements,
  achievementsMarkdown,
  countUnlocked,
} from "@/content/achievements";
import { ACHIEVEMENTS_PATH } from "@/content/files";
import { formatDate } from "@/format";
import { useDesktop } from "../DesktopContext";
import styles from "./AchievementsApp.module.css";

export const AchievementsApp = () => {
  const { unlocked } = useAchievements();
  const { openFileAs } = useDesktop();
  const done = countUnlocked(unlocked);
  const [hinted, setHinted] = useState<Record<string, boolean>>({});

  return (
    <div className={styles.achievements}>
      <div>
        <div className={styles.summary}>
          <h5 className="t-h5">
            {done} / {achievements.length}
          </h5>
          <Button
            onClick={() =>
              openFileAs(
                ACHIEVEMENTS_PATH,
                achievementsMarkdown(unlocked),
                "preview",
              )
            }
          >
            open as file
          </Button>
        </div>
        <Progress
          value={(done / achievements.length) * 100}
          aria-label="achievements unlocked"
          className={styles.progress}
        />
      </div>

      {achievementGroups(unlocked).map((group) => (
        <section key={group.category}>
          <div className={styles.groupHeader}>
            <h6 className="t-subtitle2 t-mono">{group.category}</h6>
            <span className="t-caption t-secondary">
              {group.done} / {group.rows.length}
            </span>
          </div>
          <ul className={styles.rows}>
            {group.rows.map(({ def, unlockedAt }) => {
              const secret = !unlockedAt && def.hidden;
              return (
                <li
                  key={def.id}
                  className={cx(styles.row, !unlockedAt && styles.locked)}
                >
                  <span className={styles.badge}>
                    {unlockedAt ? (
                      <TrophyIcon style={{ fontSize: 16 }} />
                    ) : (
                      <LockIcon style={{ fontSize: 15 }} />
                    )}
                  </span>
                  <div className={styles.details}>
                    <p className="t-body2 t-mono">
                      {secret ? "???" : def.name}
                    </p>
                    {(!secret || (def.hint && hinted[def.id])) && (
                      <span className={`t-caption t-secondary ${styles.block}`}>
                        {secret ? def.hint : def.description}
                      </span>
                    )}
                  </div>
                  {secret && def.hint && (
                    <Button
                      aria-expanded={!!hinted[def.id]}
                      onClick={() =>
                        setHinted((current) => ({
                          ...current,
                          [def.id]: !current[def.id],
                        }))
                      }
                      className={styles.fixed}
                    >
                      {hinted[def.id] ? "hide" : "hint"}
                    </Button>
                  )}
                  {unlockedAt && (
                    <span className={`t-caption t-secondary ${styles.fixed}`}>
                      {formatDate(unlockedAt)}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
};
