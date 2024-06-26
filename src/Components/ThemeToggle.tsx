import { IconButton } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

import { useTheme } from "@/ThemeContext";

export const ThemeToggle = () => {
  const { toggleTheme, mode } = useTheme();
  return (
    <IconButton
      onClick={toggleTheme}
      color="secondary"
    >
      {mode === "light" ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
};
