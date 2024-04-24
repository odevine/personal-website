import { useContext, createContext } from "react";

export const ThemeContext = createContext({
    toggleTheme: () => {},
    mode: "dark",
});

export const useTheme = () => useContext(ThemeContext);