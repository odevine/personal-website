import { Settings, defaultSettings } from "@/settings";

// Syntax-highlight roles, mapped onto the Monokai accents below. Used to give
// the home-page button text a pseudo-code, multi-color look.
export type SyntaxToken =
  | "keyword"
  | "fn"
  | "string"
  | "number"
  | "operator"
  | "variable"
  | "punctuation";

export type SyntaxPalette = Record<SyntaxToken, string>;

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
  /** Only "light" for the Light filter */
  mode: "light" | "dark";
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

/** What the site falls back to when its theme file is deleted, not offered in the picker */
export const monochromeScheme: ColorScheme = {
  name: "monochrome",
  label: "Monochrome",
  mode: "dark",
  palette: {
    dark2: "#000000",
    dark1: "#000000",
    background: "#000000",
    text: "#ffffff",
    accent1: "#ffffff",
    accent2: "#d0d0d0",
    accent3: "#b0b0b0",
    accent4: "#e8e8e8",
    accent5: "#c0c0c0",
    accent6: "#ffffff",
    dimmed1: "#c0c0c0",
    dimmed2: "#999999",
    dimmed3: "#777777",
    dimmed4: "#555555",
    dimmed5: "#333333",
  },
};

/** Resolve a scheme by name, falling back to the default. */
export const getScheme = (name: string | null): ColorScheme =>
  colorSchemes.find((scheme) => scheme.name === name) ??
  colorSchemes.find((scheme) => scheme.name === defaultSchemeName) ??
  colorSchemes[0];

export const monoFont = '"Noto Mono", monospace';
const sansFont = '"Inter", system-ui, sans-serif';

// MUI's divider and state overlays, kept so the palettes look the same as before
const overlays = {
  dark: {
    divider: "rgba(255, 255, 255, 0.12)",
    disabled: "rgba(255, 255, 255, 0.5)",
    hover: "rgba(255, 255, 255, 0.08)",
    selected: "rgba(255, 255, 255, 0.16)",
    icon: "rgba(255, 255, 255, 0.56)",
    iconDisabled: "rgba(255, 255, 255, 0.3)",
  },
  light: {
    divider: "rgba(0, 0, 0, 0.12)",
    disabled: "rgba(0, 0, 0, 0.38)",
    hover: "rgba(0, 0, 0, 0.04)",
    selected: "rgba(0, 0, 0, 0.08)",
    icon: "rgba(0, 0, 0, 0.54)",
    iconDisabled: "rgba(0, 0, 0, 0.26)",
  },
};

/** The CSS custom properties for a Monokai Pro filter and the appearance settings */
export const themeVars = (
  scheme: ColorScheme,
  settings: Settings = defaultSettings,
): Record<string, string> => {
  const { palette } = scheme;
  const overlay = overlays[scheme.mode];
  const accent =
    settings.accent === "default" ? palette.accent6 : palette[settings.accent];
  // visible scrollbar thumb is 6px wide, so 3px is a full pill, plus the 3px inset border
  const thumb = Math.min(3, settings.radius * 0.3);
  const syntax: SyntaxPalette = {
    keyword: palette.accent1,
    fn: palette.accent4,
    string: palette.accent3,
    number: palette.accent6,
    operator: palette.accent2,
    variable: palette.text,
    punctuation: palette.dimmed2,
  };
  return {
    "--bg": palette.dark1,
    "--paper": palette.background,
    "--dark2": palette.dark2,
    "--text": palette.text,
    "--text-2": palette.dimmed1,
    "--text-disabled": overlay.disabled,
    "--divider": overlay.divider,
    "--hover": overlay.hover,
    "--selected": overlay.selected,
    "--icon": overlay.icon,
    "--icon-disabled": overlay.iconDisabled,
    "--primary": accent,
    "--secondary": palette.accent5,
    "--dimmed2": palette.dimmed2,
    "--dimmed3": palette.dimmed3,
    "--dimmed4": palette.dimmed4,
    ...Object.fromEntries(
      Object.entries(syntax).map(([token, color]) => [`--syntax-${token}`, color]),
    ),
    "--radius": `${settings.radius}px`,
    "--thumb-radius": `${thumb > 0 ? thumb + 3 : 0}px`,
    "--font-body": settings.font === "mono" ? monoFont : sansFont,
    "--fs": String(settings.fontSize / 14),
    "--window-opacity": `${settings.windowOpacity * 100}%`,
    "--window-glow": String(settings.windowGlow),
    "--backdrop-strength": String(
      (scheme.mode === "light" ? 0.75 : 1) * settings.backdropIntensity,
    ),
  };
};
