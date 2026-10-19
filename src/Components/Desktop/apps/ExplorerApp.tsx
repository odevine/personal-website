import {
  CSSProperties,
  KeyboardEvent,
  PointerEvent,
  ReactNode,
  cloneElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Button } from "@/Components/ui/Button";
import { IconButton } from "@/Components/ui/Button";
import { cx } from "@/Components/ui/cx";
import { Dialog } from "@/Components/ui/Dialog";
import {
  ArrowBackIcon,
  ArrowForwardIcon,
  ArrowUpIcon,
  ChevronRightIcon,
  CodeIcon,
  CopyIcon,
  DataObjectIcon,
  DescriptionIcon,
  FolderIcon,
  FolderOpenIcon,
  FolderSpecialIcon,
  GitHubIcon,
  HomeIcon,
  Icon,
  ImageIcon,
  InfoIcon,
  LockIcon,
  StarIcon,
  VisibilityIcon,
  WindowIcon,
} from "@/Components/ui/icons";
import { Link } from "@/Components/ui/Link";
import { FsIcon, FsNode, filesystem, resolveNode } from "@/content/filesystem";
import { formatDate, formatSize } from "@/format";
import { useFilesystemVersion } from "@/content/useFilesystem";
import { useScrollFade } from "@/hooks/useScrollFade";
import { copyText, MenuEntry, useContextMenu } from "../ContextMenu";
import { useDesktop } from "../DesktopContext";
import { appIcons } from "./appIcons";
import styles from "./ExplorerApp.module.css";

type SortKey = "name" | "modified" | "type" | "size";

const MIN_COLUMN = 56;
const MAX_COLUMN = 600;
const defaultWidths = { name: 240, modified: 150, type: 130, size: 80 };

const iconFor: Record<FsIcon, Icon> = {
  folder: FolderIcon,
  project: FolderSpecialIcon,
  markdown: DescriptionIcon,
  image: ImageIcon,
  json: DataObjectIcon,
  app: WindowIcon,
};

const iconColor: Record<FsIcon, string> = {
  folder: "string",
  project: "string",
  markdown: "operator",
  image: "number",
  json: "fn",
  app: "string",
};

// Apps show the same icon as the dock, everything else goes by file type
const NodeIcon = ({ node, size = 18 }: { node: FsNode; size?: number }) => {
  if (node.kind === "app" && node.appId) {
    return cloneElement(appIcons[node.appId], {
      style: { fontSize: size, color: "var(--primary)" },
    });
  }
  const FileIcon = iconFor[node.icon];
  return (
    <FileIcon
      style={{ fontSize: size, color: `var(--syntax-${iconColor[node.icon]})` }}
    />
  );
};

const compare = (a: FsNode, b: FsNode, key: SortKey) => {
  switch (key) {
    case "modified":
      return (a.modified ?? "").localeCompare(b.modified ?? "");
    case "type":
      return a.type.localeCompare(b.type);
    case "size":
      return (a.bytes ?? 0) - (b.bytes ?? 0);
    default:
      return a.name.localeCompare(b.name, undefined, { numeric: true });
  }
};

const columns: Array<{ key: SortKey; label: string; className?: string }> = [
  { key: "name", label: "name" },
  { key: "modified", label: "date modified", className: "col-modified" },
  { key: "type", label: "type", className: "col-type" },
  { key: "size", label: "size", className: "col-size" },
];

