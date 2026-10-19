import { useEffect } from "react";
import { alpha, Box, Typography } from "@mui/material";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";

import { dismissToast, useAchievements } from "@/achievements";
import { achievements, achievementsMarkdown } from "@/content/achievements";
import { ACHIEVEMENTS_PATH } from "@/content/files";
import { monoFont } from "@/themes";
import { useDesktop } from "./DesktopContext";

const SHOW_MS = 4800;
// Several unlocks at once move along faster
const SHOW_QUEUED_MS = 2200;

// One toast at a time, resting on the bottom edge of the window area so the dock stays clear
export const AchievementToast = () => {
  const { queue, unlocked } = useAchievements();
  const { openFileAs } = useDesktop();
  const id = queue[0];
  const def = achievements.find((entry) => entry.id === id);
  const queued = queue.length > 1;

  useEffect(() => {
    if (!id) return;
    const timer = setTimeout(dismissToast, queued ? SHOW_QUEUED_MS : SHOW_MS);
    return () => clearTimeout(timer);
  }, [id, queued]);

  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 8,
        px: 1,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        // above every window, which stack by a counter in the area
        zIndex: 1000000,
      }}
    >
      {def && (
        <Box
          key={def.id}
          component="button"
          type="button"
          onClick={() => {
            openFileAs(
              ACHIEVEMENTS_PATH,
              achievementsMarkdown(unlocked),
              "preview",
            );
            dismissToast();
          }}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            width: "100%",
            maxWidth: 340,
            px: 1.5,
            py: 1,
            textAlign: "left",
            font: "inherit",
            cursor: "pointer",
            pointerEvents: "auto",
            color: "text.primary",
            backgroundColor: (theme) => theme.palette.background.paper,
            border: (theme) =>
              `1px solid ${alpha(theme.palette.primary.main, 0.45)}`,
            borderRadius: 2,
            boxShadow: (theme) =>
              `0 12px 30px -16px ${theme.palette.common.black}`,
            "@keyframes achievement-in": {
              from: { opacity: 0, transform: "translateY(8px)" },
              to: { opacity: 1, transform: "none" },
            },
            animation: "achievement-in 200ms ease-out",
            "@media (prefers-reduced-motion: reduce)": { animation: "none" },
            ":root[data-reduce-motion='true'] &": { animation: "none" },
            "&:focus-visible": {
              outline: (theme) => `2px solid ${theme.palette.primary.main}`,
              outlineOffset: 2,
            },
          }}
        >
          <EmojiEventsOutlinedIcon
            fontSize="small"
            sx={{ flexShrink: 0, color: "primary.main" }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="caption"
              sx={{ display: "block", color: "text.secondary" }}
            >
              achievement unlocked
            </Typography>
            <Typography
              variant="body2"
              noWrap
              sx={{ fontFamily: monoFont, fontWeight: 500 }}
            >
              {def.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{ display: "block", color: "text.secondary" }}
            >
              {def.description}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};
