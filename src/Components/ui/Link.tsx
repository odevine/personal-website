import { AnchorHTMLAttributes } from "react";

import { cx } from "./cx";
import styles from "./Link.module.css";

/** A link in the accent color, underlined on hover */
export const Link = ({
  className,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) => (
  <a className={cx(styles.link, className)} {...props} />
);
