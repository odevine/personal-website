import { useSyncExternalStore } from "react";

import { filesystemVersion, subscribeFilesystem } from "./filesystem";

// Re-renders a component when files are added or removed
export const useFilesystemVersion = () =>
  useSyncExternalStore(subscribeFilesystem, filesystemVersion);
