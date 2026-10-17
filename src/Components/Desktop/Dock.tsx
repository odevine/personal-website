import { PointerEvent, ReactNode, useRef, useState } from "react";
import { alpha, Box, IconButton, Stack, Tooltip } from "@mui/material";

import { AppId, appMeta } from "./appMeta";
import { MenuEntry, useContextMenu } from "./ContextMenu";

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
  const session = useRef<Session>();
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
    <Box
      component="nav"
      aria-label="applications"
      sx={{
        display: "flex",
        justifyContent: "center",
        pb: 1,
        pt: 0.5,
        // sits above windows that are dragged over it, without blocking clicks on the gaps
        position: "relative",
        zIndex: 1,
        pointerEvents: "none",
      }}
    >
      <Stack
        ref={container}
        direction="row"
        spacing={0.5}
        sx={{
          pointerEvents: "auto",
          px: 0.75,
          py: 0.5,
          borderRadius: (theme) => `${theme.shape.borderRadius * 1.5}px`,
          border: (theme) =>
            `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          backgroundColor: "background.paper",
          boxShadow: (theme) =>
            `0 8px 30px -12px ${alpha(theme.palette.primary.main, 0.4)}`,
        }}
      >
        {shown.map((appId) => {
          const dragging = drag?.appId === appId;
          return (
            <Tooltip
              key={appId}
              title={appMeta[appId].title}
              placement="top"
              disableHoverListener={Boolean(drag)}
            >
              <IconButton
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
                color={activeApp === appId ? "primary" : "default"}
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
                sx={{
                  position: "relative",
                  p: 0.75,
                  touchAction: "none",
                  borderRadius: (theme) => `${theme.shape.borderRadius}px`,
                  "& svg": { fontSize: 20 },
                  transition: "transform 120ms ease",
                  "&:hover": { transform: "translateY(-3px)" },
                  "@media (prefers-reduced-motion: reduce)": {
                    transition: "none",
                    "&:hover": { transform: "none" },
                  },
                }}
              >
                {icons[appId]}
                {openApps.has(appId) && (
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 2,
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      backgroundColor:
                        activeApp === appId ? "primary.main" : "text.secondary",
                    }}
                  />
                )}
              </IconButton>
            </Tooltip>
          );
        })}
      </Stack>
    </Box>
  );
};