export const ExplorerApp = () => {
  const { openApp, openFile, openFileAs, openImage, reveal } = useDesktop();
  const { show } = useContextMenu();
  const fsVersion = useFilesystemVersion();
  const [properties, setProperties] = useState<{
    node: FsNode;
    location: string[];
  } | null>(null);
  const handledReveal = useRef(0);
  const [history, setHistory] = useState<string[][]>([[]]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({
    key: "name",
    dir: 1,
  });
  const [homeOpen, setHomeOpen] = useState(true);
  const [widths, setWidths] = useState(defaultWidths);
  const resizing = useRef<
    { key: SortKey; startX: number; start: number } | undefined
  >(undefined);

  const path = history[index];
  const folder = resolveNode(path) ?? filesystem;
  const selectedNode = folder.children?.find((n) => n.name === selected);

  // Folders always list first, then the chosen column decides the order
  const items = useMemo(
    () =>
      [...(folder.children ?? [])].sort((a, b) => {
        if ((a.kind === "folder") !== (b.kind === "folder")) {
          return a.kind === "folder" ? -1 : 1;
        }
        return compare(a, b, sort.key) * sort.dir;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [folder, sort, fsVersion],
  );

  const go = (next: string[]) => {
    setHistory([...history.slice(0, index + 1), next]);
    setIndex(index + 1);
    setSelected(null);
  };
  const goUp = () => path.length && go(path.slice(0, -1));
  const back = () => {
    if (index > 0) {
      setIndex(index - 1);
      setSelected(null);
    }
  };
  const forward = () => {
    if (index < history.length - 1) {
      setIndex(index + 1);
      setSelected(null);
    }
  };

  const open = (node: FsNode) => {
    if (node.kind === "folder") {
      go([...path, node.name]);
    } else if (node.kind === "app" && node.appId) {
      openApp(node.appId);
    } else if (node.src) {
      // the viewer can browse every image in this folder, in the order shown
      const images = items.flatMap((item) =>
        item.src ? [{ name: item.name, src: item.src, bytes: item.bytes }] : [],
      );
      openImage(
        images,
        images.findIndex((image) => image.name === node.name),
      );
    } else if (node.content !== undefined) {
      // markdown opens as a preview first, since it is usually being read
      openFile(
        [...path, node.name].join("/"),
        node.content,
        node.name.endsWith(".md") ? "preview" : undefined,
      );
    }
  };

  const startResize = (key: SortKey) => (event: PointerEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    resizing.current = { key, startX: event.clientX, start: widths[key] };
  };

  const moveResize = (event: PointerEvent<HTMLElement>) => {
    const drag = resizing.current;
    if (!drag) return;
    const width = Math.min(
      Math.max(drag.start + event.clientX - drag.startX, MIN_COLUMN),
      MAX_COLUMN,
    );
    setWidths((current) => ({ ...current, [drag.key]: width }));
  };

  const columnTemplate = `${widths.name}px ${widths.modified}px ${widths.type}px ${widths.size}px 1fr`;

  const toggleSort = (key: SortKey) =>
    setSort((current) =>
      current.key === key
        ? { key, dir: current.dir === 1 ? -1 : 1 }
        : { key, dir: 1 },
    );

  const onKeyDown = (event: KeyboardEvent) => {
    const current = items.findIndex((n) => n.name === selected);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      const next = Math.min(
        Math.max(current + step, 0),
        Math.max(items.length - 1, 0),
      );
      setSelected(items[next]?.name ?? null);
    } else if (event.key === "Enter" && selectedNode) {
      open(selectedNode);
    } else if (event.key === "Backspace") {
      goUp();
    }
  };

  // "reveal in explorer" from elsewhere opens the file's folder and selects it
  useEffect(() => {
    if (!reveal || reveal.nonce === handledReveal.current) return;
    handledReveal.current = reveal.nonce;
    const parts = reveal.path.split("/");
    const name = parts.pop();
    if (parts.join("/") !== path.join("/")) go(parts);
    setSelected(name ?? null);
    // only a new request should move the explorer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reveal]);

  const rowMenu = (node: FsNode): MenuEntry[] => {
    const nodePath = [...path, node.name];
    const entries: MenuEntry[] = [];
    if (node.kind === "folder" || node.kind === "app") {
      entries.push({
        type: "item",
        label: "open",
        icon: <FolderOpenIcon small />,
        onClick: () => open(node),
      });
    } else if (node.src) {
      entries.push({
        type: "item",
        label: "open in viewer",
        icon: <ImageIcon small />,
        onClick: () => open(node),
      });
    } else if (node.content !== undefined) {
      const content = node.content;
      if (node.name.endsWith(".md")) {
        entries.push({
          type: "item",
          label: "open preview",
          icon: <VisibilityIcon small />,
          onClick: () => openFileAs(nodePath.join("/"), content, "preview"),
        });
      }
      entries.push({
        type: "item",
        label: "open in editor",
        icon: <CodeIcon small />,
        onClick: () =>
          node.name.endsWith(".md")
            ? openFileAs(nodePath.join("/"), content, "edit")
            : openFile(nodePath.join("/"), content),
      });
    }
    const repo = node.repo;
    if (repo) {
      entries.push({
        type: "item",
        label: "view on github",
        icon: <GitHubIcon small />,
        onClick: () => window.open(repo.url, "_blank", "noopener"),
      });
    }
    entries.push(
      { type: "divider" },
      {
        type: "item",
        label: "copy path",
        icon: <CopyIcon small />,
        onClick: () => copyText([filesystem.name, ...nodePath].join("/")),
      },
      {
        type: "item",
        label: "properties",
        icon: <InfoIcon small />,
        onClick: () => setProperties({ node, location: path }),
      },
    );
    return entries;
  };

  const sortChoices: Array<{ key: SortKey; label: string }> = [
    { key: "name", label: "name" },
    { key: "modified", label: "date modified" },
    { key: "type", label: "type" },
    { key: "size", label: "size" },
  ];

  const backgroundMenu = (): MenuEntry[] => [
    { type: "label", label: "sort by" },
    ...sortChoices.map(({ key, label }): MenuEntry => ({
      type: "item",
      label,
      checked: sort.key === key,
      onClick: () => setSort({ key, dir: sort.dir }),
    })),
    { type: "divider" },
    {
      type: "item",
      label: "ascending",
      checked: sort.dir === 1,
      onClick: () => setSort({ key: sort.key, dir: 1 }),
    },
    {
      type: "item",
      label: "descending",
      checked: sort.dir === -1,
      onClick: () => setSort({ key: sort.key, dir: -1 }),
    },
    { type: "divider" },
    {
      type: "item",
      label: "up one level",
      icon: <ArrowUpIcon small />,
      disabled: !path.length,
      onClick: goUp,
    },
  ];

  const rail = filesystem.children ?? [];
  const railRef = useScrollFade<HTMLElement>();
  const gridRef = useScrollFade<HTMLDivElement>();

  return (
    <div className={styles.explorer} onKeyDown={onKeyDown}>
      <div className={styles.toolbar}>
        <IconButton aria-label="back" disabled={index === 0} onClick={back}>
          <ArrowBackIcon small />
        </IconButton>
        <IconButton
          aria-label="forward"
          disabled={index >= history.length - 1}
          onClick={forward}
        >
          <ArrowForwardIcon small />
        </IconButton>
        <IconButton aria-label="up" disabled={!path.length} onClick={goUp}>
          <ArrowUpIcon small />
        </IconButton>
        <nav aria-label="path" className={styles.crumbs}>
          {[filesystem.name, ...path].map((segment, i) => (
            <span
              key={i}
              className={cx(styles.crumb, i === 0 && styles.rootCrumb)}
            >
              {i > 0 && <ChevronRightIcon className={styles.separator} />}
              <button
                type="button"
                onClick={() => i !== path.length && go(path.slice(0, i))}
                className={cx(styles.segment, i === path.length && styles.here)}
              >
                {segment}
              </button>
            </span>
          ))}
        </nav>
      </div>

      <div className={styles.main}>
        <nav
          ref={railRef}
          aria-label="places"
          className={cx(styles.rail, "scroll-fade")}
        >
          <RailItem
            active={path.length === 0}
            onClick={() => {
              setHomeOpen(true);
              if (path.length) go([]);
            }}
            icon={<HomeIcon className={styles.homeIcon} />}
            label={filesystem.name}
            chevron={
              <span
                role="button"
                aria-label={homeOpen ? "collapse home" : "expand home"}
                onClick={(event) => {
                  event.stopPropagation();
                  setHomeOpen(!homeOpen);
                }}
                className={styles.chevron}
              >
                <ChevronRightIcon
                  className={cx(styles.chevronIcon, homeOpen && styles.open)}
                />
              </span>
            }
          />
          {homeOpen &&
            rail.map((node) => (
              <RailItem
                key={node.name}
                indent
                active={path[0] === node.name}
                onClick={() => go([node.name])}
                icon={<NodeIcon node={node} />}
                label={node.name}
              />
            ))}
        </nav>

        <div
          role="grid"
          aria-label={folder.name}
          tabIndex={0}
          style={{ "--cols": columnTemplate } as CSSProperties}
          ref={gridRef}
          className={cx(styles.grid, "scroll-fade")}
          onClick={() => setSelected(null)}
          onContextMenu={(event) => {
            event.preventDefault();
            setSelected(null);
            show(event, backgroundMenu());
          }}
        >
          <div
            role="row"
            data-fade-inset="top"
            className={cx(styles.columns, styles.header)}
          >
            {columns.map(({ key, label, className }) => (
              <div key={key} className={cx(styles.column, className)}>
                <button
                  role="columnheader"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleSort(key);
                  }}
                  className={styles.sort}
                >
                  {label}
                  {sort.key === key && (
                    <span aria-hidden>{sort.dir === 1 ? "▲" : "▼"}</span>
                  )}
                </button>
                <div
                  aria-hidden
                  onPointerDown={startResize(key)}
                  onPointerMove={moveResize}
                  onPointerUp={() => (resizing.current = undefined)}
                  onPointerCancel={() => (resizing.current = undefined)}
                  onClick={(event) => event.stopPropagation()}
                  onDoubleClick={() =>
                    setWidths((current) => ({
                      ...current,
                      [key]: defaultWidths[key],
                    }))
                  }
                  className={cx(styles.handle, "col-handle")}
                />
              </div>
            ))}
            <div className="col-filler" />
          </div>

          {items.map((node) => {
            const isSelected = node.name === selected;
            return (
              <div
                key={node.name}
                role="row"
                aria-selected={isSelected}
                onClick={(event) => {
                  event.stopPropagation();
                  setSelected(node.name);
                }}
                onDoubleClick={() => open(node)}
                onContextMenu={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setSelected(node.name);
                  show(event, rowMenu(node));
                }}
                className={cx(styles.columns, styles.item)}
              >
                <div role="gridcell" className={styles.nameCell}>
                  <NodeIcon node={node} />
                  <span className="t-nowrap">{node.name}</span>
                  {node.system && (
                    <LockIcon
                      aria-label="system file"
                      aria-hidden={false}
                      className={styles.lock}
                    />
                  )}
                </div>
                <Cell className="col-modified">
                  {formatDate(node.modified)}
                </Cell>
                <Cell className="col-type">{node.type}</Cell>
                <Cell className="col-size">{formatSize(node.bytes)}</Cell>
              </div>
            );
          })}
          {!items.length && (
            <span className={`t-caption t-secondary ${styles.emptyFolder}`}>
              this folder is empty
            </span>
          )}
        </div>
      </div>

      <div className={styles.status}>
        <span className="t-caption t-nowrap">
          {selectedNode
            ? `${selectedNode.name}${selectedNode.repo?.description ? ` · ${selectedNode.repo.description}` : ""}`
            : `${items.length} ${items.length === 1 ? "item" : "items"}`}
        </span>
        {selectedNode?.repo && (
          <span className={styles.repo}>
            <span className={styles.stars}>
              <StarIcon style={{ fontSize: 13 }} />
              <span className="t-caption">{selectedNode.repo.stars}</span>
            </span>
            <Link
              href={selectedNode.repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="t-caption"
            >
              view on github
            </Link>
          </span>
        )}
      </div>
      <PropertiesDialog info={properties} onClose={() => setProperties(null)} />
    </div>
  );
};

const PropertiesDialog = ({
  info,
  onClose,
}: {
  info: { node: FsNode; location: string[] } | null;
  onClose: () => void;
}) => {
  const node = info?.node;
  const rows: Array<[string, ReactNode]> = [];
  if (node && info) {
    const location = [filesystem.name, ...info.location].join("/");
    rows.push(["type", node.type], ["location", location]);
    if (node.kind === "folder" && !node.repo) {
      rows.push(["items", String(node.children?.length ?? 0)]);
    }
    if (node.bytes !== undefined) {
      rows.push([
        node.repo ? "repository size" : "size",
        `${formatSize(node.bytes)} (${node.bytes.toLocaleString()} bytes)`,
      ]);
    }
    if (node.modified) {
      rows.push([
        node.repo ? "last push" : "modified",
        new Date(node.modified).toLocaleString(),
      ]);
    }
    if (node.repo) {
      rows.push(
        ["description", node.repo.description ?? "none"],
        ["stars", String(node.repo.stars)],
        ["default branch", node.repo.branch],
        [
          "repository",
          <Link
            key="repo"
            href={node.repo.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {node.repo.url.replace("https://", "")}
          </Link>,
        ],
      );
    }
  }

  return (
    <Dialog
      open={Boolean(info)}
      onClose={onClose}
      title={
        <>
          {node && <NodeIcon node={node} size={22} />}
          {node?.name}
        </>
      }
      actions={<Button onClick={onClose}>close</Button>}
    >
      <dl className={styles.properties}>
        {rows.map(([label, value]) => (
          <div key={label} className={styles.property}>
            <dt className="t-secondary">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </Dialog>
  );
};

const Cell = ({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) => (
  <div className={cx(className, styles.cell, "t-nowrap")} role="gridcell">
    {children}
  </div>
);

const RailItem = ({
  active,
  indent,
  icon,
  label,
  chevron,
  onClick,
}: {
  active: boolean;
  indent?: boolean;
  icon: ReactNode;
  label: string;
  chevron?: ReactNode;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-current={active ? "page" : undefined}
    className={cx(
      styles.place,
      indent && styles.indent,
      active && styles.current,
    )}
  >
    {chevron}
    {icon}
    <span className="t-nowrap">{label}</span>
  </button>
);
