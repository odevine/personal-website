import { useContext, createContext } from "react";

import { Settings, defaultSettings } from "@/settings";
import { defaultSchemeName } from "@/themes";

export const ThemeContext = createContext({
  /** The active Monokai Pro filter name. */
  scheme: defaultSchemeName,
  /** Switch to a different filter by name. */
  setScheme: (_name: string) => {},
  settings: defaultSettings,
  updateSettings: (_changes: Partial<Settings>) => {},
  /** Restores every setting except the color scheme */
  resetSettings: () => {},
  /** True while system/theme.json is deleted, the site then shows without its styling */
  themeMissing: false,
});

export const useTheme = () => useContext(ThemeContext);
