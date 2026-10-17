import { useEffect, useMemo, useRef } from "react";

import { defaultDockText } from "@/content/files";
import { nodeExists } from "@/content/filesystem";
import { useFilesystemVersion } from "@/content/useFilesystem";
import { AppId, appIds, appMeta } from "./appMeta";
import { useEditor } from "./EditorContext";

export const ABOUT_PATH = "documents/about.md";
export const CUSTOM_CSS_PATH = "documents/custom.css";
export const NOTES_PATH = "documents/notes.md";
export const DOCK_PATH = "system/dock.json";

const resolveApp = (name: string): AppId | undefined =>
  appIds.find((id) => appMeta[id].aliases.includes(name));

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

// Notes for the files that are saved in the browser or shown elsewhere
export const DocumentNotes = () => {
  const { setNote } = useEditor();
  useEffect(() => {
    setNote(ABOUT_PATH, {
      level: "ok",
      message: "shown in the about window, saved in this browser",
    });
    setNote(NOTES_PATH, {
      level: "ok",
      message: "saved in this browser as you type",
    });
  }, [setNote]);
  return null;
};

// Applies custom.css to the whole page through a constructable stylesheet
export const CustomCssSync = () => {
  const { contents, setNote } = useEditor();
  useFilesystemVersion();
  // a deleted file stops applying
  const text = nodeExists(["documents", "custom.css"])
    ? (contents[CUSTOM_CSS_PATH] ?? "")
    : "";
  const sheet = useMemo(() => new CSSStyleSheet(), []);
  // ?nocss turns the file off in case it makes the page unusable
  const disabled = useMemo(
    () => new URLSearchParams(window.location.search).has("nocss"),
    [],
  );

  useEffect(() => {
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
    return () => {
      document.adoptedStyleSheets = document.adoptedStyleSheets.filter(
        (existing) => existing !== sheet,
      );
    };
  }, [sheet]);

  useEffect(() => {
    if (disabled) {
      sheet.replaceSync("");
      setNote(CUSTOM_CSS_PATH, {
        level: "warn",
        message: "turned off because the address has ?nocss",
      });
      return;
    }
    try {
      sheet.replaceSync(text);
      const rules = sheet.cssRules.length;
      setNote(CUSTOM_CSS_PATH, {
        level: "ok",
        message: rules
          ? `applied, ${rules} ${rules === 1 ? "rule" : "rules"}, saved in this browser`
          : "no rules yet, saved in this browser",
      });
    } catch (error) {
      setNote(CUSTOM_CSS_PATH, {
        level: "error",
        message: (error as Error).message,
      });
    }
  }, [text, sheet, disabled, setNote]);

  return null;
};

export type DockParse =
  | { ok: true; apps: AppId[]; warnings: string[] }
  | { ok: false; error: string };

export const parseDockFile = (text: string): DockParse => {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
  if (!isRecord(data) || !Array.isArray(data.apps)) {
    return { ok: false, error: 'expected an object with an "apps" list' };
  }

  const warnings: string[] = [];
  const apps: AppId[] = [];
  for (const entry of data.apps) {
    const id = typeof entry === "string" ? resolveApp(entry) : undefined;
    if (!id) warnings.push(`unknown app ${JSON.stringify(entry)}`);
    else if (!apps.includes(id)) apps.push(id);
  }
  // the explorer leads to every other app, so it is never removed
  if (!apps.includes("explorer")) {
    apps.push("explorer");
    warnings.push("files is always kept in the dock");
  }
  return { ok: true, apps, warnings };
};

// The apps shown in the dock, following dock.json and keeping the last valid list
export const useDockApps = (): AppId[] => {
  const { contents, setNote } = useEditor();
  const text = contents[DOCK_PATH] ?? defaultDockText;
  const last = useRef<AppId[]>(appIds);

  const parsed = useMemo(() => parseDockFile(text), [text]);
  if (parsed.ok) last.current = parsed.apps;

  useEffect(() => {
    if (!parsed.ok) {
      setNote(DOCK_PATH, {
        level: "error",
        message: `invalid dock, ${parsed.error}`,
      });
    } else {
      setNote(
        DOCK_PATH,
        parsed.warnings.length
          ? { level: "warn", message: `applied, ${parsed.warnings.join(", ")}` }
          : { level: "ok", message: "applied, saved in this browser" },
      );
    }
  }, [parsed, setNote]);

  return last.current;
};
