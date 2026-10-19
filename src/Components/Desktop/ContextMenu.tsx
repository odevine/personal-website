import {
  PropsWithChildren,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { CheckIcon } from "@/Components/ui/icons";
import styles from "./ContextMenu.module.css";

export type MenuEntry =
  | {
      type: "item";
      label: string;
      icon?: ReactNode;
      onClick: () => void;
      disabled?: boolean;
      /** Shows a check mark, for the current choice in a group */
      checked?: boolean;
    }
  | { type: "divider" }
  | { type: "label"; label: string };

interface Point {
  clientX: number;
  clientY: number;
}

interface ContextMenuApi {
  /** Opens a menu at a pointer position */
  show: (point: Point, entries: MenuEntry[]) => void;
}

const ContextMenuContext = createContext<ContextMenuApi>({ show: () => {} });

export const useContextMenu = () => useContext(ContextMenuContext);

const LONG_PRESS_MS = 500;
const LONG_PRESS_SLOP = 10;

// Copies text to the clipboard, falling back to a hidden textarea
export const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.append(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
};

// Owns the one open menu, hides the browser's own right-click menu on the
// desktop, and turns a long press on a touch screen into a right-click
export const ContextMenuProvider = ({ children }: PropsWithChildren) => {
  const [menu, setMenu] = useState<{
    id: number;
    x: number;
    y: number;
    entries: MenuEntry[];
  } | null>(null);
  // focus goes back where it was when the menu closes
  const returnFocus = useRef<HTMLElement | null>(null);

  const show = useCallback((point: Point, entries: MenuEntry[]) => {
    if (document.activeElement instanceof HTMLElement) {
      returnFocus.current = document.activeElement;
    }
    // each menu gets a fresh id, so opening one over another places it anew
    setMenu((current) => ({
      id: (current?.id ?? 0) + 1,
      x: point.clientX,
      y: point.clientY,
      entries,
    }));
  }, []);
  const close = () => setMenu(null);

  useEffect(() => {
    const prevent = (event: Event) => event.preventDefault();
    document.addEventListener("contextmenu", prevent);

    let timer: number | undefined;
    let press: { x: number; y: number; target: EventTarget | null } | undefined;
    const cancel = () => {
      window.clearTimeout(timer);
      press = undefined;
    };

    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== "touch") return;
      cancel();
      press = { x: event.clientX, y: event.clientY, target: event.target };
      timer = window.setTimeout(() => {
        if (!press) return;
        const { x, y, target } = press;
        press = undefined;
        target?.dispatchEvent(
          new MouseEvent("contextmenu", {
            bubbles: true,
            cancelable: true,
            clientX: x,
            clientY: y,
          }),
        );
        // lifting the finger afterwards should not also activate what was pressed
        const swallow = (event: Event) => {
          event.stopPropagation();
          event.preventDefault();
        };
        document.addEventListener("click", swallow, {
          capture: true,
          once: true,
        });
        window.setTimeout(
          () => document.removeEventListener("click", swallow, true),
          600,
        );
      }, LONG_PRESS_MS);
    };
    const onMove = (event: PointerEvent) => {
      if (
        press &&
        Math.hypot(event.clientX - press.x, event.clientY - press.y) >
          LONG_PRESS_SLOP
      ) {
        cancel();
      }
    };

    document.addEventListener("pointerdown", onDown);
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", cancel);
    document.addEventListener("pointercancel", cancel);
    return () => {
      document.removeEventListener("contextmenu", prevent);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", cancel);
      document.removeEventListener("pointercancel", cancel);
      cancel();
    };
  }, []);

  const api = useMemo(() => ({ show }), [show]);

  return (
    <ContextMenuContext.Provider value={api}>
      {children}
      {menu && (
        <DropdownMenu.Root
          key={menu.id}
          open
          onOpenChange={(open) => !open && close()}
        >
          {/* an empty anchor at the pointer, the menu opens from it */}
          <DropdownMenu.Trigger asChild>
            <span
              aria-hidden
              className={styles.anchor}
              style={{ left: menu.x, top: menu.y }}
            />
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className={styles.menu}
              side="bottom"
              align="start"
              collisionPadding={8}
              onCloseAutoFocus={(event) => {
                event.preventDefault();
                returnFocus.current?.focus();
              }}
            >
              {menu.entries.map((entry, i) => {
                if (entry.type === "divider") {
                  return (
                    <DropdownMenu.Separator
                      key={i}
                      className={styles.divider}
                    />
                  );
                }
                if (entry.type === "label") {
                  return (
                    <DropdownMenu.Label key={i} className={styles.label}>
                      {entry.label}
                    </DropdownMenu.Label>
                  );
                }
                return (
                  <DropdownMenu.Item
                    key={i}
                    className={styles.item}
                    disabled={entry.disabled}
                    onSelect={entry.onClick}
                  >
                    {entry.icon && (
                      <span className={styles.icon}>{entry.icon}</span>
                    )}
                    <span
                      className={entry.icon ? styles.text : styles.textInset}
                    >
                      {entry.label}
                    </span>
                    {entry.checked && <CheckIcon className={styles.check} />}
                  </DropdownMenu.Item>
                );
              })}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      )}
    </ContextMenuContext.Provider>
  );
};
