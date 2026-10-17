import { useEffect, useState } from "react";
import { Box } from "@mui/material";

export type ScreenMode = "panic" | "boot" | "off";

const panicLines = [
  "Kernel panic - not syncing: attempted to kill init!",
  "CPU: 0 PID: 1 Comm: devine.dev Not tainted 5.10.0-react #1",
  "Call Trace:",
  " dump_stack+0x2a/0x40",
  " panic+0x101/0x2e8",
  " <Desktop>",
  "   <EditorProvider>",
  "     <ThemeProvider>",
  "---[ end Kernel panic - not syncing: attempted to kill init! ]---",
];

const bootLines = [
  "devine.dev boot loader",
  "checking system/theme.json ........ ok",
  "checking system/dock.json ......... ok",
  "mounting /documents ............... ok",
  "mounting /projects ................ ok",
  "starting window manager ........... ok",
];

const BOOT_STEP_MS = 320;

// A full-screen fake kernel panic, boot sequence or power-off, ending in a page reload
export const ScreenOverlay = ({ mode }: { mode: ScreenMode }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (mode === "off") {
      const reload = () => window.location.reload();
      window.addEventListener("pointerdown", reload);
      window.addEventListener("keydown", reload);
      return () => {
        window.removeEventListener("pointerdown", reload);
        window.removeEventListener("keydown", reload);
      };
    }
    const interval = window.setInterval(
      () => setStep((current) => current + 1),
      mode === "boot" ? BOOT_STEP_MS : 1000,
    );
    return () => window.clearInterval(interval);
  }, [mode]);

  const countdown = 5 - step;
  useEffect(() => {
    if (mode === "panic" && countdown <= 0) window.location.reload();
    if (mode === "boot" && step >= bootLines.length + 2) {
      window.location.reload();
    }
  }, [mode, countdown, step]);

  return (
    <Box
      role="alert"
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 3000,
        display: "flex",
        flexDirection: "column",
        justifyContent: mode === "off" ? "center" : "flex-start",
        alignItems: mode === "off" ? "center" : "flex-start",
        p: 3,
        color: "#e6e6e6",
        backgroundColor: "#000",
        fontFamily: '"Noto Mono", monospace',
        fontSize: 13,
        lineHeight: 1.6,
        whiteSpace: "pre",
        overflow: "hidden",
        // sits above the grayscale filter and any theme the page had
        filter: "none",
      }}
    >
      {mode === "off" && "it is now safe to turn off your computer"}
      {mode === "panic" && (
        <>
          {panicLines.join("\n")}
          {"\n\n"}
          {`rebooting in ${Math.max(countdown, 0)}`}
        </>
      )}
      {mode === "boot" && bootLines.slice(0, step + 1).join("\n")}
    </Box>
  );
};
