import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";

import { persistedFiles, seedFiles } from "@/content/files";

// Files are keyed by path, so two README.md files can be open at once
interface EditorState {
  contents: Record<string, string>;
  originals: Record<string, string>;
  tabs: string[];
  /** Markdown files can be shown as the text or as a rendered preview */
  views: Record<string, FileView>;
  active: string | null;
  untitledCount: number;
  /** A short status line shown under the editor for a file */
  notes: Record<string, EditorNote>;
}

export type FileView = "edit" | "preview";

export interface EditorNote {
  level: "ok" | "warn" | "error";
  message: string;
}

type EditorAction =
  | { type: "open"; path: string; content?: string; view?: FileView }
  | { type: "show"; path: string; view: FileView }
  | { type: "close"; path: string }
  | { type: "edit"; path: string; content: string }
  | { type: "create" }
  | { type: "register"; path: string; content: string }
  | { type: "replace"; path: string; content: string }
  | { type: "markSaved"; path: string }
  | { type: "note"; path: string; note?: EditorNote };

const startPath = seedFiles[0].path;
const persistedPaths = persistedFiles;
const STORAGE_KEY = "files";

const loadPersisted = (): Record<string, string> => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
};

// A dock.json still holding an earlier default order is replaced by the current default
const legacyDockOrders = [
  ["about", "editor", "viewer", "terminal", "files", "settings", "edh"],
];

const isLegacyDock = (text: string) => {
  try {
    const apps = JSON.parse(text).apps;
    return legacyDockOrders.some(
      (order) => JSON.stringify(order) === JSON.stringify(apps),
    );
  } catch {
    return false;
  }
};

const createInitialState = (): EditorState => {
  const stored = loadPersisted();
  const contents: Record<string, string> = {};
  for (const file of seedFiles) {
    const path = file.path;
    // the dock file used to live in documents
    const saved =
      path === "system/dock.json"
        ? (stored[path] ?? stored["documents/dock.json"])
        : stored[path];
    const keepSaved =
      persistedPaths.includes(path) &&
      typeof saved === "string" &&
      !(path === "system/dock.json" && isLegacyDock(saved));
    contents[path] = keepSaved ? saved : file.content;
  }
  return {
    contents,
    originals: { ...contents },
    tabs: [startPath],
    views: {},
    active: startPath,
    untitledCount: 0,
    notes: {},
  };
};

const reducer = (state: EditorState, action: EditorAction): EditorState => {
  switch (action.type) {
    case "open": {
      const known = action.path in state.contents;
      if (!known && action.content === undefined) return state;
      return {
        ...state,
        contents: known
          ? state.contents
          : { ...state.contents, [action.path]: action.content ?? "" },
        originals: known
          ? state.originals
          : { ...state.originals, [action.path]: action.content ?? "" },
        // a view is only chosen when the tab is first opened
        views:
          action.view && !state.tabs.includes(action.path)
            ? { ...state.views, [action.path]: action.view }
            : state.views,
        tabs: state.tabs.includes(action.path)
          ? state.tabs
          : [...state.tabs, action.path],
        active: action.path,
      };
    }
    case "show":
      return {
        ...state,
        tabs: state.tabs.includes(action.path)
          ? state.tabs
          : [...state.tabs, action.path],
        views: { ...state.views, [action.path]: action.view },
        active: action.path,
      };
    case "close": {
      const index = state.tabs.indexOf(action.path);
      const tabs = state.tabs.filter((path) => path !== action.path);
      const active =
        state.active === action.path
          ? (tabs[Math.min(index, tabs.length - 1)] ?? null)
          : state.active;
      return { ...state, tabs, active };
    }
    case "edit":
      return {
        ...state,
        contents: { ...state.contents, [action.path]: action.content },
        // files kept in the browser are saved as they are typed
        originals: persistedPaths.includes(action.path)
          ? { ...state.originals, [action.path]: action.content }
          : state.originals,
      };
    case "register":
      // makes a file exist without opening a tab for it
      if (action.path in state.contents) return state;
      return {
        ...state,
        contents: { ...state.contents, [action.path]: action.content },
        originals: { ...state.originals, [action.path]: action.content },
      };
    case "replace":
      return {
        ...state,
        contents: { ...state.contents, [action.path]: action.content },
        originals: { ...state.originals, [action.path]: action.content },
      };
    case "markSaved":
      if (state.originals[action.path] === state.contents[action.path]) {
        return state;
      }
      return {
        ...state,
        originals: {
          ...state.originals,
          [action.path]: state.contents[action.path],
        },
      };
    case "note": {
      const current = state.notes[action.path];
      if (
        current?.level === action.note?.level &&
        current?.message === action.note?.message
      ) {
        return state;
      }
      const notes = { ...state.notes };
      if (action.note) notes[action.path] = action.note;
      else delete notes[action.path];
      return { ...state, notes };
    }
    case "create": {
      const untitledCount = state.untitledCount + 1;
      const path = `untitled-${untitledCount}`;
      return {
        ...state,
        untitledCount,
        contents: { ...state.contents, [path]: "" },
        originals: { ...state.originals, [path]: "" },
        tabs: [...state.tabs, path],
        active: path,
      };
    }
  }
};

