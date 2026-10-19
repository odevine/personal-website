import * as RadixToggleGroup from "@radix-ui/react-toggle-group";

import styles from "./ToggleGroup.module.css";

interface Props<T extends string> {
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  "aria-label": string;
}

/** A row of joined buttons where exactly one is chosen */
export const ToggleGroup = <T extends string>({
  value,
  options,
  onChange,
  ...rest
}: Props<T>) => (
  <RadixToggleGroup.Root
    type="single"
    className={styles.group}
    value={value}
    // clicking the chosen option again would clear it, so that is ignored
    onValueChange={(next) => next && onChange(next as T)}
    aria-label={rest["aria-label"]}
  >
    {options.map((option) => (
      <RadixToggleGroup.Item
        key={option}
        value={option}
        className={styles.item}
      >
        {option}
      </RadixToggleGroup.Item>
    ))}
  </RadixToggleGroup.Root>
);
