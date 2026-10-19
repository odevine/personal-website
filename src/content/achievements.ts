export type AchievementCategory =
  "terminal" | "deletion" | "config" | "exploring" | "meta";

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  /** A locked hidden achievement shows as ??? with no description */
  hidden: boolean;
  /** A nudge the achievements app reveals on request for a locked hidden one */
  hint?: string;
}

export const categories: AchievementCategory[] = [
  "terminal",
  "deletion",
  "config",
  "exploring",
  "meta",
];

export const achievements = [
  {
    id: "nice-try",
    name: "nice try",
    description: "run rm -rf / without sudo",
    category: "terminal",
    hidden: true,
    hint: "you know the command that deletes everything. try it as a regular user",
  },
  {
    id: "kernel-panic",
    name: "kernel panic",
    description: "run sudo rm -rf /",
    category: "terminal",
    hidden: true,
    hint: "you know the command that deletes everything. try it with root access",
  },
  {
    id: "turn-it-off-and-on",
    name: "turn it off and on",
    description: "run sudo reboot",
    category: "terminal",
    hidden: true,
    hint: "what tech support suggests first, as a sudo command",
  },
  {
    id: "safe-to-turn-off",
    name: "safe to turn off",
    description: "run sudo shutdown",
    category: "terminal",
    hidden: true,
    hint: "the opposite of restarting, also needs sudo",
  },
  {
    id: "dive",
    name: "dive",
    description: "run dive in the terminal",
    category: "terminal",
    hidden: true,
    hint: "help only covers what's on the surface. try going deeper, the way a swimmer or a submarine would",
  },
  {
    id: "scribe",
    name: "scribe",
    description: "create a file with touch or echo >",
    category: "terminal",
    hidden: false,
  },
  {
    id: "typo",
    name: "typo",
    description: "run a command that does not exist",
    category: "terminal",
    hidden: false,
  },
  {
    id: "undo",
    name: "undo",
    description: "restore a deleted file",
    category: "terminal",
    hidden: false,
  },

  {
    id: "lost-its-look",
    name: "lost its look",
    description: "delete system/theme.json",
    category: "deletion",
    hidden: false,
  },
  {
    id: "weightless",
    name: "weightless",
    description: "delete system/gravity",
    category: "deletion",
    hidden: false,
  },
  {
    id: "frozen",
    name: "frozen",
    description: "delete system/animations",
    category: "deletion",
    hidden: false,
  },
  {
    id: "serif-society",
    name: "serif society",
    description: "delete system/fonts",
    category: "deletion",
    hidden: false,
  },
  {
    id: "identity-crisis",
    name: "identity crisis",
    description: "delete system/hostname",
    category: "deletion",
    hidden: false,
  },
  {
    id: "silence",
    name: "silence",
    description: "delete system/motd",
    category: "deletion",
    hidden: false,
  },
  {
    id: "faceless",
    name: "faceless",
    description: "delete pictures/avatar.png",
    category: "deletion",
    hidden: false,
  },
  {
    id: "spring-cleaning",
    name: "spring cleaning",
    description: "empty the system folder",
    category: "deletion",
    hidden: false,
  },

  {
    id: "stylist",
    name: "stylist",
    description: "write a valid rule in custom.css",
    category: "config",
    hidden: false,
  },
  {
    id: "interior-designer",
    name: "interior designer",
    description: "reorder the dock by dragging",
    category: "config",
    hidden: false,
  },
  {
    id: "ghost-app",
    name: "ghost app",
    description: "put an app that does not exist in dock.json",
    category: "config",
    hidden: true,
    hint: "the dock lists apps by name, and it doesn't check them",
  },
  {
    id: "files-stays",
    name: "files stays",
    description: "try to remove files from dock.json",
    category: "config",
    hidden: false,
  },
  {
    id: "live-edit",
    name: "live edit",
    description: "change about.md from its default",
    category: "config",
    hidden: false,
  },

  {
    id: "chameleon",
    name: "chameleon",
    description: "switch to every theme",
    category: "exploring",
    hidden: false,
  },
  {
    id: "full-house",
    name: "full house",
    description: "have all six apps open at once",
    category: "exploring",
    hidden: false,
  },
  {
    id: "yeet",
    name: "yeet",
    description: "throw a window hard enough that it bounces off an edge",
    category: "exploring",
    hidden: true,
    hint: "windows have momentum, and the edges are solid",
  },

  {
    id: "night-owl",
    name: "night owl",
    description: "visit between midnight and 5am",
    category: "meta",
    hidden: true,
    hint: "the site is quieter in the small hours, and it notices who visits",
  },
  {
    id: "regular",
    name: "regular",
    description: "visit five times",
    category: "meta",
    hidden: false,
  },
  {
    id: "marathon",
    name: "marathon",
    description: "keep the tab open for 30 minutes",
    category: "meta",
    hidden: false,
  },
] as const satisfies readonly AchievementDef[];

export type AchievementId = (typeof achievements)[number]["id"];

export type Unlocked = Partial<Record<string, string>>;

export interface AchievementGroup {
  category: AchievementCategory;
  done: number;
  rows: Array<{ def: AchievementDef; unlockedAt?: string }>;
}

export const achievementGroups = (unlocked: Unlocked): AchievementGroup[] =>
  categories.map((category) => {
    const rows = achievements
      .filter((def) => def.category === category)
      .map((def) => ({ def, unlockedAt: unlocked[def.id] }));
    return {
      category,
      done: rows.filter((row) => row.unlockedAt).length,
      rows,
    };
  });

export const countUnlocked = (unlocked: Unlocked) =>
  achievements.filter((def) => unlocked[def.id]).length;

const day = (iso: string) => iso.slice(0, 10);

/** The text of documents/achievements.md */
export const achievementsMarkdown = (unlocked: Unlocked): string => {
  const lines = [
    "# achievements",
    "",
    `${countUnlocked(unlocked)} / ${achievements.length}`,
  ];
  for (const group of achievementGroups(unlocked)) {
    lines.push("", `## ${group.category}`, "");
    for (const { def, unlockedAt } of group.rows) {
      if (unlockedAt) {
        lines.push(
          `- [x] **${def.name}**, ${def.description} (${day(unlockedAt)})`,
        );
      } else if (def.hidden) {
        lines.push("- [ ] ???");
      } else {
        lines.push(`- [ ] **${def.name}**, ${def.description}`);
      }
    }
  }
  return lines.join("\n") + "\n";
};

/** The terminal's achievements command prints this */
export const achievementsSummary = (unlocked: Unlocked): string => {
  const width = Math.max(...achievements.map((def) => def.name.length));
  const lines = [`${countUnlocked(unlocked)} / ${achievements.length}`];
  for (const group of achievementGroups(unlocked)) {
    lines.push("", `${group.category}  ${group.done} / ${group.rows.length}`);
    for (const { def, unlockedAt } of group.rows) {
      if (unlockedAt) {
        lines.push(`  [x] ${def.name.padEnd(width)}  ${def.description}`);
      } else if (def.hidden) {
        lines.push("  [ ] ???");
      } else {
        lines.push(`  [ ] ${def.name.padEnd(width)}  ${def.description}`);
      }
    }
  }
  return lines.join("\n");
};
