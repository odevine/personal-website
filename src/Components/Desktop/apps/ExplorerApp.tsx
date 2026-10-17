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
import {
  alpha,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Stack,
  Theme,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CodeIcon from "@mui/icons-material/Code";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DataObjectIcon from "@mui/icons-material/DataObject";
import DescriptionIcon from "@mui/icons-material/Description";
import FolderIcon from "@mui/icons-material/Folder";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import HomeIcon from "@mui/icons-material/Home";
import ImageIcon from "@mui/icons-material/Image";
import StarIcon from "@mui/icons-material/Star";
import WebAssetIcon from "@mui/icons-material/WebAsset";

import { FsIcon, FsNode, filesystem, resolveNode } from "@/content/filesystem";
import { formatDate, formatSize } from "@/format";
import { useFilesystemVersion } from "@/content/useFilesystem";
import { copyText, MenuEntry, useContextMenu } from "../ContextMenu";
import { useDesktop } from "../DesktopContext";
import { appIcons } from "./appIcons";

type SortKey = "name" | "modified" | "type" | "size";

const MIN_COLUMN = 56;
const MAX_COLUMN = 600;
const defaultWidths = { name: 240, modified: 150, type: 130, size: 80 };
const NARROW = "@container (max-width: 560px)";

const iconFor: Record<FsIcon, (sx: object) => ReactNode> = {
  folder: (sx) => <FolderIcon sx={sx} />,
  project: (sx) => <FolderSpecialIcon sx={sx} />,
  markdown: (sx) => <DescriptionIcon sx={sx} />,
  image: (sx) => <ImageIcon sx={sx} />,
  json: (sx) => <DataObjectIcon sx={sx} />,
  app: (sx) => <WebAssetIcon sx={sx} />,
};

const iconColor = (icon: FsIcon) =>
  ({
    folder: "string",
    project: "string",
    markdown: "operator",
    image: "number",
    json: "fn",
    app: "string",
  })[icon];

// Apps show the same icon as the dock, everything else goes by file type
const NodeIcon = ({ node, size = 18 }: { node: FsNode; size?: number }) => {
  if (node.kind === "app" && node.appId) {
    return cloneElement(appIcons[node.appId], {
      sx: { fontSize: size, color: "primary.main" },
    });
  }
  return iconFor[node.icon]({
    fontSize: size,
    color: (theme: { palette: { syntax: Record<string, string> } }) =>
      theme.palette.syntax[iconColor(node.icon) ?? "string"],
  });
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
  const resizing = useRef<{ key: SortKey; startX: number; start: number }>();

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
        icon: <FolderOpenOutlinedIcon fontSize="small" />,
        onClick: () => open(node),
      });
    } else if (node.src) {
      entries.push({
        type: "item",
        label: "open in viewer",
        icon: <ImageIcon fontSize="small" />,
        onClick: () => open(node),
      });
    } else if (node.content !== undefined) {
      const content = node.content;
      if (node.name.endsWith(".md")) {
        entries.push({
          type: "item",
          label: "open preview",
          icon: <VisibilityOutlinedIcon fontSize="small" />,
          onClick: () => openFileAs(nodePath.join("/"), content, "preview"),
        });
      }
      entries.push({
        type: "item",
        label: "open in editor",
        icon: <CodeIcon fontSize="small" />,
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
        icon: <GitHubIcon fontSize="small" />,
        onClick: () => window.open(repo.url, "_blank", "noopener"),
      });
    }
    entries.push(
      { type: "divider" },
      {
        type: "item",
        label: "copy path",
        icon: <ContentCopyIcon fontSize="small" />,
        onClick: () => copyText([filesystem.name, ...nodePath].join("/")),
      },
      {
        type: "item",
        label: "properties",
        icon: <InfoOutlinedIcon fontSize="small" />,
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
      icon: <ArrowUpwardIcon fontSize="small" />,
      disabled: !path.length,
      onClick: goUp,
    },
  ];

  const rail = filesystem.children ?? [];

  return (
    <Stack
      sx={{ height: "100%", containerType: "inline-size", minWidth: 0 }}
      onKeyDown={onKeyDown}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.5}
        sx={{
          flexShrink: 0,
          px: 1,
          py: 0.75,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <IconButton
          size="small"
          aria-label="back"
          disabled={index === 0}
          onClick={back}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          aria-label="forward"
          disabled={index >= history.length - 1}
          onClick={forward}
        >
          <ArrowForwardIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          aria-label="up"
          disabled={!path.length}
          onClick={goUp}
        >
          <ArrowUpwardIcon fontSize="small" />
        </IconButton>
        <Stack
          direction="row"
          alignItems="center"
          component="nav"
          aria-label="path"
          sx={{
            flexGrow: 1,
            minWidth: 0,
            ml: 0.5,
            px: 0.5,
            overflow: "hidden",
            borderRadius: (theme) => `${theme.shape.borderRadius}px`,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            backgroundColor: "background.default",
          }}
        >
          {[filesystem.name, ...path].map((segment, i) => (
            <Stack
              key={i}
              direction="row"
              alignItems="center"
              sx={{ flexShrink: i === 0 ? 0 : 1, minWidth: 0 }}
            >
              {i > 0 && (
                <ChevronRightIcon
                  sx={{ fontSize: 16, color: "text.disabled" }}
                />
              )}
              <Box
                component="button"
                type="button"
                onClick={() => i !== path.length && go(path.slice(0, i))}
                sx={{
                  px: 0.75,
                  py: 0.25,
                  font: "inherit",
                  fontSize: 12,
                  color: i === path.length ? "text.primary" : "text.secondary",
                  background: "none",
                  border: 0,
                  borderRadius: 0.5,
                  cursor: i === path.length ? "default" : "pointer",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  "&:hover":
                    i === path.length
                      ? {}
                      : {
                          color: "text.primary",
                          backgroundColor: (theme) =>
                            alpha(theme.palette.text.primary, 0.08),
                        },
                }}
              >
                {segment}
              </Box>
            </Stack>
          ))}
        </Stack>
      </Stack>

      <Stack direction="row" sx={{ flexGrow: 1, minHeight: 0 }}>
        <Box
          component="nav"
          aria-label="places"
          sx={{
            flexShrink: 0,
            width: 168,
            overflowY: "auto",
            p: 1,
            borderRight: (theme) => `1px solid ${theme.palette.divider}`,
            backgroundColor: (theme) =>
              alpha(theme.palette.background.default, 0.5),
            [NARROW]: { display: "none" },
          }}
        >
          <RailItem
            active={path.length === 0}
            onClick={() => {
              setHomeOpen(true);
              if (path.length) go([]);
            }}
            icon={<HomeIcon sx={{ fontSize: 18, color: "primary.main" }} />}
            label={filesystem.name}
            chevron={
              <Box
                component="span"
                role="button"
                aria-label={homeOpen ? "collapse home" : "expand home"}
                onClick={(event) => {
                  event.stopPropagation();
                  setHomeOpen(!homeOpen);
                }}
                sx={{
                  display: "grid",
                  placeItems: "center",
                  mr: 0.25,
                  "&:hover": { color: "text.primary" },
                }}
              >
                <ChevronRightIcon
                  sx={{
                    fontSize: 16,
                    transition: "transform 120ms",
                    transform: homeOpen ? "rotate(90deg)" : "none",
                  }}
                />
              </Box>
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
        </Box>

        <Box
          role="grid"
          aria-label={folder.name}
          tabIndex={0}
          style={{ "--cols": columnTemplate } as CSSProperties}
          sx={{ flexGrow: 1, minWidth: 0, overflow: "auto", outline: 0 }}
          onClick={() => setSelected(null)}
          onContextMenu={(event) => {
            event.preventDefault();
            setSelected(null);
            show(event, backgroundMenu());
          }}
        >
          <Box
            role="row"
            sx={{
              display: "grid",
              gridTemplateColumns: "var(--cols)",
              width: "max-content",
              minWidth: "100%",
              position: "sticky",
              top: 0,
              zIndex: 1,
              backgroundColor: "background.paper",
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
              [NARROW]: {
                gridTemplateColumns: "minmax(0, 1fr) 130px",
                width: "auto",
                "& .col-type, & .col-size, & .col-filler, & .col-handle": {
                  display: "none",
                },
              },
            }}
          >
            {columns.map(({ key, label, className }) => (
              <Box
                key={key}
                className={className}
                sx={{ position: "relative", minWidth: 0 }}
              >
                <Box
                  role="columnheader"
                  component="button"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleSort(key);
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    width: "100%",
                    px: 1.5,
                    py: 0.75,
                    font: "inherit",
                    fontSize: 11,
                    textAlign: "left",
                    color: "text.secondary",
                    background: "none",
                    border: 0,
                    cursor: "pointer",
                    "&:hover": { color: "text.primary" },
                  }}
                >
                  {label}
                  {sort.key === key && (
                    <Box component="span" aria-hidden>
                      {sort.dir === 1 ? "▲" : "▼"}
                    </Box>
                  )}
                </Box>
                <Box
                  className="col-handle"
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
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: "-3px",
                    bottom: 0,
                    width: "7px",
                    zIndex: 1,
                    cursor: "col-resize",
                    touchAction: "none",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      top: "6px",
                      bottom: "6px",
                      left: "3px",
                      width: "1px",
                      backgroundColor: "divider",
                    },
                    "&:hover::after": {
                      backgroundColor: "primary.main",
                      left: "2px",
                      width: "3px",
                    },
                  }}
                />
              </Box>
            ))}
            <Box className="col-filler" />
          </Box>

          {items.map((node) => {
            const isSelected = node.name === selected;
            return (
              <Box
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
                sx={{
                  display: "grid",
                  gridTemplateColumns: "var(--cols)",
                  width: "max-content",
                  minWidth: "100%",
                  alignItems: "center",
                  cursor: "default",
                  userSelect: "none",
                  fontSize: 12.5,
                  backgroundColor: (theme) =>
                    isSelected
                      ? alpha(theme.palette.primary.main, 0.2)
                      : "transparent",
                  boxShadow: (theme) =>
                    isSelected
                      ? `inset 2px 0 0 ${theme.palette.primary.main}`
                      : "none",
                  "&:hover": {
                    backgroundColor: (theme) =>
                      isSelected
                        ? alpha(theme.palette.primary.main, 0.26)
                        : alpha(theme.palette.text.primary, 0.05),
                  },
                  [NARROW]: {
                    gridTemplateColumns: "minmax(0, 1fr) 130px",
                    width: "auto",
                    "& .col-type, & .col-size": { display: "none" },
                  },
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ px: 1.5, py: 0.75, minWidth: 0 }}
                  role="gridcell"
                >
                  <NodeIcon node={node} />
                  <Box
                    component="span"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {node.name}
                  </Box>
                  {node.system && (
                    <LockOutlinedIcon
                      aria-label="system file"
                      sx={{ fontSize: 13, color: "text.disabled" }}
                    />
                  )}
                </Stack>
                <Cell className="col-modified">
                  {formatDate(node.modified)}
                </Cell>
                <Cell className="col-type">{node.type}</Cell>
                <Cell className="col-size">{formatSize(node.bytes)}</Cell>
              </Box>
            );
          })}
          {!items.length && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", p: 2 }}
            >
              this folder is empty
            </Typography>
          )}
        </Box>
      </Stack>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        sx={{
          flexShrink: 0,
          px: 1.5,
          py: 0.5,
          minHeight: 28,
          color: "text.secondary",
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="caption" noWrap sx={{ minWidth: 0 }}>
          {selectedNode
            ? `${selectedNode.name}${selectedNode.repo?.description ? ` · ${selectedNode.repo.description}` : ""}`
            : `${items.length} ${items.length === 1 ? "item" : "items"}`}
        </Typography>
        {selectedNode?.repo && (
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{ flexShrink: 0 }}
          >
            <Stack direction="row" alignItems="center" spacing={0.25}>
              <StarIcon sx={{ fontSize: 13 }} />
              <Typography variant="caption">
                {selectedNode.repo.stars}
              </Typography>
            </Stack>
            <Link
              href={selectedNode.repo.url}
              target="_blank"
              rel="noopener noreferrer"
              variant="caption"
              underline="hover"
            >
              view on github
            </Link>
          </Stack>
        )}
      </Stack>
      <PropertiesDialog info={properties} onClose={() => setProperties(null)} />
    </Stack>
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
            underline="hover"
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
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          backgroundImage: "none",
          borderRadius: (theme: Theme) => `${theme.shape.borderRadius * 1.5}px`,
          border: (theme: Theme) => `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <DialogTitle
        sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: "1rem" }}
      >
        {node && <NodeIcon node={node} size={22} />}
        {node?.name}
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "max-content 1fr",
            columnGap: 2,
            rowGap: 0.75,
            fontSize: 13,
          }}
        >
          {rows.map(([label, value]) => (
            <Box key={label} sx={{ display: "contents" }}>
              <Box sx={{ color: "text.secondary" }}>{label}</Box>
              <Box sx={{ wordBreak: "break-word" }}>{value}</Box>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button size="small" onClick={onClose}>
          close
        </Button>
      </DialogActions>
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
  <Box
    className={className}
    role="gridcell"
    sx={{
      px: 1.5,
      py: 0.75,
      color: "text.secondary",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    }}
  >
    {children}
  </Box>
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
  <Box
    component="button"
    type="button"
    onClick={onClick}
    aria-current={active ? "page" : undefined}
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 0.75,
      width: "100%",
      pl: indent ? 2.75 : 0.5,
      pr: 0.75,
      py: 0.5,
      font: "inherit",
      fontSize: 12.5,
      textAlign: "left",
      cursor: "pointer",
      border: 0,
      borderRadius: (theme) => `${theme.shape.borderRadius * 0.75}px`,
      color: active ? "text.primary" : "text.secondary",
      backgroundColor: (theme) =>
        active ? alpha(theme.palette.primary.main, 0.2) : "transparent",
      "&:hover": {
        backgroundColor: (theme) =>
          active
            ? alpha(theme.palette.primary.main, 0.26)
            : alpha(theme.palette.text.primary, 0.06),
      },
    }}
  >
    {chevron}
    {icon}
    <Box
      component="span"
      sx={{
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </Box>
  </Box>
);
