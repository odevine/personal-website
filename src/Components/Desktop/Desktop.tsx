import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { alpha, Box, useMediaQuery } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import RemoveIcon from "@mui/icons-material/Remove";
import { useTheme as useMuiTheme } from "@mui/material/styles";

import { unlock } from "@/achievements";
import { nodeExists } from "@/content/filesystem";
import { useFilesystemVersion } from "@/content/useFilesystem";
import { useTheme } from "@/ThemeContext";
import {
  AchievementWatchers,
  AchievementsFileSync,
} from "./AchievementEffects";
import { AchievementToast } from "./AchievementToast";
import { AppId, appIds, appMeta, dockAppIds } from "./appMeta";
import { Presence } from "./Presence";
import { appContent, appIcons } from "./apps/registry";
import { DesktopContext } from "./DesktopContext";
import { ContextMenuProvider, MenuEntry } from "./ContextMenu";
import { Dock } from "./Dock";
import { EditorProvider, FileView, useEditor } from "./EditorContext";
import {
  CustomCssSync,
  DOCK_PATH,
  DocumentNotes,
  useDockApps,
} from "./liveFiles";
import { ScreenMode, ScreenOverlay } from "./ScreenOverlay";
import { ThemeFileSync } from "./ThemeFileSync";
import { ViewerImage, ViewerProvider, useViewer } from "./ViewerContext";
import { Window } from "./Window";
import { Area, desktopReducer, initialState, topWindow } from "./windowReducer";

// Large soft shapes in the accent color that drift on slow, unsynchronized loops
const blobs = [
  {
    top: "-25%",
    left: "-15%",
    size: "75vmax",
    alpha: 0.3,
    duration: 53,
    path: [
      "translate(0, 0) scale(1)",
      "translate(22vw, 14vh) scale(1.2)",
      "translate(8vw, 30vh) scale(0.9)",
    ],
  },
  {
    top: "35%",
    left: "55%",
    size: "65vmax",
    alpha: 0.22,
    duration: 71,
    path: [
      "translate(0, 0) scale(1.1)",
      "translate(-30vw, -12vh) scale(0.9)",
      "translate(-10vw, 20vh) scale(1.25)",
    ],
  },
  {
    top: "55%",
    left: "-20%",
    size: "55vmax",
    alpha: 0.16,
    duration: 89,
    path: [
      "translate(0, 0) scale(0.9)",
      "translate(26vw, -20vh) scale(1.2)",
      "translate(40vw, 6vh) scale(1)",
    ],
  },
];

const AccentBackdrop = () => {
  const theme = useMuiTheme();
  const { settings } = useTheme();
  const strength =
    (theme.palette.mode === "light" ? 0.75 : 1) * settings.backdropIntensity;

  return (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {blobs.map((blob, i) => {
        const [from, mid, to] = blob.path;
        return (
          <Box
            key={i}
            sx={{
              position: "absolute",
              top: blob.top,
              left: blob.left,
              width: blob.size,
              height: blob.size,
              borderRadius: "50%",
              background: `radial-gradient(closest-side, ${alpha(theme.palette.primary.main, blob.alpha * strength)}, transparent)`,
              willChange: "transform",
              [`@keyframes drift${i}`]: {
                "0%, 100%": { transform: from },
                "33%": { transform: mid },
                "66%": { transform: to },
              },
              animation: `drift${i} ${blob.duration / Math.max(settings.backdropSpeed, 0.01)}s ease-in-out infinite`,
              animationPlayState:
                settings.backdropSpeed === 0 ? "paused" : "running",
            }}
          />
        );
      })}
    </Box>
  );
};

