import { useEffect, useMemo, useState, PropsWithChildren } from "react";
import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { CssBaseline, PaletteMode } from "@mui/material";

import { ThemeContext } from "@/ThemeContext"

export const ThemeProvider = (props: PropsWithChildren) => {
    const [mode, setMode] = useState<PaletteMode>((localStorage.getItem("theme") as PaletteMode) || "dark");

    useEffect(() => {
        // Save the current theme in localStorage
        localStorage.setItem("theme", mode);
    }, [mode]);

    const colorMode = useMemo(() => ({
        toggleTheme: () => {
            setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
        },
        mode,
    }), [mode]);

    const theme = useMemo(
        () =>
            createTheme({
                typography: {
                    fontFamily: "Noto Mono, monospace"
                },
                palette: {
                    mode,
                },
            }),
        [mode],
    );

    return (
        <ThemeContext.Provider value={colorMode}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {props.children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};