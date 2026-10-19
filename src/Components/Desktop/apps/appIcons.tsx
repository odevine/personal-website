import { ReactElement } from "react";
import CodeIcon from "@mui/icons-material/Code";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import FolderIcon from "@mui/icons-material/Folder";
import ImageIcon from "@mui/icons-material/Image";
import PersonIcon from "@mui/icons-material/Person";
import TerminalIcon from "@mui/icons-material/Terminal";
import TuneIcon from "@mui/icons-material/Tune";

import { AppId } from "../appMeta";

// Shared by the dock and anywhere else an app is shown
export const appIcons: Record<AppId, ReactElement> = {
  about: <PersonIcon />,
  editor: <CodeIcon />,
  viewer: <ImageIcon />,
  terminal: <TerminalIcon />,
  explorer: <FolderIcon />,
  settings: <TuneIcon />,
  achievements: <EmojiEventsIcon />,
};
