import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  PropsWithChildren,
} from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { CssBaseline, GlobalStyles } from "@mui/material";

import {
  Settings,
  defaultSettings,
  loadSettings,
  saveSettings,
} from "@/settings";
import { nodeExists } from "@/content/filesystem";
import { useFilesystemVersion } from "@/content/useFilesystem";
import { ThemeContext } from "@/ThemeContext";
import {
  colorSchemes,
  createAppTheme,
  getScheme,
  monochromeScheme,
} from "@/themes";

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

  const [settings, setSettings] = useState<Settings>(loadSettings);

  // Deleting system files from the terminal removes parts of the site's styling
  useFilesystemVersion();
  const themeMissing = !nodeExists(["system", "theme.json"]);
  const animationsMissing = !nodeExists(["system", "animations"]);
  const fontsMissing = !nodeExists(["system", "fonts"]);

  // Without its theme file the site drops to plain black and white
  const shown = useMemo<Settings>(
    () =>
      themeMissing
        ? {
            ...defaultSettings,
            radius: 0,
            font: "mono",
            background: "none",
            backdropIntensity: 0,
            windowOpacity: 1,
            reduceMotion: true,
          }
        : {
            ...settings,
            reduceMotion: settings.reduceMotion || animationsMissing,
          },
    [settings, themeMissing, animationsMissing],
  );

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    document.documentElement.dataset.reduceMotion = String(shown.reduceMotion);
  }, [shown.reduceMotion]);

  const updateSettings = useCallback(
    (changes: Partial<Settings>) =>
      setSettings((current) => ({ ...current, ...changes })),
    [],
  );

  const resetSettings = useCallback(
    () =>
      setSettings((current) => ({
        ...defaultSettings,
        reduceMotion: current.reduceMotion,
      })),
    [],
  );

  const colorMode = useMemo(
    () => ({
      scheme,
      setScheme,
      settings: shown,
      updateSettings,
      resetSettings,
      themeMissing,
    }),
    [scheme, shown, updateSettings, resetSettings, themeMissing],
  );

  const theme = useMemo(
    () =>
      createAppTheme(
        themeMissing ? monochromeScheme : getScheme(scheme),
        shown,
      ),
    [scheme, shown, themeMissing],
  );

  return (
    <ThemeContext.Provider value={colorMode}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {shown.reduceMotion && (
          <GlobalStyles
            styles={{
              "*, *::before, *::after": {
                animationDuration: "0.001ms !important",
                animationIterationCount: "1 !important",
                transitionDuration: "0.001ms !important",
              },
            }}
          />
        )}
        {themeMissing && (
          <GlobalStyles styles={{ html: { filter: "grayscale(1)" } }} />
        )}
        {fontsMissing && (
          <GlobalStyles
            styles={{
              "body, body *": {
                fontFamily: '"Times New Roman", Times, serif !important',
              },
              a: {
                color: "#0000ee !important",
                textDecoration: "underline !important",
              },
            }}
          />
        )}
        {props.children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
