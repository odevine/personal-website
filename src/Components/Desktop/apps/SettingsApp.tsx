import { ReactNode } from "react";
import {
  Box,
  Button,
  Slider,
  Stack,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

import { AccentKey, MAX_RADIUS, Settings, accentKeys } from "@/settings";
import { useTheme } from "@/ThemeContext";
import { colorSchemes, getScheme } from "@/themes";
import { transitionToScheme } from "@/themeTransition";

const labelSx = {
  flexShrink: 0,
  width: 124,
  lineHeight: 1.4,
  whiteSpace: "nowrap",
  color: "text.secondary",
};

// Label on the left and the control filling the rest of the line
const Row = ({ title, children }: { title: string; children: ReactNode }) => (
  <Stack direction="row" alignItems="center" spacing={1.5}>
    <Typography variant="caption" sx={labelSx}>
      {title}
    </Typography>
    <Box sx={{ flexGrow: 1, minWidth: 0 }}>{children}</Box>
  </Stack>
);

const SliderRow = ({
  title,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  title: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
  onChange: (value: number) => void;
}) => (
  <Row title={title}>
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <Slider
        size="small"
        color="primary"
        aria-label={title}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(_, next) => onChange(next as number)}
        sx={{ flexGrow: 1, my: 0, py: "6px", mx: 0.5 }}
      />
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ width: 44, flexShrink: 0, textAlign: "right" }}
      >
        {format(value)}
      </Typography>
    </Stack>
  </Row>
);

const compactToggles = { "& .MuiToggleButton-root": { py: 0.25 } };

export const SettingsApp = () => {
  const {
    scheme,
    setScheme,
    settings,
    updateSettings,
    resetSettings,
    themeMissing,
  } = useTheme();
  const palette = getScheme(scheme).palette;
  const accentColor = (key: AccentKey) =>
    key === "default" ? palette.accent6 : palette[key];

  if (themeMissing) {
    return (
      <Stack spacing={1} sx={{ p: 2.5 }}>
        <Typography variant="body2">settings unavailable</Typography>
        <Typography variant="caption" color="text.secondary">
          system/theme.json is missing, so there is nothing to configure.
        </Typography>
        <Typography variant="caption" color="text.secondary">
          recovery: sudo restore ~/system/theme.json, or refresh the page
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={1.5} sx={{ p: 1.75 }}>
      <Stack spacing={0.75}>
        <Typography variant="caption" sx={labelSx}>
          color scheme
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(108px, 1fr))",
            gap: 0.75,
          }}
        >
          {colorSchemes.map((option) => {
            const selected = option.name === scheme;
            const colors = option.palette;
            return (
              <Box
                key={option.name}
                component="button"
                type="button"
                aria-pressed={selected}
                onClick={(event) =>
                  !selected &&
                  transitionToScheme(
                    setScheme,
                    option.name,
                    event.clientX,
                    event.clientY,
                  )
                }
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 0.5,
                  p: 1,
                  cursor: "pointer",
                  font: "inherit",
                  borderRadius: 2,
                  color: colors.text,
                  backgroundColor: colors.background,
                  border: (theme) =>
                    `2px solid ${selected ? theme.palette.primary.main : colors.dimmed5}`,
                  "&:hover": {
                    borderColor: (theme) => theme.palette.primary.main,
                  },
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ width: "100%" }}
                >
                  <Typography variant="body2" sx={{ color: "inherit" }}>
                    {option.label}
                  </Typography>
                  {selected && (
                    <CheckIcon sx={{ fontSize: 16, color: "primary.main" }} />
                  )}
                </Stack>
                <Stack direction="row" spacing={0.5}>
                  {[
                    colors.accent1,
                    colors.accent2,
                    colors.accent3,
                    colors.accent4,
                    colors.accent5,
                    colors.accent6,
                  ].map((color, i) => (
                    <Box
                      key={i}
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor: color,
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            );
          })}
        </Box>
      </Stack>

      <Row title="accent">
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          {accentKeys.map((key) => (
            <Box
              key={key}
              component="button"
              type="button"
              aria-label={
                key === "default" ? "default accent" : `accent ${key.slice(-1)}`
              }
              aria-pressed={settings.accent === key}
              onClick={() => updateSettings({ accent: key })}
              sx={{
                width: 22,
                height: 22,
                p: 0,
                cursor: "pointer",
                borderRadius: "50%",
                border: "2px solid transparent",
                backgroundColor: accentColor(key),
                outline: (theme) =>
                  settings.accent === key
                    ? `2px solid ${theme.palette.text.primary}`
                    : "none",
                outlineOffset: 2,
              }}
            />
          ))}
        </Stack>
      </Row>

      <Row title="typeface">
        <ToggleButtonGroup
          exclusive
          fullWidth
          color="primary"
          sx={compactToggles}
          size="small"
          value={settings.font}
          onChange={(_, font: Settings["font"] | null) =>
            font && updateSettings({ font })
          }
        >
          <ToggleButton value="sans">sans</ToggleButton>
          <ToggleButton value="mono">mono</ToggleButton>
        </ToggleButtonGroup>
      </Row>

      <SliderRow
        title="text size"
        value={settings.fontSize}
        min={12}
        max={18}
        step={1}
        format={(v) => `${v}px`}
        onChange={(fontSize) => updateSettings({ fontSize })}
      />

      <SliderRow
        title="corner radius"
        value={settings.radius}
        min={0}
        max={MAX_RADIUS}
        step={1}
        format={(v) => `${v}px`}
        onChange={(radius) => updateSettings({ radius })}
      />

      <SliderRow
        title="window opacity"
        value={Math.round(settings.windowOpacity * 100)}
        min={50}
        max={100}
        step={5}
        format={(v) => `${v}%`}
        onChange={(v) => updateSettings({ windowOpacity: v / 100 })}
      />

      <Row title="background">
        <ToggleButtonGroup
          exclusive
          fullWidth
          color="primary"
          sx={compactToggles}
          size="small"
          value={settings.background}
          onChange={(_, background: Settings["background"] | null) =>
            background && updateSettings({ background })
          }
        >
          <ToggleButton value="dots">dots</ToggleButton>
          <ToggleButton value="grid">grid</ToggleButton>
          <ToggleButton value="none">none</ToggleButton>
        </ToggleButtonGroup>
      </Row>

      <SliderRow
        title="backdrop glow"
        value={Math.round(settings.backdropIntensity * 100)}
        min={0}
        max={200}
        step={5}
        format={(v) => `${v}%`}
        onChange={(v) => updateSettings({ backdropIntensity: v / 100 })}
      />

      <SliderRow
        title="backdrop speed"
        value={Math.round(settings.backdropSpeed * 100)}
        min={0}
        max={400}
        step={10}
        format={(v) => (v === 0 ? "paused" : `${v}%`)}
        onChange={(v) => updateSettings({ backdropSpeed: v / 100 })}
      />

      <Row title="reduce motion">
        <Switch
          size="small"
          color="primary"
          checked={settings.reduceMotion}
          onChange={(_, reduceMotion) => updateSettings({ reduceMotion })}
          inputProps={{ "aria-label": "reduce motion" }}
        />
      </Row>

      <Button
        size="small"
        variant="outlined"
        color="primary"
        onClick={resetSettings}
      >
        reset appearance
      </Button>
    </Stack>
  );
};
