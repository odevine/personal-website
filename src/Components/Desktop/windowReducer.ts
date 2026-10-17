import { AppId, Anchor, appMeta } from "./appMeta";

export interface Area {
  w: number;
  h: number;
}

export interface WindowState {
  appId: AppId;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
}

export interface DesktopState {
  windows: WindowState[];
  nextZ: number;
}

export type DesktopAction =
  | { type: "open"; appId: AppId; area: Area }
  | { type: "focus"; appId: AppId }
  | { type: "close"; appId: AppId }
  | { type: "minimize"; appId: AppId }
  | { type: "toggleMaximize"; appId: AppId }
  | { type: "restoreAt"; appId: AppId; x: number; y: number }
  | { type: "move"; appId: AppId; x: number; y: number }
  | {
      type: "resize";
      appId: AppId;
      x: number;
      y: number;
      w: number;
      h: number;
    };

export const MIN_W = 320;
export const MIN_H = 200;
const MARGIN = 24;
const CASCADE = 28;

export const initialState: DesktopState = { windows: [], nextZ: 1 };

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), Math.max(min, max));

const place = (anchor: Anchor, w: number, h: number, area: Area, n: number) => {
  const cascade = n * CASCADE;
  switch (anchor) {
    case "top-left":
      return { x: MARGIN, y: MARGIN };
    case "left":
      return { x: MARGIN, y: (area.h - h) / 2 };
    case "right":
      return { x: area.w - w - MARGIN, y: area.h - h - MARGIN };
    case "top-right":
      return { x: area.w - w - MARGIN, y: MARGIN };
    default:
      return {
        x: (area.w - w) / 2 + cascade,
        y: (area.h - h) / 2 + cascade,
      };
  }
};

// Applies an update to one window, leaving the others untouched
const update = (
  state: DesktopState,
  appId: AppId,
  change: (win: WindowState) => Partial<WindowState>,
): DesktopState => ({
  ...state,
  windows: state.windows.map((win) =>
    win.appId === appId ? { ...win, ...change(win) } : win,
  ),
});

export const desktopReducer = (
  state: DesktopState,
  action: DesktopAction,
): DesktopState => {
  switch (action.type) {
    case "open": {
      const existing = state.windows.find((win) => win.appId === action.appId);
      if (existing) {
        return {
          ...update(state, action.appId, () => ({
            minimized: false,
            z: state.nextZ,
          })),
          nextZ: state.nextZ + 1,
        };
      }

      const { size, anchor } = appMeta[action.appId];
      const w = Math.min(size.w, action.area.w - MARGIN);
      const h = Math.min(size.h, action.area.h - MARGIN);
      const { x, y } = place(anchor, w, h, action.area, state.windows.length);
      const win: WindowState = {
        appId: action.appId,
        x: clamp(x, 0, action.area.w - w),
        y: clamp(y, 0, action.area.h - h),
        w,
        h,
        z: state.nextZ,
        minimized: false,
        maximized: false,
      };
      return { windows: [...state.windows, win], nextZ: state.nextZ + 1 };
    }
    case "focus":
      return {
        ...update(state, action.appId, () => ({ z: state.nextZ })),
        nextZ: state.nextZ + 1,
      };
    case "close":
      return {
        ...state,
        windows: state.windows.filter((win) => win.appId !== action.appId),
      };
    case "minimize":
      return update(state, action.appId, () => ({ minimized: true }));
    case "toggleMaximize":
      return update(state, action.appId, (win) => ({
        maximized: !win.maximized,
      }));
    case "restoreAt":
      return update(state, action.appId, () => ({
        maximized: false,
        x: action.x,
        y: action.y,
      }));
    case "move":
      return update(state, action.appId, () => ({
        x: action.x,
        y: action.y,
      }));
    case "resize":
      return update(state, action.appId, () => ({
        x: action.x,
        y: action.y,
        w: action.w,
        h: action.h,
      }));
  }
};

// The visible window with the highest z-index
export const topWindow = (state: DesktopState): WindowState | undefined =>
  state.windows.filter((win) => !win.minimized).sort((a, b) => b.z - a.z)[0];
