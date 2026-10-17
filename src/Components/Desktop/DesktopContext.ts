import { createContext, useContext } from "react";

import { AppId } from "./appMeta";
import type { FileView } from "./EditorContext";
import type { ScreenMode } from "./ScreenOverlay";
import type { ViewerImage } from "./ViewerContext";

export const DesktopContext = createContext({
  /** Opens an app's window, or restores and focuses it if already open */
  openApp: (_appId: AppId) => {},
  /** Opens a file in the editor, bringing its window forward */
  openFile: (_path: string, _content?: string, _view?: FileView) => {},
  /** Like openFile, but always shows the chosen half of a markdown file */
  openFileAs: (_path: string, _content: string, _view: FileView) => {},
  /** Opens an image in the viewer, with its siblings to browse */
  openImage: (_images: ViewerImage[], _index: number) => {},
  /** Covers the page with a fake panic, boot or power-off screen that ends in a reload */
  showScreen: (_mode: ScreenMode) => {},
  /** Opens the explorer at a file and selects it */
  revealInExplorer: (_path: string) => {},
  /** The latest reveal request, the nonce changes for every request */
  reveal: null as { path: string; nonce: number } | null,
});

export const useDesktop = () => useContext(DesktopContext);
