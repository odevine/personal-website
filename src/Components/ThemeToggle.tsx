import { Switch } from "@mui/material";

import { useTheme } from "@/ThemeContext";

export const ThemeToggle = () => {
    const { toggleTheme, mode } = useTheme();
    console.log("  ~ ThemeToggle ~ mode:", mode);

    return <Switch checked={mode === "light"} onChange={toggleTheme} />;
};