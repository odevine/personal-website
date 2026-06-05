import { useEffect, useMemo, useState, PropsWithChildren } from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { CssBaseline } from "@mui/material";

import { ThemeContext } from "@/ThemeContext";
import { colorSchemes, createAppTheme, getScheme } from "@/themes";

const STORAGE_KEY = "theme";

// Map the legacy "light"/"dark" localStorage values onto the new filter names
// so returning visitors keep something close to what they had.
const migrateStoredValue = (stored: string | null): string | null => {
  if (stored === "dark") return "pro";
  if (stored === "light") return "light";
  return stored;
};

export const ThemeProvider = (props: PropsWithChildren) => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const stored = migrateStoredValue(localStorage.getItem(STORAGE_KEY));
  const isKnown = colorSchemes.some((s) => s.name === stored);
  const defaultScheme = isKnown
    ? (stored as string)
    : prefersDarkMode
      ? "pro"
      : "light";

  const [scheme, setScheme] = useState<string>(defaultScheme);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, scheme);
  }, [scheme]);

  const colorMode = useMemo(
    () => ({
      scheme,
      setScheme,
    }),
    [scheme],
  );

  const theme = useMemo(() => createAppTheme(getScheme(scheme)), [scheme]);

  return (
    <ThemeContext.Provider value={colorMode}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {props.children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
