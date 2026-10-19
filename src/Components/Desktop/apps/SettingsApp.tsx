import { CSSProperties, ReactNode } from "react";

import { Button } from "@/Components/ui/Button";
import { cx } from "@/Components/ui/cx";
import { CheckIcon } from "@/Components/ui/icons";
import { Slider } from "@/Components/ui/Slider";
import { ToggleGroup } from "@/Components/ui/ToggleGroup";
import { AccentKey, MAX_RADIUS, accentKeys } from "@/settings";
import { useTheme } from "@/ThemeContext";
import { colorSchemes, getScheme } from "@/themes";
import { transitionToScheme } from "@/themeTransition";
import styles from "./SettingsApp.module.css";

// Label on the left and the control filling the rest of the line
const Row = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className={styles.row}>
    <span className={`t-caption ${styles.label}`}>{title}</span>
    <div className={styles.control}>{children}</div>
  </div>
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
    <div className={styles.sliderRow}>
      <Slider
        aria-label={title}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={onChange}
        className={styles.slider}
      />
      <span className={`t-caption t-secondary ${styles.value}`}>
        {format(value)}
      </span>
    </div>
  </Row>
);

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
      <div className={styles.unavailable}>
        <p className="t-body2">settings unavailable</p>
        <span className="t-caption t-secondary">
          system/theme.json is missing, so there is nothing to configure.
        </span>
        <span className="t-caption t-secondary">
          recovery: sudo restore ~/system/theme.json, or refresh the page
        </span>
      </div>
    );
  }

  return (
    <div className={styles.settings}>
      <div className={styles.schemes}>
        <span className={`t-caption ${styles.label}`}>color scheme</span>
        <div className={styles.schemeGrid}>
          {colorSchemes.map((option) => {
            const selected = option.name === scheme;
            const colors = option.palette;
            return (
              <button
                key={option.name}
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
                className={cx(styles.scheme, selected && styles.selected)}
                style={
                  {
                    color: colors.text,
                    backgroundColor: colors.background,
                    "--scheme-border": colors.dimmed5,
                  } as CSSProperties
                }
              >
                <span className={styles.schemeName}>
                  <span className="t-body2">{option.label}</span>
                  {selected && <CheckIcon className={styles.check} />}
                </span>
                <span className={styles.swatches}>
                  {[
                    colors.accent1,
                    colors.accent2,
                    colors.accent3,
                    colors.accent4,
                    colors.accent5,
                    colors.accent6,
                  ].map((color, i) => (
                    <span
                      key={i}
                      className={styles.swatch}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Row title="accent">
        <div className={styles.accents}>
          {accentKeys.map((key) => (
            <button
              key={key}
              type="button"
              aria-label={
                key === "default" ? "default accent" : `accent ${key.slice(-1)}`
              }
              aria-pressed={settings.accent === key}
              onClick={() => updateSettings({ accent: key })}
              className={styles.accent}
              style={{ backgroundColor: accentColor(key) }}
            />
          ))}
        </div>
      </Row>

      <Row title="typeface">
        <ToggleGroup
          aria-label="typeface"
          options={["sans", "mono"] as const}
          value={settings.font}
          onChange={(font) => updateSettings({ font })}
        />
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

      <SliderRow
        title="window glow"
        value={Math.round(settings.windowGlow * 100)}
        min={0}
        max={200}
        step={5}
        format={(v) => (v === 0 ? "off" : `${v}%`)}
        onChange={(v) => updateSettings({ windowGlow: v / 100 })}
      />

      <Row title="background">
        <ToggleGroup
          aria-label="background"
          options={["dots", "grid", "none"] as const}
          value={settings.background}
          onChange={(background) => updateSettings({ background })}
        />
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
        <ToggleGroup
          aria-label="reduce motion"
          options={["off", "on"] as const}
          value={settings.reduceMotion ? "on" : "off"}
          onChange={(value) => updateSettings({ reduceMotion: value === "on" })}
        />
      </Row>

      <Button variant="outlined" onClick={resetSettings}>
        reset appearance
      </Button>
    </div>
  );
};
