export type AppId =
  "explorer" | "terminal" | "editor" | "about" | "viewer" | "settings";

export type Anchor = "center" | "left" | "right" | "top-left" | "top-right";

export interface AppMeta {
  title: string;
  /** Command name used by the terminal's `open` */
  aliases: string[];
  size: { w: number; h: number };
  anchor: Anchor;
  /** The app scrolls its own content, so the window body does not */
  selfScrolling?: boolean;
}

export const appMeta: Record<AppId, AppMeta> = {
  explorer: {
    title: "files",
    aliases: ["files", "explorer", "projects"],
    size: { w: 780, h: 460 },
    anchor: "center",
    selfScrolling: true,
  },
  terminal: {
    title: "terminal",
    aliases: ["terminal", "term"],
    size: { w: 520, h: 360 },
    anchor: "right",
  },
  editor: {
    title: "editor",
    aliases: ["editor", "code"],
    size: { w: 620, h: 520 },
    anchor: "right",
    selfScrolling: true,
  },
  about: {
    title: "about",
    aliases: ["about", "me"],
    size: { w: 460, h: 340 },
    anchor: "top-left",
  },
  viewer: {
    title: "viewer",
    aliases: ["viewer", "images", "gallery"],
    size: { w: 640, h: 500 },
    anchor: "center",
    selfScrolling: true,
  },
  settings: {
    title: "settings",
    aliases: ["settings", "theme"],
    size: { w: 440, h: 656 },
    anchor: "top-right",
  },
};

export const appIds = Object.keys(appMeta) as AppId[];
