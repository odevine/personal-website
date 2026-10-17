import {
  Dispatch,
  PointerEvent,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from "react";
import { alpha, Box, Stack, Theme, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FilterNoneIcon from "@mui/icons-material/FilterNone";
import RemoveIcon from "@mui/icons-material/Remove";

import { reducedMotion } from "@/motion";
import { useContextMenu } from "./ContextMenu";
import { useTheme } from "@/ThemeContext";
import { SyntaxToken, monoFont } from "@/themes";
import {
  Area,
  DesktopAction,
  MIN_H,
  MIN_W,
  WindowState,
} from "./windowReducer";

interface Props extends PropsWithChildren {
  win: WindowState;
  title: string;
  area: Area;
  mobile: boolean;
  active: boolean;
  visible: boolean;
  selfScrolling?: boolean;
  /** No friction, so windows keep moving and bounce off the edges without losing speed */
  zeroGravity?: boolean;
  dispatch: Dispatch<DesktopAction>;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), Math.max(min, max));

// Distance of the resize grip from the corner, so it clears the rounded edge
const gripInset = (theme: Theme) =>
  Math.max(4, theme.shape.borderRadius * 0.6 + 3);

const MINIMIZE_MS = 280;
// Fraction of its size a window shrinks to while retracting into the dock
const MINIMIZED_SCALE = 0.08;

// Keeps this much of the title bar on screen while dragging
const GRAB = 80;

// Throwing a window. Speeds are in pixels per millisecond
const THROW_MIN_SPEED = 0.4;
const THROW_MAX_SPEED = 3.5;
const THROW_FRICTION = 0.0028;
// Share of its speed a window keeps after hitting an edge
const THROW_BOUNCE = 0.72;
const THROW_STOP_SPEED = 0.03;
// How much of the drag before release counts towards the throw
const SAMPLE_WINDOW_MS = 100;
// Without gravity any release speed is kept, windows start out drifting slowly,
// and are never still, a window let go of with less than the floor speed drifts at the floor
const ZERO_G_FLOOR = 0.012;
const ZERO_G_DRIFT_MIN = 0.02;
const ZERO_G_DRIFT_MAX = 0.04;

type Control = "close" | "minimize" | "maximize";

const controlPaths = {
  close: "M3 3l6 6M9 3l-6 6",
  minimize: "M3 6h6",
  maximize: "M7.5 2.5h2v2M9.5 2.5L7 5M4.5 9.5h-2v-2M2.5 9.5L5 7",
  restore: "M9.5 5h-2v-2M7.5 5L10 2.5M2.5 7h2v2M4.5 7L2 9.5",
};

const lights: Array<{ token: SyntaxToken; label: Control }> = [
  { token: "keyword", label: "close" },
  { token: "string", label: "minimize" },
  { token: "fn", label: "maximize" },
];

export const Window = ({
  win,
  title,
  area,
  mobile,
  active,
  visible,
  selfScrolling,
  zeroGravity = false,
  dispatch,
  children,
}: Props) => {
  const { appId } = win;
  const { settings } = useTheme();
  const { show } = useContextMenu();
  const glass = settings.windowOpacity < 1;
  const drag = useRef<{
    sx: number;
    sy: number;
    ox: number;
    oy: number;
    fromMaximized: boolean;
  }>();
  const rootRef = useRef<HTMLDivElement>(null);
  const samples = useRef<Array<{ t: number; x: number; y: number }>>([]);
  const glide = useRef<number>();
  const size = useRef<{ sx: number; sy: number; ow: number; oh: number }>();
  const fullscreen = mobile || win.maximized;
  const latest = useRef({ win, area, zero: zeroGravity, fullscreen });
  latest.current = { win, area, zero: zeroGravity, fullscreen };
  const frame = fullscreen ? { x: 0, y: 0, w: area.w, h: area.h } : win;

  // Transitions are only enabled around a minimize or restore so dragging stays immediate
  const [lastMinimized, setLastMinimized] = useState(win.minimized);
  const [animating, setAnimating] = useState(false);
  if (lastMinimized !== win.minimized) {
    setLastMinimized(win.minimized);
    setAnimating(!mobile && !reducedMotion());
  }
  useEffect(() => {
    if (!animating) return;
    const id = setTimeout(() => setAnimating(false), MINIMIZE_MS + 40);
    return () => clearTimeout(id);
  }, [animating]);

  const hidden = win.minimized && !animating;

  // Where the window retracts to: the center of its dock icon, in area coordinates
  const minimizedTransform = () => {
    const icon = document.querySelector(`[data-dock-app="${appId}"]`);
    const areaBounds = rootRef.current?.parentElement?.getBoundingClientRect();
    if (!icon || !areaBounds) return undefined;
    const bounds = icon.getBoundingClientRect();
    const cx = bounds.left + bounds.width / 2 - areaBounds.left;
    const cy = bounds.top + bounds.height / 2 - areaBounds.top;
    const x = cx - (frame.w * MINIMIZED_SCALE) / 2;
    const y = cy - (frame.h * MINIMIZED_SCALE) / 2;
    return `translate(${x}px, ${y}px) scale(${MINIMIZED_SCALE})`;
  };

  const stopGlide = () => {
    if (glide.current !== undefined) cancelAnimationFrame(glide.current);
    glide.current = undefined;
  };
  useEffect(() => stopGlide, []);
  // a window that is maximized or minimized stops where it is
  useEffect(() => {
    if (win.maximized || win.minimized) stopGlide();
  }, [win.maximized, win.minimized]);

  // Without gravity a window that has stopped is set drifting again, slowly and at random
  const resumeDrift = (min = ZERO_G_DRIFT_MIN, max = ZERO_G_DRIFT_MAX) => {
    const { zero, fullscreen: full, win: current } = latest.current;
    if (!zero || full || current.minimized || reducedMotion()) return;
    if (glide.current !== undefined) return;
    const angle = Math.random() * Math.PI * 2;
    const speed = min + Math.random() * (max - min);
    startGlide(Math.cos(angle) * speed, Math.sin(angle) * speed);
  };

  // Taking gravity away sets every open window drifting
  useEffect(() => {
    resumeDrift();
    // only the gravity or the window's mode changing should start a drift
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zeroGravity, fullscreen, win.minimized]);

  // Slides the window on with the speed it was let go at, bouncing off the edges
  const startGlide = (startVx: number, startVy: number) => {
    stopGlide();
    let vx = startVx;
    let vy = startVy;
    let { x, y } = latest.current.win;
    let previous = performance.now();

    const step = (now: number) => {
      const dt = Math.min(now - previous, 32);
      previous = now;
      const { win: current, area: bounds } = latest.current;
      const zero = latest.current.zero;
      if (!zero) {
        const decay = Math.exp(-THROW_FRICTION * dt);
        vx *= decay;
        vy *= decay;
      }
      const bounce = zero ? 1 : THROW_BOUNCE;
      x += vx * dt;
      y += vy * dt;

      const maxX = Math.max(0, bounds.w - current.w);
      const maxY = Math.max(0, bounds.h - current.h);
      if (x < 0) {
        x = 0;
        vx = Math.abs(vx) * bounce;
      } else if (x > maxX) {
        x = maxX;
        vx = -Math.abs(vx) * bounce;
      }
      if (y < 0) {
        y = 0;
        vy = Math.abs(vy) * bounce;
      } else if (y > maxY) {
        y = maxY;
        vy = -Math.abs(vy) * bounce;
      }

      dispatch({ type: "move", appId, x, y });
      // with gravity a window comes to rest, without it the motion never ends
      glide.current =
        Math.hypot(vx, vy) > (latest.current.zero ? 0 : THROW_STOP_SPEED)
          ? requestAnimationFrame(step)
          : undefined;
    };
    glide.current = requestAnimationFrame(step);
  };

  // Letting go while still moving fast throws the window
  const releaseDrag = (event: PointerEvent<HTMLDivElement>) => {
    const wasDragging = drag.current;
    drag.current = undefined;
    const recent = samples.current.filter(
      (sample) => event.timeStamp - sample.t <= SAMPLE_WINDOW_MS,
    );
    samples.current = [];
    if (!wasDragging || reducedMotion()) return;

    let vx = 0;
    let vy = 0;
    if (recent.length >= 2) {
      const first = recent[0];
      const last = recent[recent.length - 1];
      const dt = last.t - first.t;
      if (dt > 0) {
        vx = (last.x - first.x) / dt;
        vy = (last.y - first.y) / dt;
      }
    }
    let speed = Math.hypot(vx, vy);

    if (zeroGravity) {
      // any speed is kept, and a window let go of at rest still drifts a little
      if (speed < ZERO_G_FLOOR) {
        const angle =
          speed > 0 ? Math.atan2(vy, vx) : Math.random() * Math.PI * 2;
        vx = Math.cos(angle) * ZERO_G_FLOOR;
        vy = Math.sin(angle) * ZERO_G_FLOOR;
        speed = ZERO_G_FLOOR;
      }
    } else if (speed < THROW_MIN_SPEED) {
      return;
    }
    if (speed > THROW_MAX_SPEED) {
      vx *= THROW_MAX_SPEED / speed;
      vy *= THROW_MAX_SPEED / speed;
    }
    startGlide(vx, vy);
  };

  const focus = () => {
    // grabbing a window that is gliding stops it
    stopGlide();
    dispatch({ type: "focus", appId });
  };

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (mobile || event.button !== 0) return;
    if ((event.target as HTMLElement).closest("button")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    stopGlide();
    samples.current = [
      { t: event.timeStamp, x: event.clientX, y: event.clientY },
    ];
    drag.current = {
      sx: event.clientX,
      sy: event.clientY,
      ox: win.x,
      oy: win.y,
      fromMaximized: win.maximized,
    };
  };

  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    samples.current = [
      ...samples.current.filter(
        (sample) => event.timeStamp - sample.t <= SAMPLE_WINDOW_MS,
      ),
      { t: event.timeStamp, x: event.clientX, y: event.clientY },
    ];

    if (d.fromMaximized) {
      if (Math.hypot(event.clientX - d.sx, event.clientY - d.sy) < 4) return;
      // Restore the pre-maximized size, keeping the grab point under the cursor
      const bounds = rootRef.current?.parentElement?.getBoundingClientRect();
      const left = bounds?.left ?? 0;
      const top = bounds?.top ?? 0;
      const grab = (event.clientX - left) / area.w;
      const x = clamp(
        event.clientX - left - grab * win.w,
        GRAB - win.w,
        area.w - GRAB,
      );
      const y = clamp(event.clientY - top - 18, 0, area.h - 40);
      dispatch({ type: "restoreAt", appId, x, y });
      drag.current = {
        sx: event.clientX,
        sy: event.clientY,
        ox: x,
        oy: y,
        fromMaximized: false,
      };
      return;
    }

    dispatch({
      type: "move",
      appId,
      x: clamp(d.ox + event.clientX - d.sx, GRAB - win.w, area.w - GRAB),
      y: clamp(d.oy + event.clientY - d.sy, 0, area.h - 40),
    });
  };

  const startResize = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    size.current = {
      sx: event.clientX,
      sy: event.clientY,
      ow: win.w,
      oh: win.h,
    };
    focus();
  };

  const moveResize = (event: PointerEvent<HTMLDivElement>) => {
    const s = size.current;
    if (!s) return;
    dispatch({
      type: "resize",
      appId,
      x: win.x,
      y: win.y,
      w: clamp(s.ow + event.clientX - s.sx, MIN_W, area.w - win.x),
      h: clamp(s.oh + event.clientY - s.sy, MIN_H, area.h - win.y),
    });
  };

  const control = (token: SyntaxToken, label: Control) => {
    const act = {
      close: () => dispatch({ type: "close", appId }),
      minimize: () => dispatch({ type: "minimize", appId }),
      maximize: () => dispatch({ type: "toggleMaximize", appId }),
    }[label];

    if (mobile && label === "maximize") return null;
    return (
      <Box
        key={label}
        component="button"
        type="button"
        aria-label={label}
        onClick={act}
        sx={{
          display: "grid",
          placeItems: "center",
          width: 13,
          height: 13,
          p: 0,
          border: 0,
          borderRadius: "50%",
          cursor: "pointer",
          color: (theme) => alpha(theme.palette.common.black, 0.65),
          backgroundColor: (theme) => theme.palette.syntax[token],
          opacity: active ? 1 : 0.5,
          "&:focus-visible": {
            outline: "2px solid",
            outlineColor: "text.primary",
          },
        }}
      >
        <svg
          className="control-icon"
          width="9"
          height="9"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d={
              controlPaths[
                label === "maximize" && win.maximized ? "restore" : label
              ]
            }
          />
        </svg>
      </Box>
    );
  };

  return (
    <Box
      ref={rootRef}
      aria-hidden={hidden || undefined}
      onPointerDown={focus}
      onPointerUp={() => resumeDrift()}
      onPointerCancel={() => resumeDrift()}
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: frame.w,
        height: frame.h,
        transformOrigin: "0 0",
        transform: win.minimized
          ? (minimizedTransform() ?? `translate(${frame.x}px, ${frame.y}px)`)
          : `translate(${frame.x}px, ${frame.y}px)`,
        opacity: win.minimized ? 0 : 1,
        visibility: hidden ? "hidden" : "visible",
        pointerEvents: win.minimized ? "none" : "auto",
        transition: animating
          ? `transform ${MINIMIZE_MS}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${MINIMIZE_MS * 0.8}ms ease`
          : "none",
        zIndex: win.z,
        display: visible ? "flex" : "none",
        flexDirection: "column",
        overflow: "hidden",
        borderRadius: fullscreen ? 0 : 2,
        border: (theme) =>
          `1px solid ${active ? alpha(theme.palette.primary.main, 0.45) : theme.palette.divider}`,
        backgroundColor: (theme) =>
          alpha(theme.palette.background.paper, settings.windowOpacity),
        // faint accent sheen from the top left corner
        backgroundImage: (theme) =>
          `linear-gradient(155deg, ${alpha(theme.palette.primary.main, 0.07)}, transparent 45%)`,
        backdropFilter: glass ? "blur(14px)" : undefined,
        boxShadow: (theme) =>
          [
            `0 ${active ? 32 : 12}px ${active ? 70 : 30}px -20px ${theme.palette.common.black}${active ? "cc" : "66"}`,
            active
              ? `0 0 48px -12px ${alpha(theme.palette.primary.main, 0.35)}`
              : "",
          ]
            .filter(Boolean)
            .join(", "),
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={releaseDrag}
        onPointerCancel={() => {
          drag.current = undefined;
          samples.current = [];
        }}
        onDoubleClick={() =>
          !mobile && dispatch({ type: "toggleMaximize", appId })
        }
        onContextMenu={(event) => {
          event.preventDefault();
          show(event, [
            {
              type: "item",
              label: "minimize",
              icon: <RemoveIcon fontSize="small" />,
              onClick: () => dispatch({ type: "minimize", appId }),
            },
            ...(mobile
              ? []
              : [
                  {
                    type: "item" as const,
                    label: win.maximized ? "restore" : "maximize",
                    icon: <FilterNoneIcon fontSize="small" />,
                    onClick: () => dispatch({ type: "toggleMaximize", appId }),
                  },
                ]),
            { type: "divider" },
            {
              type: "item",
              label: "close",
              icon: <CloseIcon fontSize="small" />,
              onClick: () => dispatch({ type: "close", appId }),
            },
          ]);
        }}
        sx={{
          flexShrink: 0,
          px: 2,
          py: 1.25,
          userSelect: "none",
          touchAction: "none",
          cursor: mobile ? "default" : "grab",
          backgroundColor: (theme) =>
            alpha(theme.palette.background.default, settings.windowOpacity),
          backgroundImage: (theme) =>
            `linear-gradient(90deg, transparent 30%, ${alpha(theme.palette.primary.main, active ? 0.2 : 0.08)})`,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{
            "& .control-icon": { opacity: 0, transition: "opacity 100ms" },
            "&:hover .control-icon, &:focus-within .control-icon": {
              opacity: 1,
            },
          }}
        >
          {lights.map(({ token, label }) => control(token, label))}
        </Stack>
        <Typography
          variant="caption"
          sx={{
            fontFamily: monoFont,
            color: active ? "text.primary" : "text.secondary",
          }}
        >
          {title}
        </Typography>
      </Stack>
      <Box
        sx={{
          flexGrow: 1,
          minHeight: 0,
          overflowX: "hidden",
          overflowY: selfScrolling ? "hidden" : "auto",
          scrollbarGutter: selfScrolling ? "auto" : "stable",
          // stops the scrollbar short of the resize grip
          "&::-webkit-scrollbar-track": {
            marginBottom: (theme) => `${gripInset(theme) + 18}px`,
          },
        }}
      >
        {children}
      </Box>
      {!fullscreen && (
        <Box
          aria-hidden
          onPointerDown={startResize}
          onPointerMove={moveResize}
          onPointerUp={() => (size.current = undefined)}
          onPointerCancel={() => (size.current = undefined)}
          sx={{
            position: "absolute",
            right: 0,
            bottom: 0,
            boxSizing: "border-box",
            width: (theme) => gripInset(theme) + 18,
            height: (theme) => gripInset(theme) + 18,
            pr: (theme) => `${gripInset(theme)}px`,
            pb: (theme) => `${gripInset(theme)}px`,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "flex-end",
            cursor: "nwse-resize",
            touchAction: "none",
            color: "text.disabled",
            "&:hover": { color: "text.secondary" },
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M9 1L1 9M9 5.5L5.5 9"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </Box>
      )}
    </Box>
  );
};
