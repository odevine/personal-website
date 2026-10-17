import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GlobalStyles, CssBaseline } from "@mui/material";
import "@fontsource/noto-mono";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";

import { ThemeProvider } from "@/Components";
import { App } from "./App";

// The site is a single page, so addresses left over from older links go back to the root
if (window.location.pathname !== "/") {
  window.history.replaceState(
    null,
    "",
    "/" + window.location.search + window.location.hash,
  );
}

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
            },
          },
          // Disable the default cross-fade so the ripple clip-path is the
          // only animation, and stack the incoming theme on top of the old one.
          "::view-transition-old(root), ::view-transition-new(root)": {
            animation: "none",
            mixBlendMode: "normal",
          },
          "::view-transition-old(root)": {
            zIndex: 1,
          },
          "::view-transition-new(root)": {
            zIndex: 9999,
          },
        }}
      />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
