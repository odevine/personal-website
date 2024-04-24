import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/noto-mono"

import { ThemeProvider } from "@/Components"
import { App } from "./App";

const root = createRoot(
    document.getElementById("root") as HTMLElement
);

root.render(
    <StrictMode>
        <ThemeProvider>
            <App />
        </ThemeProvider>
    </StrictMode>
);
