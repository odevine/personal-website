import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { resolveNode } from "@/content/filesystem";

export interface ViewerImage {
  name: string;
  src: string;
  bytes?: number;
}

interface ViewerState {
  images: ViewerImage[];
  index: number;
}

interface ViewerApi extends ViewerState {
  /** Shows a set of images, starting at one of them */
  show: (images: ViewerImage[], index: number) => void;
  select: (index: number) => void;
}

// With nothing opened yet the viewer browses the pictures folder
const defaultImages: ViewerImage[] = (
  resolveNode(["pictures"])?.children ?? []
).flatMap((node) =>
  node.src ? [{ name: node.name, src: node.src, bytes: node.bytes }] : [],
);

const ViewerContext = createContext<ViewerApi | null>(null);

export const ViewerProvider = ({ children }: PropsWithChildren) => {
  const [state, setState] = useState<ViewerState>({
    images: defaultImages,
    index: 0,
  });

  const show = useCallback(
    (images: ViewerImage[], index: number) => setState({ images, index }),
    [],
  );
  const select = useCallback(
    (index: number) => setState((current) => ({ ...current, index })),
    [],
  );

  const api = useMemo(
    () => ({ ...state, show, select }),
    [state, show, select],
  );

  return (
    <ViewerContext.Provider value={api}>{children}</ViewerContext.Provider>
  );
};

export const useViewer = (): ViewerApi => {
  const context = useContext(ViewerContext);
  if (!context) throw new Error("useViewer must be used inside ViewerProvider");
  return context;
};
