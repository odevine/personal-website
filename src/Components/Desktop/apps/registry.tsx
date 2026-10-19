import { ReactNode } from "react";

import { AppId } from "../appMeta";
import { AboutApp } from "./AboutApp";
import { AchievementsApp } from "./AchievementsApp";
import { EditorApp } from "./EditorApp";
import { ExplorerApp } from "./ExplorerApp";
import { SettingsApp } from "./SettingsApp";
import { TerminalApp } from "./TerminalApp";
import { ViewerApp } from "./ViewerApp";

export { appIcons } from "./appIcons";

export const appContent: Record<AppId, () => ReactNode> = {
  about: () => <AboutApp />,
  editor: () => <EditorApp />,
  viewer: () => <ViewerApp />,
  terminal: () => <TerminalApp />,
  explorer: () => <ExplorerApp />,
  settings: () => <SettingsApp />,
  achievements: () => <AchievementsApp />,
};
