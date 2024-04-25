import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GlobalStyles, CssBaseline } from "@mui/material";
import "@fontsource/noto-mono";

import { ThemeProvider } from "@/Components";
import { App } from "./App";

const root = createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <StrictMode>
    <ThemeProvider>
      <CssBaseline />
      <GlobalStyles
        styles={{
          html: {
            height: "100%",
          },
          body: {
            height: "100%",
            "#root": {
              height: "100%",
            }
          },
        }}
      />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
