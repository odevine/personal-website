import * as RadixSlider from "@radix-ui/react-slider";

import { cx } from "./cx";
import styles from "./Slider.module.css";

interface Props {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  "aria-label": string;
  className?: string;
}

/** A single-thumb slider in the accent color */
export const Slider = ({
  value,
  min,
  max,
  step,
  onChange,
  className,
  ...rest
}: Props) => (
  <RadixSlider.Root
    className={cx(styles.root, className)}
    value={[value]}
    min={min}
    max={max}
    step={step}
    onValueChange={([next]) => onChange(next)}
  >
    <RadixSlider.Track className={styles.track}>
      <RadixSlider.Range className={styles.range} />
    </RadixSlider.Track>
    <RadixSlider.Thumb
      className={styles.thumb}
      aria-label={rest["aria-label"]}
    />
  </RadixSlider.Root>
);
