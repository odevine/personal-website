import { useEffect, useMemo, useState, PropsWithChildren } from "react";
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { CssBaseline, PaletteMode, PaletteColorOptions } from "@mui/material";

import { ThemeContext } from "@/ThemeContext";

export const ThemeProvider = (props: PropsWithChildren) => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const defaultTheme =
    localStorage.getItem("theme") ?? prefersDarkMode ? "dark" : "light";
  const [mode, setMode] = useState<PaletteMode>(defaultTheme as PaletteMode);

  useEffect(() => {
    // Save the current theme in localStorage
    localStorage.setItem("theme", mode);
  }, [mode]);

  const colorMode = useMemo(
    () => ({
      toggleTheme: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
      mode,
    }),
    [mode],
  );

  const theme = useMemo(
    () =>
      createTheme({
        typography: {
          fontFamily: "Noto Mono, monospace",
        },
        palette: {
          mode,
          ...(mode === "light"
            ? ({
                primary: {
                  main: "#fc8d57",
                },
                secondary: {
                  main: "#ff6188",
                },
                background: {
                  default: "#fdf9f3",
                  paper: "#fffcf4",
                },
                text: {
                  primary: "#2c292d",
                  secondary: "#514b53",
                },
              } as PaletteColorOptions)
            : ({
                primary: {
                  main: "#ab9df2",
                },
                secondary: {
                  main: "#78dce8",
                },
                background: {
                  default: "#221f22",
                  paper: "#2d2a2e",
                },
                text: {
                  primary: "#fafbfb",
                  secondary: "#c7c7c7",
                },
              } as PaletteColorOptions)),
        },
      }),
    [mode],
  );

  return (
    <ThemeContext.Provider value={colorMode}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {props.children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
