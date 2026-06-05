import { PaletteMode, PaletteColorOptions } from "@mui/material";
import { createTheme, Theme } from "@mui/material/styles";

// Canonical Monokai Pro filter palettes, lifted from the official color
// definitions (loctvl842/monokai-pro.nvim). Each filter shares the same set of
// roles, so they can be mapped onto MUI's palette uniformly:
//   accent6 -> primary, accent5 -> secondary,
//   dark1   -> background.default, background -> background.paper,
//   text    -> text.primary, dimmed1 -> text.secondary.
type MonokaiPalette = {
  dark2: string;
  dark1: string;
  background: string;
  text: string;
  accent1: string;
  accent2: string;
  accent3: string;
  accent4: string;
  accent5: string;
  accent6: string;
  dimmed1: string;
  dimmed2: string;
  dimmed3: string;
  dimmed4: string;
  dimmed5: string;
};

export type ColorScheme = {
  /** Stable id, also the value persisted to localStorage. */
  name: string;
  /** Human-readable label shown in the picker. */
  label: string;
  /** MUI palette mode — only "light" for the Light filter. */
  mode: PaletteMode;
  palette: MonokaiPalette;
};

export const colorSchemes: ColorScheme[] = [
  {
    name: "pro",
    label: "Pro",
    mode: "dark",
    palette: {
      dark2: "#19181a",
      dark1: "#221f22",
      background: "#2d2a2e",
      text: "#fcfcfa",
      accent1: "#ff6188",
      accent2: "#fc9867",
      accent3: "#ffd866",
      accent4: "#a9dc76",
      accent5: "#78dce8",
      accent6: "#ab9df2",
      dimmed1: "#c1c0c0",
      dimmed2: "#939293",
      dimmed3: "#727072",
      dimmed4: "#5b595c",
      dimmed5: "#403e41",
    },
  },
  {
    name: "classic",
    label: "Classic",
    mode: "dark",
    palette: {
      dark2: "#161613",
      dark1: "#1d1e19",
      background: "#272822",
      text: "#fdfff1",
      accent1: "#f92672",
      accent2: "#fd971f",
      accent3: "#e6db74",
      accent4: "#a6e22e",
      accent5: "#66d9ef",
      accent6: "#ae81ff",
      dimmed1: "#c0c1b5",
      dimmed2: "#919288",
      dimmed3: "#6e7066",
      dimmed4: "#57584f",
      dimmed5: "#3b3c35",
    },
  },
  {
    name: "machine",
    label: "Machine",
    mode: "dark",
    palette: {
      dark2: "#161b1e",
      dark1: "#1d2528",
      background: "#273136",
      text: "#f2fffc",
      accent1: "#ff6d7e",
      accent2: "#ffb270",
      accent3: "#ffed72",
      accent4: "#a2e57b",
      accent5: "#7cd5f1",
      accent6: "#baa0f8",
      dimmed1: "#b8c4c3",
      dimmed2: "#8b9798",
      dimmed3: "#6b7678",
      dimmed4: "#545f62",
      dimmed5: "#3a4449",
    },
  },
  {
    name: "octagon",
    label: "Octagon",
    mode: "dark",
    palette: {
      dark2: "#161821",
      dark1: "#1e1f2b",
      background: "#282a3a",
      text: "#eaf2f1",
      accent1: "#ff657a",
      accent2: "#ff9b5e",
      accent3: "#ffd76d",
      accent4: "#bad761",
      accent5: "#9cd1bb",
      accent6: "#c39ac9",
      dimmed1: "#b2b9bd",
      dimmed2: "#888d94",
      dimmed3: "#696d77",
      dimmed4: "#535763",
      dimmed5: "#3a3d4b",
    },
  },
  {
    name: "ristretto",
    label: "Ristretto",
    mode: "dark",
    palette: {
      dark2: "#191515",
      dark1: "#211c1c",
      background: "#2c2525",
      text: "#fff1f3",
      accent1: "#fd6883",
      accent2: "#f38d70",
      accent3: "#f9cc6c",
      accent4: "#adda78",
      accent5: "#85dacc",
      accent6: "#a8a9eb",
      dimmed1: "#c3b7b8",
      dimmed2: "#948a8b",
      dimmed3: "#72696a",
      dimmed4: "#5b5353",
      dimmed5: "#403838",
    },
  },
  {
    name: "spectrum",
    label: "Spectrum",
    mode: "dark",
    palette: {
      dark2: "#131313",
      dark1: "#191919",
      background: "#222222",
      text: "#f7f1ff",
      accent1: "#fc618d",
      accent2: "#fd9353",
      accent3: "#fce566",
      accent4: "#7bd88f",
      accent5: "#5ad4e6",
      accent6: "#948ae3",
      dimmed1: "#bab6c0",
      dimmed2: "#8b888f",
      dimmed3: "#69676c",
      dimmed4: "#525053",
      dimmed5: "#363537",
    },
  },
  {
    name: "light",
    label: "Light",
    mode: "light",
    palette: {
      dark2: "#d3cdcc",
      dark1: "#ede7e5",
      background: "#faf4f2",
      text: "#29242a",
      accent1: "#e14775",
      accent2: "#e16032",
      accent3: "#cc7a0a",
      accent4: "#269d69",
      accent5: "#1c8ca8",
      accent6: "#7058be",
      dimmed1: "#706b6e",
      dimmed2: "#918c8e",
      dimmed3: "#a59fa0",
      dimmed4: "#bfb9ba",
      dimmed5: "#d3cdcc",
    },
  },
];

export const defaultSchemeName = "pro";

/** Resolve a scheme by name, falling back to the default. */
export const getScheme = (name: string | null): ColorScheme =>
  colorSchemes.find((scheme) => scheme.name === name) ??
  colorSchemes.find((scheme) => scheme.name === defaultSchemeName) ??
  colorSchemes[0];

/** Build a full MUI theme from a Monokai Pro filter. */
export const createAppTheme = (scheme: ColorScheme): Theme => {
  const { palette } = scheme;
  return createTheme({
    typography: {
      fontFamily: "Noto Mono, monospace",
    },
    palette: {
      mode: scheme.mode,
      primary: { main: palette.accent6 },
      secondary: { main: palette.accent5 },
      background: {
        default: palette.dark1,
        paper: palette.background,
      },
      text: {
        primary: palette.text,
        secondary: palette.dimmed1,
      },
    } as { mode: PaletteMode } & Record<string, PaletteColorOptions>,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            "*::-webkit-scrollbar": { width: 8, height: 8 },
            "*::-webkit-scrollbar-track": {
              backgroundColor: palette.dimmed5,
            },
            "*::-webkit-scrollbar-thumb": {
              backgroundColor: palette.dimmed4,
              minHeight: 24,
              minWidth: 24,
            },
            "*::-webkit-scrollbar-thumb:focus": {
              backgroundColor: palette.dimmed3,
            },
            "*::-webkit-scrollbar-thumb:active": {
              backgroundColor: palette.dimmed3,
            },
            "*::-webkit-scrollbar-thumb:hover": {
              backgroundColor: palette.dimmed3,
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { textTransform: "none" },
        },
      },
    },
  });
};
