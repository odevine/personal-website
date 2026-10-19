import { MAX_RADIUS, Settings, accentKeys, defaultSettings } from "@/settings";
import { colorSchemes, defaultSchemeName } from "@/themes";

export interface ThemeFileValues {
  scheme?: string;
  settings: Partial<Settings>;
}

export type ThemeFileParse =
  | { ok: true; values: ThemeFileValues; warnings: string[] }
  | { ok: false; error: string };

const schemeNames = colorSchemes.map((scheme) => scheme.name);
const round = (value: number) => Math.round(value * 100) / 100;

// The text a settings object is written out as
export const themeFileText = (scheme: string, settings: Settings): string =>
  JSON.stringify(
    {
      scheme,
      accent: settings.accent,
      font: settings.font,
      fontSize: settings.fontSize,
      radius: settings.radius,
      windowOpacity: round(settings.windowOpacity),
      windowGlow: round(settings.windowGlow),
      background: settings.background,
      backdropGlow: round(settings.backdropIntensity),
      backdropSpeed: round(settings.backdropSpeed),
      reduceMotion: settings.reduceMotion,
    },
    null,
    2,
  ) + "\n";

export const defaultThemeFileText = themeFileText(
  defaultSchemeName,
  defaultSettings,
);

type Warnings = string[];

const choice = <T extends string>(
  key: string,
  value: unknown,
  options: readonly T[],
  warnings: Warnings,
): T | undefined => {
  if (options.includes(value as T)) return value as T;
  warnings.push(`${key} must be one of ${options.join(", ")}`);
  return undefined;
};

const range = (
  key: string,
  value: unknown,
  min: number,
  max: number,
  warnings: Warnings,
): number | undefined => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    warnings.push(`${key} must be a number`);
    return undefined;
  }
  const clamped = Math.min(Math.max(value, min), max);
  if (clamped !== value) warnings.push(`${key} limited to ${min} to ${max}`);
  return clamped;
};

const known = [
  "scheme",
  "accent",
  "font",
  "fontSize",
  "radius",
  "windowOpacity",
  "windowGlow",
  "background",
  "backdropGlow",
  "backdropSpeed",
  "reduceMotion",
];

// Reads the file's text, keeping every valid value and warning about the rest
export const parseThemeFile = (text: string): ThemeFileParse => {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return { ok: false, error: "expected an object" };
  }

  const input = data as Record<string, unknown>;
  const warnings: Warnings = [];
  const settings: Partial<Settings> = {};
  const has = (key: string) => key in input;

  for (const key of Object.keys(input)) {
    if (!known.includes(key)) warnings.push(`unknown key ${key}`);
  }

  const scheme = has("scheme")
    ? choice("scheme", input.scheme, schemeNames, warnings)
    : undefined;
  const set = <K extends keyof Settings>(key: K, value?: Settings[K]) => {
    if (value !== undefined) settings[key] = value;
  };

  if (has("accent")) {
    set("accent", choice("accent", input.accent, accentKeys, warnings));
  }
  if (has("font")) {
    set(
      "font",
      choice("font", input.font, ["sans", "mono"] as const, warnings),
    );
  }
  if (has("fontSize")) {
    set("fontSize", range("fontSize", input.fontSize, 12, 18, warnings));
  }
  if (has("radius")) {
    set("radius", range("radius", input.radius, 0, MAX_RADIUS, warnings));
  }
  if (has("windowOpacity")) {
    set(
      "windowOpacity",
      range("windowOpacity", input.windowOpacity, 0.5, 1, warnings),
    );
  }
  if (has("windowGlow")) {
    set("windowGlow", range("windowGlow", input.windowGlow, 0, 2, warnings));
  }
  if (has("background")) {
    set(
      "background",
      choice(
        "background",
        input.background,
        ["dots", "grid", "none"] as const,
        warnings,
      ),
    );
  }
  if (has("backdropGlow")) {
    set(
      "backdropIntensity",
      range("backdropGlow", input.backdropGlow, 0, 2, warnings),
    );
  }
  if (has("backdropSpeed")) {
    set(
      "backdropSpeed",
      range("backdropSpeed", input.backdropSpeed, 0, 4, warnings),
    );
  }
  if (has("reduceMotion")) {
    if (typeof input.reduceMotion === "boolean") {
      settings.reduceMotion = input.reduceMotion;
    } else {
      warnings.push("reduceMotion must be true or false");
    }
  }

  return { ok: true, values: { scheme, settings }, warnings };
};

// True when every value the file sets is already what the site uses
export const matchesCurrent = (
  values: ThemeFileValues,
  scheme: string,
  settings: Settings,
): boolean =>
  (values.scheme === undefined || values.scheme === scheme) &&
  (Object.entries(values.settings) as Array<[keyof Settings, unknown]>).every(
    ([key, value]) => settings[key] === value,
  );
