import { useContext, createContext } from "react";

import { defaultSchemeName } from "@/themes";

export const ThemeContext = createContext({
  /** The active Monokai Pro filter name. */
  scheme: defaultSchemeName,
  /** Switch to a different filter by name. */
  setScheme: (_name: string) => {},
});

export const useTheme = () => useContext(ThemeContext);
