import {
  MouseEvent as ReactMouseEvent,
  PropsWithChildren,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Divider,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

import { monoFont } from "@/themes";

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
    x: number;
    y: number;
    entries: MenuEntry[];
  } | null>(null);

  const show = useCallback(
    (point: Point, entries: MenuEntry[]) =>
      setMenu({ x: point.clientX, y: point.clientY, entries }),
    [],
  );
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
      <Menu
        open={Boolean(menu)}
        onClose={close}
        anchorReference="anchorPosition"
        anchorPosition={menu ? { top: menu.y, left: menu.x } : undefined}
        // a right-click outside the menu closes it instead of opening another
        slotProps={{
          root: {
            onContextMenu: (event: ReactMouseEvent) => {
              event.preventDefault();
              close();
            },
          },
          paper: {
            sx: {
              minWidth: 190,
              backgroundImage: "none",
              borderRadius: (theme) => `${theme.shape.borderRadius}px`,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              fontFamily: monoFont,
            },
          },
        }}
        MenuListProps={{ dense: true, sx: { py: 0.5 } }}
      >
        {menu?.entries.map((entry, i) => {
          if (entry.type === "divider") return <Divider key={i} />;
          if (entry.type === "label") {
            return (
              <ListSubheader
                key={i}
                disableSticky
                sx={{
                  lineHeight: "26px",
                  fontFamily: monoFont,
                  fontSize: 11,
                  background: "transparent",
                }}
              >
                {entry.label}
              </ListSubheader>
            );
          }
          return (
            <MenuItem
              key={i}
              disabled={entry.disabled}
              onClick={() => {
                close();
                entry.onClick();
              }}
              sx={{ fontFamily: monoFont, fontSize: 12.5, gap: 0.5 }}
            >
              {entry.icon && (
                <ListItemIcon sx={{ minWidth: 28, color: "inherit" }}>
                  {entry.icon}
                </ListItemIcon>
              )}
              <ListItemText
                primaryTypographyProps={{
                  sx: { fontSize: "inherit", fontFamily: "inherit" },
                }}
                sx={{ pl: entry.icon ? 0 : 3.5 }}
              >
                {entry.label}
              </ListItemText>
              {entry.checked && (
                <CheckIcon
                  sx={{ fontSize: 16, ml: 2, color: "primary.main" }}
                />
              )}
            </MenuItem>
          );
        })}
      </Menu>
    </ContextMenuContext.Provider>
  );
};
