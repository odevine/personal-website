import { MouseEvent, Suspense, lazy } from "react";

import { IconButton } from "@/Components/ui/Button";
import { cx } from "@/Components/ui/cx";
import {
  AddIcon,
  CloseIcon,
  CodeIcon,
  CopyIcon,
  FolderOpenIcon,
  LockIcon,
  VisibilityIcon,
} from "@/Components/ui/icons";
import { isReadOnlyFile, isSystemFile } from "@/content/files";
import { useScrollFade } from "@/hooks/useScrollFade";
import { resolveNode } from "@/content/filesystem";
import { copyText, MenuEntry, useContextMenu } from "../ContextMenu";
import { useDesktop } from "../DesktopContext";
import { FileView, useEditor } from "../EditorContext";
import { CodeEditor } from "./CodeEditor";
import { languageOf } from "./highlight";
import styles from "./EditorApp.module.css";

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
                icon: <VisibilityIcon small />,
                onClick: () => showView(path, "preview"),
              }
            : {
                type: "item",
                label: "show editor",
                icon: <CodeIcon small />,
                onClick: () => showView(path, "edit"),
              },
          { type: "divider" },
        ] as MenuEntry[])
      : []),
    {
      type: "item",
      label: "close",
      icon: <CloseIcon small />,
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
      icon: <CopyIcon small />,
      onClick: () => copyText(path),
    },
    {
      type: "item",
      label: "reveal in explorer",
      icon: <FolderOpenIcon small />,
      // files that are not in the explorer, like untitled ones, cannot be revealed
      disabled: !resolveNode(path.split("/")),
      onClick: () => revealInExplorer(path),
    },
  ];

  const closeTab = (event: MouseEvent, path: string) => {
    event.stopPropagation();
    closeFile(path);
  };

  const tabsRef = useScrollFade<HTMLDivElement>();
  const contentRef = useScrollFade<HTMLDivElement>();
  const noteLevel = active ? (notes[active]?.level ?? "ok") : "ok";

  return (
    <div className={styles.editor}>
      <div
        ref={tabsRef}
        role="tablist"
        className={cx(styles.tabs, "scroll-fade")}
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
            <div
              key={path}
              title={path}
              onContextMenu={(event) => {
                event.preventDefault();
                show(event, tabMenu(path));
              }}
              className={cx(styles.tab, selected && styles.selected)}
            >
              {halves.map((half) => {
                const on = selected && view === half.id;
                return (
                  <div
                    key={half.id}
                    role="tab"
                    aria-selected={on}
                    tabIndex={0}
                    onClick={() => showView(path, half.id)}
                    onKeyDown={(event) =>
                      (event.key === "Enter" || event.key === " ") &&
                      showView(path, half.id)
                    }
                    className={cx(
                      styles.half,
                      on && styles.on,
                      // only a single half sits flush against the close button
                      halves.length === 1 && styles.single,
                    )}
                  >
                    {half.id === "edit" && isReadOnlyFile(path) && (
                      <LockIcon style={{ fontSize: 12 }} />
                    )}
                    {half.id === "preview" && (
                      <VisibilityIcon style={{ fontSize: 14 }} />
                    )}
                    {half.label}
                  </div>
                );
              })}
              <div className={styles.closeSlot}>
                {isModified(path) && (
                  <span aria-label="unsaved changes" className={styles.dirty} />
                )}
                <IconButton
                  aria-label={`close ${label}`}
                  onClick={(event) => closeTab(event, path)}
                  className={cx(
                    styles.close,
                    selected && !isModified(path) && styles.shown,
                  )}
                >
                  <CloseIcon style={{ fontSize: 14 }} />
                </IconButton>
              </div>
            </div>
          );
        })}
        <IconButton
          aria-label="new file"
          onClick={createFile}
          className={styles.newFile}
        >
          <AddIcon style={{ fontSize: 18 }} />
        </IconButton>
      </div>

      <div ref={contentRef} className={cx(styles.content, "scroll-fade")}>
        {active && isMarkdown(active) && views[active] === "preview" ? (
          <Suspense
            fallback={
              <span className={`t-caption t-secondary ${styles.loading}`}>
                loading preview
              </span>
            }
          >
            <MarkdownPreview source={contents[active]} path={active} />
          </Suspense>
        ) : active ? (
          <CodeEditor
            key={active}
            value={contents[active]}
            language={languageOf(basename(active))}
            readOnly={isReadOnlyFile(active)}
            onChange={(value) => editFile(active, value)}
          />
        ) : (
          <div className={styles.empty}>
            <span className="t-caption">no file open</span>
          </div>
        )}
      </div>
      {active && (notes[active] || isSystemFile(active)) && (
        <span
          role="status"
          className={`t-caption t-nowrap ${styles.status} ${styles[noteLevel]}`}
        >
          {[
            isSystemFile(active) &&
              "system file, read-only here. use sudo in the terminal",
            notes[active]?.message,
          ]
            .filter(Boolean)
            .join(" · ")}
        </span>
      )}
    </div>
  );
};