const DesktopShell = () => {
  const {
    openFile: openEditorFile,
    showView,
    editFile,
    tabs,
    closeFile,
  } = useEditor();
  const fsVersion = useFilesystemVersion();
  const [screen, setScreen] = useState<ScreenMode | null>(null);
  const { show: showImages } = useViewer();
  const theme = useMuiTheme();
  const { settings } = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("md"));
  const [state, dispatch] = useReducer(desktopReducer, initialState);
  const [area, setArea] = useState<Area>({ w: 0, h: 0 });
  const areaRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setArea({ w: entry.contentRect.width, h: entry.contentRect.height }),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const openApp = useCallback(
    (appId: AppId) => dispatch({ type: "open", appId, area }),
    [area],
  );

  const openFile = useCallback(
    (path: string, content?: string, view?: FileView) => {
      openEditorFile(path, content, view);
      dispatch({ type: "open", appId: "editor", area });
    },
    [openEditorFile, area],
  );

  const openFileAs = useCallback(
    (path: string, content: string, view: FileView) => {
      openEditorFile(path, content);
      showView(path, view);
      dispatch({ type: "open", appId: "editor", area });
    },
    [openEditorFile, showView, area],
  );

  const openImage = useCallback(
    (images: ViewerImage[], index: number) => {
      showImages(images, index);
      dispatch({ type: "open", appId: "viewer", area });
    },
    [showImages, area],
  );

  // Opens the starting windows once the area has been measured
  useEffect(() => {
    if (started.current || area.w === 0) return;
    started.current = true;
    const requested = new URLSearchParams(window.location.search).get("open");
    const deepLink = appIds.find((id) =>
      appMeta[id].aliases.includes(requested ?? ""),
    );
    // the first window lands somewhere in the middle half of the screen
    const near = () => 0.25 + Math.random() * 0.5;
    dispatch({
      type: "open",
      appId: deepLink ?? "about",
      area,
      centerAt: { x: near(), y: near() },
    });
  }, [area, mobile]);

  const [reveal, setReveal] = useState<{ path: string; nonce: number } | null>(
    null,
  );
  const revealInExplorer = useCallback(
    (path: string) => {
      setReveal((current) => ({ path, nonce: (current?.nonce ?? 0) + 1 }));
      dispatch({ type: "open", appId: "explorer", area });
    },
    [area],
  );

  // a tab closes when its file is deleted from the terminal
  useEffect(() => {
    tabs.forEach((path) => {
      if (!path.startsWith("untitled-") && !nodeExists(path.split("/"))) {
        closeFile(path);
      }
    });
  }, [tabs, closeFile, fsVersion]);

  const dockPresent = nodeExists(["system", "dock.json"]);
  // without system/gravity, windows float and keep whatever speed they have
  const zeroGravity = !nodeExists(["system", "gravity"]);
  // without system/animations, moving a window leaves copies of it behind
  const smear = !nodeExists(["system", "animations"]);
  const dockApps = useDockApps();

  const setDockApps = (apps: AppId[]) =>
    editFile(
      DOCK_PATH,
      JSON.stringify(
        { apps: apps.map((id) => appMeta[id].aliases[0]) },
        null,
        2,
      ) + "\n",
    );

  // Dropping an icon in a new place writes the order back to dock.json.
  // Apps that are only in the dock because they are open stay out of it,
  // unless that is the icon that was moved
  const reorderDock = (order: AppId[], moved: AppId) => {
    setDockApps(order.filter((id) => dockApps.includes(id) || id === moved));
    unlock("interior-designer");
  };

  // windows stay in state on mobile even when only the top one is shown
  useEffect(() => {
    if (
      dockAppIds.every((id) => state.windows.some((win) => win.appId === id))
    ) {
      unlock("full-house");
    }
  }, [state.windows]);

  const top = topWindow(state);
  const openApps = useMemo(
    () => new Set(state.windows.map((win) => win.appId)),
    [state.windows],
  );

  const selectFromDock = (appId: AppId) => {
    const win = state.windows.find((w) => w.appId === appId);
    if (win && !win.minimized && top?.appId === appId) {
      dispatch({ type: "minimize", appId });
    } else {
      openApp(appId);
    }
  };

  const dockMenu = (appId: AppId): MenuEntry[] => {
    const win = state.windows.find((w) => w.appId === appId);
    const pinned = dockApps.includes(appId);
    const entries: MenuEntry[] = [];
    if (!win) {
      entries.push({
        type: "item",
        label: "open",
        icon: <OpenInNewIcon fontSize="small" />,
        onClick: () => openApp(appId),
      });
    } else {
      entries.push({
        type: "item",
        label: win.minimized ? "restore" : "bring to front",
        icon: <OpenInNewIcon fontSize="small" />,
        onClick: () => openApp(appId),
      });
      if (!win.minimized) {
        entries.push({
          type: "item",
          label: "minimize",
          icon: <RemoveIcon fontSize="small" />,
          onClick: () => dispatch({ type: "minimize", appId }),
        });
      }
      entries.push({
        type: "item",
        label: "close window",
        icon: <CloseIcon fontSize="small" />,
        onClick: () => dispatch({ type: "close", appId }),
      });
    }
    entries.push(
      { type: "divider" },
      pinned
        ? {
            type: "item",
            label: "remove from dock",
            icon: <PushPinOutlinedIcon fontSize="small" />,
            // the explorer leads to every other app, so it always stays
            disabled: appId === "explorer",
            onClick: () => setDockApps(dockApps.filter((id) => id !== appId)),
          }
        : {
            type: "item",
            label: "keep in dock",
            icon: <PushPinIcon fontSize="small" />,
            onClick: () => setDockApps([...dockApps, appId]),
          },
    );
    return entries;
  };

  const line = theme.palette.divider;
  const pattern = {
    dots: `radial-gradient(${line} 1px, transparent 1px)`,
    grid: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`,
    none: "",
  }[settings.background];

  return (
    <DesktopContext.Provider
      value={{
        openApp,
        openFile,
        openFileAs,
        openImage,
        revealInExplorer,
        reveal,
        showScreen: setScreen,
      }}
    >
      <ThemeFileSync />
      <AchievementsFileSync />
      <AchievementWatchers />
      <CustomCssSync />
      <DocumentNotes />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
          position: "relative",
          backgroundColor: "background.default",
        }}
      >
        <AccentBackdrop />
        <Presence />
        {pattern && (
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              backgroundImage: pattern,
              backgroundSize: "24px 24px",
            }}
          />
        )}
        <Box
          ref={areaRef}
          sx={{
            position: "relative",
            flexGrow: 1,
            minHeight: 0,
            isolation: "isolate",
          }}
        >
          {state.windows.map((win) => (
            <Window
              key={win.appId}
              win={win}
              title={appMeta[win.appId].title}
              area={area}
              mobile={mobile}
              active={top?.appId === win.appId}
              visible={!mobile || top?.appId === win.appId}
              selfScrolling={appMeta[win.appId].selfScrolling}
              zeroGravity={zeroGravity}
              smear={smear}
              dispatch={dispatch}
            >
              {appContent[win.appId]()}
            </Window>
          ))}
          <AchievementToast />
        </Box>

        {dockPresent && (
          <Dock
            // apps that are open always have a dock icon, so they can be restored
            apps={[
              ...dockApps,
              ...state.windows
                .map((win) => win.appId)
                .filter((id) => !dockApps.includes(id)),
            ]}
            icons={appIcons}
            openApps={openApps}
            activeApp={top?.appId}
            onSelect={selectFromDock}
            onReorder={reorderDock}
            getMenu={dockMenu}
          />
        )}
      </Box>
      {screen && <ScreenOverlay mode={screen} />}
    </DesktopContext.Provider>
  );
};

export const Desktop = () => (
  <EditorProvider>
    <ViewerProvider>
      <ContextMenuProvider>
        <DesktopShell />
      </ContextMenuProvider>
    </ViewerProvider>
  </EditorProvider>
);
