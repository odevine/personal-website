import { useEffect, useRef } from "react";

import { useTheme } from "@/ThemeContext";
import { matchesCurrent, parseThemeFile, themeFileText } from "@/themeFile";
import { useEditor } from "./EditorContext";

export const THEME_FILE_PATH = "system/theme.json";

// Keeps documents/theme.json and the site's appearance settings in step.
// Valid edits to the file are applied as they are typed, and changes made in
// the settings app are written back into the file.
export const ThemeFileSync = () => {
  const { scheme, setScheme, settings, updateSettings, themeMissing } =
    useTheme();
  const { contents, registerFile, replaceFile, markSaved, setNote } =
    useEditor();
  const text = contents[THEME_FILE_PATH];
  const latestText = useRef(text);
  latestText.current = text;
  // texts this sync wrote that have not come back yet. Reading them back into the
  // settings races quick slider changes and flips between two values forever
  const pending = useRef<string[]>([]);

  // settings to file
  useEffect(() => {
    // the settings shown while the file is deleted are not the real ones
    if (themeMissing) return;
    const canonical = themeFileText(scheme, settings);
    const current = latestText.current;
    if (current === undefined) {
      pending.current.push(canonical);
      registerFile(THEME_FILE_PATH, canonical);
      return;
    }
    const parsed = parseThemeFile(current);
    if (parsed.ok && matchesCurrent(parsed.values, scheme, settings)) return;
    pending.current.push(canonical);
    replaceFile(THEME_FILE_PATH, canonical);
  }, [scheme, settings, themeMissing, registerFile, replaceFile]);

  // file to settings
  useEffect(() => {
    if (text === undefined || themeMissing) return;
    const parsed = parseThemeFile(text);
    if (!parsed.ok) {
      setNote(THEME_FILE_PATH, {
        level: "error",
        message: `invalid json, ${parsed.error}`,
      });
      return;
    }

    const { values, warnings } = parsed;
    // writes arrive in order, so this one and any older ones are done
    const own = pending.current.indexOf(text);
    if (own !== -1) pending.current.splice(0, own + 1);
    if (own === -1 && !matchesCurrent(values, scheme, settings)) {
      if (values.scheme !== undefined) setScheme(values.scheme);
      updateSettings(values.settings);
    }
    markSaved(THEME_FILE_PATH);
    setNote(
      THEME_FILE_PATH,
      warnings.length
        ? { level: "warn", message: `applied, ${warnings.join(", ")}` }
        : { level: "ok", message: "applied" },
    );
    // only a change to the file's text should send values back into the settings
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, themeMissing]);

  return null;
};
