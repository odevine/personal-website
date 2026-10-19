import { PointerEvent, ReactNode, useRef, useState } from "react";

import { cx } from "@/Components/ui/cx";
import { Tooltip } from "@/Components/ui/Tooltip";

import { AppId, appMeta } from "./appMeta";
import { MenuEntry, useContextMenu } from "./ContextMenu";
import styles from "./Dock.module.css";

interface Props {
  apps: AppId[];
  icons: Record<AppId, ReactNode>;
  openApps: Set<AppId>;
  activeApp?: AppId;
  onSelect: (appId: AppId) => void;
  /** Called with the new order when an icon is dropped in a new place */
  onReorder: (order: AppId[], moved: AppId) => void;
  /** The right-click menu entries for an icon */
  getMenu: (appId: AppId) => MenuEntry[];
}

// Movement before a press turns into a drag, so plain clicks still select
const DRAG_THRESHOLD = 5;

interface Session {
  appId: AppId;
  startX: number;
  /** Left edge of every icon when the press began, and the distance between icons */
  lefts: number[];
  step: number;
  index: number;
  moved: boolean;
}

export const Dock = ({
  apps,
  icons,
  openApps,
  activeApp,
  onSelect,
  onReorder,
  getMenu,
}: Props) => {
  const { show } = useContextMenu();
  const [drag, setDrag] = useState<{
    appId: AppId;
    order: AppId[];
    offset: number;
  } | null>(null);
  const session = useRef<Session | undefined>(undefined);
  const suppressClick = useRef(false);
  const container = useRef<HTMLDivElement>(null);

  const shown = drag ? drag.order : apps;

  const onPointerDown = (event: PointerEvent<HTMLElement>, appId: AppId) => {
    if (event.button !== 0 || !container.current) return;
    const buttons = [
      ...container.current.querySelectorAll<HTMLElement>("[data-dock-app]"),
    ];
    const lefts = buttons.map((button) => button.getBoundingClientRect().left);
    event.currentTarget.setPointerCapture(event.pointerId);
    session.current = {
      appId,
      startX: event.clientX,
      lefts,
      step: lefts.length > 1 ? lefts[1] - lefts[0] : 1,
      index: apps.indexOf(appId),
      moved: false,
    };
  };

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const s = session.current;
    if (!s) return;
    const dx = event.clientX - s.startX;
    if (!s.moved && Math.abs(dx) < DRAG_THRESHOLD) return;
    s.moved = true;

    // the icon takes the slot nearest to where it is being held
    const held = s.lefts[s.index] + dx;
    const slot = Math.min(
      Math.max(Math.round((held - s.lefts[0]) / s.step), 0),
      apps.length - 1,
    );
    const order = apps.filter((id) => id !== s.appId);
    order.splice(slot, 0, s.appId);
    setDrag({
      appId: s.appId,
      order,
      // the icon is laid out in its new slot, so the offset is measured from there
      offset: held - (s.lefts[0] + slot * s.step),
    });
  };

  const finish = (commit: boolean) => {
    const s = session.current;
    session.current = undefined;
    if (!s?.moved) return;
    // the click that follows a drag should not open the app
    suppressClick.current = true;
    setTimeout(() => (suppressClick.current = false), 0);
    if (commit && drag && drag.order.some((id, i) => id !== apps[i])) {
      onReorder(drag.order, s.appId);
    }
    setDrag(null);
  };

  return (
    // sits above windows that are dragged over it, without blocking clicks on the gaps
    <nav aria-label="applications" className={styles.dock}>
      <div ref={container} className={styles.tray}>
        {shown.map((appId) => {
          const dragging = drag?.appId === appId;
          return (
            <Tooltip
              key={appId}
              title={appMeta[appId].title}
              disabled={Boolean(drag)}
            >
              <button
                type="button"
                data-dock-app={appId}
                onContextMenu={(event) => {
                  event.preventDefault();
                  show(event, getMenu(appId));
                }}
                onClick={() => !suppressClick.current && onSelect(appId)}
                onPointerDown={(event) => onPointerDown(event, appId)}
                onPointerMove={onPointerMove}
                onPointerUp={() => finish(true)}
                onPointerCancel={() => finish(false)}
                aria-label={`open ${appMeta[appId].title}`}
                className={cx(styles.app, activeApp === appId && styles.active)}
                // inline so it wins over the hover lift while an icon is held
                style={
                  dragging
                    ? {
                        transform: `translateX(${drag.offset}px) scale(1.15)`,
                        transition: "none",
                        zIndex: 2,
                        cursor: "grabbing",
                      }
                    : undefined
                }
              >
                {icons[appId]}
                {openApps.has(appId) && <span className={styles.dot} />}
              </button>
            </Tooltip>
          );
        })}
      </div>
    </nav>
  );
};
