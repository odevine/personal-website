import { appMeta, dockAppIds } from "@/Components/Desktop/appMeta";
import { getAchievements } from "@/achievements";
import { achievementsMarkdown } from "./achievements";
import { yearsOfExperience } from "./experience";

export interface SeedFile {
  /** Path from the home folder, the editor keys its files by this */
  path: string;
  content: string;
}

// The dock shows these apps in this order, named by their first alias
export const defaultDockText =
  JSON.stringify(
    { apps: dockAppIds.map((id) => appMeta[id].aliases[0]) },
    null,
    2,
  ) + "\n";

export const defaultMotd =
  "welcome. type help to see what this terminal can do.\n";

export const ACHIEVEMENTS_PATH = "documents/achievements.md";

// Files the editor starts with
export const seedFiles: SeedFile[] = [
  {
    path: "documents/owen.json",
    content: `{
  role: "software developer",
  location: "maine",
  yearsOfExperience: ${yearsOfExperience},
  currentlyBuilding: "apps that help",
  openToWork: true
}
`,
  },
  {
    path: "documents/about.md",
    content: `# owen devine
software developer in maine

i build web and mobile interfaces for a living.

most of my free time goes into side projects that are probably related to magic the gathering.
`,
  },
  {
    path: "documents/custom.css",
    content: `/* styles written here apply to the whole site as you type */

/* try uncommenting this */
/* .Button_button { letter-spacing: 0.08em; } */
`,
  },
  {
    path: "documents/notes.md",
    content: `# notes

anything written here stays in this browser.
`,
  },
  {
    path: ACHIEVEMENTS_PATH,
    content: achievementsMarkdown(getAchievements().unlocked),
  },
  { path: "system/dock.json", content: defaultDockText },
  { path: "system/fonts", content: "Inter\nNoto Mono\n" },
  { path: "system/animations", content: "on\n" },
  { path: "system/gravity", content: "9.81\n" },
  { path: "system/hostname", content: "devine\n" },
  { path: "system/motd", content: defaultMotd },
];

/** Files whose edits are kept in localStorage */
export const persistedFiles = [
  "documents/about.md",
  "documents/custom.css",
  "documents/notes.md",
  "system/dock.json",
];

/** System files can only be changed with sudo, and are read-only in the editor */
export const isSystemFile = (path: string) => path.startsWith("system/");

/** Files the site writes itself, nothing can change them, not even sudo */
export const isGeneratedFile = (path: string) => path === ACHIEVEMENTS_PATH;

/** Files the editor will not let anyone type in */
export const isReadOnlyFile = (path: string) =>
  isSystemFile(path) || isGeneratedFile(path);
