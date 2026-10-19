import * as RadixProgress from "@radix-ui/react-progress";

import { cx } from "./cx";
import styles from "./Progress.module.css";

/** A thin bar filled to a percentage */
export const Progress = ({
  value,
  className,
  ...rest
}: {
  value: number;
  className?: string;
  "aria-label": string;
}) => (
  <RadixProgress.Root
    className={cx(styles.root, className)}
    value={value}
    aria-label={rest["aria-label"]}
  >
    <RadixProgress.Indicator
      className={styles.bar}
      style={{ transform: `translateX(-${100 - value}%)` }}
    />
  </RadixProgress.Root>
);
