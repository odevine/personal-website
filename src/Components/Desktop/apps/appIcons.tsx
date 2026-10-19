import { ReactElement } from "react";

import {
  CodeIcon,
  FolderIcon,
  IconProps,
  ImageIcon,
  PersonIcon,
  SettingsIcon,
  TerminalIcon,
  TrophyIcon,
} from "@/Components/ui/icons";
import { AppId } from "../appMeta";

// Shared by the dock and anywhere else an app is shown
export const appIcons: Record<AppId, ReactElement<IconProps>> = {
  about: <PersonIcon />,
  editor: <CodeIcon />,
  viewer: <ImageIcon />,
  terminal: <TerminalIcon />,
  explorer: <FolderIcon />,
  settings: <SettingsIcon />,
  achievements: <TrophyIcon />,
};
