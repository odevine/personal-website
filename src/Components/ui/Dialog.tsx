import { ReactNode } from "react";
import * as RadixDialog from "@radix-ui/react-dialog";

import styles from "./Dialog.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
}

/** A modal panel over a dimmed page, closed with escape or a click outside */
export const Dialog = ({ open, onClose, title, children, actions }: Props) => (
  <RadixDialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
    <RadixDialog.Portal>
      <RadixDialog.Overlay className={styles.overlay} />
      <RadixDialog.Content
        className={styles.panel}
        aria-describedby={undefined}
      >
        <RadixDialog.Title className={styles.title}>{title}</RadixDialog.Title>
        <div className={styles.content}>{children}</div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  </RadixDialog.Root>
);
