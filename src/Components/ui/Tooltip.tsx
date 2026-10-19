import { ReactNode } from "react";
import * as RadixTooltip from "@radix-ui/react-tooltip";

import styles from "./Tooltip.module.css";

interface Props {
  title: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  /** Keeps the tooltip shut, for example while its trigger is being dragged */
  disabled?: boolean;
}

/** A small label shown on hover or focus */
export const Tooltip = ({ title, children, side = "top", disabled }: Props) => (
  <RadixTooltip.Root open={disabled ? false : undefined}>
    <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
    <RadixTooltip.Portal>
      <RadixTooltip.Content
        side={side}
        sideOffset={8}
        className={styles.tooltip}
        data-tooltip
      >
        {title}
      </RadixTooltip.Content>
    </RadixTooltip.Portal>
  </RadixTooltip.Root>
);

export const TooltipProvider = RadixTooltip.Provider;
