import { useState } from "react";
import {
  alpha,
  Box,
  Button,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import { useAchievements } from "@/achievements";
import {
  achievementGroups,
  achievements,
  achievementsMarkdown,
  countUnlocked,
} from "@/content/achievements";
import { ACHIEVEMENTS_PATH } from "@/content/files";
import { formatDate } from "@/format";
import { monoFont } from "@/themes";
import { useDesktop } from "../DesktopContext";

export const AchievementsApp = () => {
  const { unlocked } = useAchievements();
  const { openFileAs } = useDesktop();
  const done = countUnlocked(unlocked);
  const [hinted, setHinted] = useState<Record<string, boolean>>({});

  return (
    <Stack spacing={2.5} sx={{ p: 2.5 }}>
      <Box>
        <Stack
          direction="row"
          alignItems="baseline"
          justifyContent="space-between"
        >
          <Typography variant="h5">
            {done} / {achievements.length}
          </Typography>
          <Button
            size="small"
            onClick={() =>
              openFileAs(
                ACHIEVEMENTS_PATH,
                achievementsMarkdown(unlocked),
                "preview",
              )
            }
          >
            open as file
          </Button>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={(done / achievements.length) * 100}
          aria-label="achievements unlocked"
          sx={{ mt: 1, height: 6, borderRadius: 3 }}
        />
      </Box>

      {achievementGroups(unlocked).map((group) => (
        <Box key={group.category} component="section">
          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ mb: 0.5 }}
          >
            <Typography variant="subtitle2" sx={{ fontFamily: monoFont }}>
              {group.category}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {group.done} / {group.rows.length}
            </Typography>
          </Stack>
          <Stack
            component="ul"
            sx={{ m: 0, p: 0, listStyle: "none" }}
            divider={
              <Box
                sx={{
                  borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              />
            }
          >
            {group.rows.map(({ def, unlockedAt }) => {
              const secret = !unlockedAt && def.hidden;
              return (
                <Stack
                  key={def.id}
                  component="li"
                  direction="row"
                  alignItems="center"
                  spacing={1.5}
                  sx={{ py: 1, opacity: unlockedAt ? 1 : 0.6 }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      color: unlockedAt ? "primary.main" : "text.secondary",
                      backgroundColor: (theme) =>
                        alpha(
                          unlockedAt
                            ? theme.palette.primary.main
                            : theme.palette.text.primary,
                          unlockedAt ? 0.15 : 0.06,
                        ),
                    }}
                  >
                    {unlockedAt ? (
                      <EmojiEventsIcon sx={{ fontSize: 16 }} />
                    ) : (
                      <LockOutlinedIcon sx={{ fontSize: 15 }} />
                    )}
                  </Box>
                  <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Typography variant="body2" sx={{ fontFamily: monoFont }}>
                      {secret ? "???" : def.name}
                    </Typography>
                    {(!secret || (def.hint && hinted[def.id])) && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block" }}
                      >
                        {secret ? def.hint : def.description}
                      </Typography>
                    )}
                  </Box>
                  {secret && def.hint && (
                    <Button
                      size="small"
                      aria-expanded={!!hinted[def.id]}
                      onClick={() =>
                        setHinted((current) => ({
                          ...current,
                          [def.id]: !current[def.id],
                        }))
                      }
                      sx={{ flexShrink: 0 }}
                    >
                      {hinted[def.id] ? "hide" : "hint"}
                    </Button>
                  )}
                  {unlockedAt && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ flexShrink: 0 }}
                    >
                      {formatDate(unlockedAt)}
                    </Typography>
                  )}
                </Stack>
              );
            })}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
};
