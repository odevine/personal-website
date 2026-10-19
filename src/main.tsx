import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/noto-mono";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "./styles/global.css";

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
      <App />
    </ThemeProvider>
  </StrictMode>,
);