interface EditorApi extends EditorState {
  /** Opens a file in a tab, content is needed the first time a path is opened */
  openFile: (path: string, content?: string, view?: FileView) => void;
  /** Switches a file between its text and its preview, bringing its tab forward */
  showView: (path: string, view: FileView) => void;
  closeFile: (path: string) => void;
  editFile: (path: string, content: string) => void;
  createFile: () => void;
  /** Adds a file without opening a tab, does nothing if it already exists */
  registerFile: (path: string, content: string) => void;
  /** Rewrites a file's content and treats it as saved */
  replaceFile: (path: string, content: string) => void;
  /** Treats the current content as the saved one */
  markSaved: (path: string) => void;
  setNote: (path: string, note?: EditorNote) => void;
  /** True when a file differs from the content it was opened with */
  isModified: (path: string) => boolean;
}

const EditorContext = createContext<EditorApi | null>(null);

export const EditorProvider = ({ children }: PropsWithChildren) => {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          Object.fromEntries(
            persistedPaths.map((path) => [path, state.contents[path]]),
          ),
        ),
      );
    } catch {
      // storage can be unavailable, edits then last for the session only
    }
  }, [state.contents]);

  const openFile = useCallback(
    (path: string, content?: string, view?: FileView) =>
      dispatch({ type: "open", path, content, view }),
    [],
  );
  const showView = useCallback(
    (path: string, view: FileView) => dispatch({ type: "show", path, view }),
    [],
  );
  const closeFile = useCallback(
    (path: string) => dispatch({ type: "close", path }),
    [],
  );
  const editFile = useCallback(
    (path: string, content: string) =>
      dispatch({ type: "edit", path, content }),
    [],
  );
  const createFile = useCallback(() => dispatch({ type: "create" }), []);

  const registerFile = useCallback(
    (path: string, content: string) =>
      dispatch({ type: "register", path, content }),
    [],
  );
  const replaceFile = useCallback(
    (path: string, content: string) =>
      dispatch({ type: "replace", path, content }),
    [],
  );
  const markSaved = useCallback(
    (path: string) => dispatch({ type: "markSaved", path }),
    [],
  );
  const setNote = useCallback(
    (path: string, note?: EditorNote) => dispatch({ type: "note", path, note }),
    [],
  );

  const api = useMemo<EditorApi>(
    () => ({
      ...state,
      openFile,
      showView,
      closeFile,
      editFile,
      createFile,
      registerFile,
      replaceFile,
      markSaved,
      setNote,
      isModified: (path) => state.contents[path] !== state.originals[path],
    }),
    [
      state,
      openFile,
      showView,
      closeFile,
      editFile,
      createFile,
      registerFile,
      replaceFile,
      markSaved,
      setNote,
    ],
  );

  return (
    <EditorContext.Provider value={api}>{children}</EditorContext.Provider>
  );
};

export const useEditor = (): EditorApi => {
  const context = useContext(EditorContext);
  if (!context) throw new Error("useEditor must be used inside EditorProvider");
  return context;
};
