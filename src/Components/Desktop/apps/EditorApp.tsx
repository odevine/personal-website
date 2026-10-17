import { MouseEvent, Suspense, lazy } from "react";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import CodeIcon from "@mui/icons-material/Code";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

import { isSystemFile } from "@/content/files";
import { resolveNode } from "@/content/filesystem";
import { monoFont } from "@/themes";
import { copyText, MenuEntry, useContextMenu } from "../ContextMenu";
import { useDesktop } from "../DesktopContext";
import { FileView, useEditor } from "../EditorContext";
import { CodeEditor } from "./CodeEditor";
import { languageOf } from "./highlight";

// the markdown libraries are only fetched the first time a preview is shown
const MarkdownPreview = lazy(() => import("./MarkdownPreview"));

const basename = (path: string) => path.split("/").pop() ?? path;
const isMarkdown = (path: string) => basename(path).endsWith(".md");

// Adds the parent folder when two open tabs would otherwise read the same
const tabLabel = (path: string, tabs: string[]) => {
  const name = basename(path);
  const clash = tabs.some(
    (other) => other !== path && basename(other) === name,
  );
  const parent = path.split("/").slice(-2, -1)[0];
  return clash && parent ? `${name} · ${parent}` : name;
};

export const EditorApp = () => {
  const { show } = useContextMenu();
  const { revealInExplorer } = useDesktop();
  const {
    contents,
    tabs,
    views,
    active,
    showView,
    closeFile,
    editFile,
    createFile,
    isModified,
    notes,
  } = useEditor();

  const tabMenu = (path: string): MenuEntry[] => [
    ...(isMarkdown(path)
      ? ([
          (views[path] ?? "edit") === "edit"
            ? {
                type: "item",
                label: "show preview",
                icon: <VisibilityOutlinedIcon fontSize="small" />,
                onClick: () => showView(path, "preview"),
              }
            : {
                type: "item",
                label: "show editor",
                icon: <CodeIcon fontSize="small" />,
                onClick: () => showView(path, "edit"),
              },
          { type: "divider" },
        ] as MenuEntry[])
      : []),
    {
      type: "item",
      label: "close",
      icon: <CloseIcon fontSize="small" />,
      onClick: () => closeFile(path),
    },
    {
      type: "item",
      label: "close others",
      disabled: tabs.length < 2,
      onClick: () => tabs.filter((tab) => tab !== path).forEach(closeFile),
    },
    { type: "divider" },
    {
      type: "item",
      label: "copy path",
      icon: <ContentCopyIcon fontSize="small" />,
      onClick: () => copyText(path),
    },
    {
      type: "item",
      label: "reveal in explorer",
      icon: <FolderOpenOutlinedIcon fontSize="small" />,
      // files that are not in the explorer, like untitled ones, cannot be revealed
      disabled: !resolveNode(path.split("/")),
      onClick: () => revealInExplorer(path),
    },
  ];

  const closeTab = (event: MouseEvent, path: string) => {
    event.stopPropagation();
    closeFile(path);
  };

  return (
    <Stack sx={{ height: "100%" }}>
      <Stack
        direction="row"
        role="tablist"
        sx={{
          flexShrink: 0,
          overflowX: "auto",
          backgroundColor: "background.default",
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          "&::-webkit-scrollbar": { height: 0 },
        }}
      >
        {tabs.map((path) => {
          const label = tabLabel(path, tabs);
          const selected = path === active;
          const view = views[path] ?? "edit";
          // a markdown file is one wide tab made of two halves, the text and its preview
          const halves: Array<{ id: FileView; label: string }> = [
            { id: "edit", label },
            ...(isMarkdown(path)
              ? [{ id: "preview" as FileView, label: "preview" }]
              : []),
          ];
          return (
            <Box
              key={path}
              className="editor-tab"
              title={path}
              onContextMenu={(event) => {
                event.preventDefault();
                show(event, tabMenu(path));
              }}
              sx={{
                display: "flex",
                flexShrink: 0,
                height: 34,
                fontFamily: monoFont,
                fontSize: 12,
                backgroundColor: selected ? "background.paper" : "transparent",
                borderRight: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              {halves.map((half, i) => {
                const on = selected && view === half.id;
                return (
                  <Box
                    key={half.id}
                    role="tab"
                    aria-selected={on}
                    tabIndex={0}
                    onClick={() => showView(path, half.id)}
                    onKeyDown={(event) =>
                      (event.key === "Enter" || event.key === " ") &&
                      showView(path, half.id)
                    }
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      pl: 1.5,
                      pr:
                        i === halves.length - 1 && halves.length === 1
                          ? 0
                          : 1.5,
                      cursor: "pointer",
                      color: on ? "text.primary" : "text.secondary",
                      // the half that is not showing sits back from its tab
                      backgroundColor:
                        selected && !on ? "background.default" : "transparent",
                      borderTop: (theme) =>
                        `2px solid ${on ? theme.palette.primary.main : "transparent"}`,
                      borderLeft: (theme) =>
                        i > 0 ? `1px solid ${theme.palette.divider}` : "none",
                      "&:hover": { color: "text.primary" },
                      "&:focus-visible": {
                        outline: (theme) =>
                          `2px solid ${theme.palette.primary.main}`,
                        outlineOffset: -2,
                      },
                    }}
                  >
                    {half.id === "edit" && isSystemFile(path) && (
                      <LockOutlinedIcon sx={{ fontSize: 12 }} />
                    )}
                    {half.id === "preview" && (
                      <VisibilityOutlinedIcon sx={{ fontSize: 14 }} />
                    )}
                    {half.label}
                  </Box>
                );
              })}
              <Box
                sx={{
                  position: "relative",
                  alignSelf: "center",
                  width: 20,
                  height: 20,
                  mx: 0.5,
                }}
              >
                {isModified(path) && (
                  <Box
                    aria-label="unsaved changes"
                    sx={{
                      position: "absolute",
                      inset: 0,
                      m: "auto",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      backgroundColor: "text.secondary",
                      ".editor-tab:hover &": { display: "none" },
                    }}
                  />
                )}
                <IconButton
                  size="small"
                  aria-label={`close ${label}`}
                  onClick={(event) => closeTab(event, path)}
                  sx={{
                    position: "absolute",
                    inset: 0,
                    p: 0,
                    opacity: selected && !isModified(path) ? 1 : 0,
                    ".editor-tab:hover &, &:focus-visible": { opacity: 1 },
                  }}
                >
                  <CloseIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            </Box>
          );
        })}
        <IconButton
          size="small"
          aria-label="new file"
          onClick={createFile}
          sx={{ alignSelf: "center", mx: 0.5, borderRadius: 1 }}
        >
          <AddIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Stack>

      <Box sx={{ flexGrow: 1, minHeight: 0, overflow: "auto" }}>
        {active && isMarkdown(active) && views[active] === "preview" ? (
          <Suspense
            fallback={
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", p: 2.5 }}
              >
                loading preview
              </Typography>
            }
          >
            <MarkdownPreview source={contents[active]} path={active} />
          </Suspense>
        ) : active ? (
          <CodeEditor
            key={active}
            value={contents[active]}
            language={languageOf(basename(active))}
            readOnly={isSystemFile(active)}
            onChange={(value) => editFile(active, value)}
          />
        ) : (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ height: "100%", color: "text.secondary" }}
          >
            <Typography variant="caption">no file open</Typography>
          </Stack>
        )}
      </Box>
      {active && (notes[active] || isSystemFile(active)) && (
        <Typography
          variant="caption"
          noWrap
          role="status"
          sx={{
            flexShrink: 0,
            px: 1.5,
            py: 0.5,
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            color: (theme) =>
              ({
                ok: theme.palette.text.secondary,
                warn: theme.palette.syntax.string,
                error: theme.palette.syntax.keyword,
              })[notes[active]?.level ?? "ok"],
          }}
        >
          {[
            isSystemFile(active) &&
              "system file, read-only here. use sudo in the terminal",
            notes[active]?.message,
          ]
            .filter(Boolean)
            .join(" · ")}
        </Typography>
      )}
    </Stack>
  );
};
