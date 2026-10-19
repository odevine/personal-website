import { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

import { cx } from "./cx";
import styles from "./Button.module.css";

type Common = { variant?: "text" | "outlined" };
type AsButton = Common &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type AsLink = Common &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

/** A small text or outlined button in the accent color, rendered as a link when it has an href */
export const Button = ({
  variant = "text",
  className,
  ...props
}: AsButton | AsLink) => {
  const classes = cx(
    styles.button,
    variant === "outlined" && styles.outlined,
    className,
  );
  if (props.href !== undefined) {
    return (
      <a
        className={classes}
        {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
      />
    );
  }
  return (
    <button
      type="button"
      className={classes}
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    />
  );
};

/** A round icon-only button */
export const IconButton = ({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button type="button" className={cx(styles.icon, className)} {...props} />
);
