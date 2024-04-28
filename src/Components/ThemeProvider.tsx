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
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              html: {
                "&::-webkit-scrollbar, & ::-webkit-scrollbar": {
                  backgroundColor: "#403e41",
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                },
                "&::-webkit-scrollbar-thumb, &::-webkit-scrollbar-thumb": {
                  borderRadius: 6,
                  backgroundColor: "#403e41",
                  minHeight: 24,
                  border: "2px solid #403e41",
                },
                "&::-webkit-scrollbar-thumb:focus, & ::-webkit-scrollbar-thumb:focus":
                  {
                    backgroundColor: "#2d2a2e",
                  },
                "&::-webkit-scrollbar-thumb:active, &::-webkit-scrollbar-thumb:active":
                  {
                    backgroundColor: "#2d2a2e",
                  },
                "&::-webkit-scrollbar-thumb:hover, & ::-webkit-scrollbar-thumb:hover":
                  {
                    backgroundColor: "#2d2a2e",
                  },
                "&::-webkit-scrollbar-corner, &::-webkit-scrollbar-corner": {
                  backgroundColor: "#403e41",
                },
              },
            },
          },
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
