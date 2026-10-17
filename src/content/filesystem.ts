import { appIds, appMeta } from "@/Components/Desktop/appMeta";
import type { AppId } from "@/Components/Desktop/appMeta";
import config from "./explorerConfig.json";
import { defaultThemeFileText } from "@/themeFile";
import { seedFiles } from "./files";
import github from "./githubData.json";

export type FsIcon =
  "folder" | "project" | "markdown" | "image" | "json" | "app";

export interface FsNode {
  name: string;
  /** "app" nodes open an app window when opened */
  kind: "folder" | "file" | "app";
  icon: FsIcon;
  /** Shown in the Type column */
  type: string;
  /** ISO date */
  modified?: string;
  bytes?: number;
  appId?: AppId;
  children?: FsNode[];
  /** Text files carry their content so the editor can open them */
  content?: string;
  /** Images carry a URL so the viewer can open them */
  src?: string;
  /** System files can only be changed with sudo, and are read-only in the editor */
  system?: boolean;
  repo?: {
    url: string;
    branch: string;
    description: string | null;
    stars: number;
  };
}

interface RepoData {
  description: string | null;
  language: string | null;
  pushedAt: string;
  sizeKb: number;
  stars: number;
  url: string;
  readmeBytes: number | null;
  readme: string | null;
  defaultBranch: string;
}

const repoData = github.repos as Record<string, RepoData>;

// A project with a markdown file in content/writeups gets a write-up.md
const writeUps = import.meta.glob("./writeups/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;
const fileBytes = github.files as Record<string, number>;

const folder = (
  name: string,
  children: FsNode[],
  extra: Partial<FsNode> = {},
): FsNode => ({
  name,
  kind: "folder",
  icon: "folder",
  type: "File folder",
  children,
  ...extra,
});

const image = (name: string, modified?: string): FsNode => ({
  name,
  kind: "file",
  icon: "image",
  type: "PNG image",
  modified,
  bytes: fileBytes[name],
  src: `/images/${name}`,
});

const textFile = (name: string, content: string): FsNode => {
  const extension = name.split(".").pop();
  const kinds: Record<string, Pick<FsNode, "icon" | "type">> = {
    md: { icon: "markdown", type: "Markdown file" },
    css: { icon: "json", type: "CSS file" },
    json: { icon: "json", type: "JSON file" },
  };
  return {
    name,
    kind: "file",
    ...(kinds[extension ?? ""] ?? { icon: "markdown", type: "Text file" }),
    bytes: new TextEncoder().encode(content).length,
    content,
  };
};

const app = (name: string, appId: AppId): FsNode => ({
  name,
  kind: "app",
  icon: "app",
  type: "Application",
  appId,
});

const projectFolder = (project: (typeof config.projects)[number]): FsNode => {
  const data = repoData[project.repo];
  const modified = data.pushedAt;
  const children: FsNode[] = [
    {
      name: "README.md",
      kind: "file",
      icon: "markdown",
      type: "Markdown file",
      modified,
      bytes: data.readmeBytes ?? undefined,
      content: data.readme ?? undefined,
    },
  ];
  const writeUp = writeUps[`./writeups/${project.slug}.md`];
  if (writeUp !== undefined) {
    children.push({ ...textFile("write-up.md", writeUp), modified });
  }
  if (project.screenshots.length) {
    children.push(
      folder(
        "screenshots",
        project.screenshots.map((name) => image(name, modified)),
        { modified },
      ),
    );
  }

  return {
    name: project.slug,
    kind: "folder",
    icon: "project",
    type: data.language ? `${data.language} project` : "Project",
    modified,
    bytes: data.sizeKb * 1024,
    children,
    repo: {
      url: data.url,
      branch: data.defaultBranch,
      description: data.description,
      stars: data.stars,
    },
  };
};

const baseName = (path: string) => path.split("/").pop() ?? path;

const buildFilesystem = (): FsNode =>
  folder("owendevine", [
    // every app except the explorer itself, named as in the dock
    folder(
      "applications",
      appIds
        .filter((id) => id !== "explorer")
        .map((id) => app(appMeta[id].title, id)),
    ),
    folder(
      "pictures",
      config.pictures.map((name) => image(name)),
    ),
    folder(
      "documents",
      seedFiles
        .filter((file) => file.path.startsWith("documents/"))
        .map((file) => textFile(baseName(file.path), file.content)),
    ),
    folder(
      "system",
      [
        ...seedFiles
          .filter((file) => file.path.startsWith("system/"))
          .map((file) => textFile(baseName(file.path), file.content)),
        // the editor keeps this one in step with the live settings
        textFile("theme.json", defaultThemeFileText),
      ].map((node) => ({ ...node, system: true })),
      { system: true },
    ),
    folder(
      "projects",
      config.projects
        .filter((project) => repoData[project.repo])
        .map(projectFolder),
    ),
  ]);

/** The live tree. Deleting and creating files changes it until the page reloads */
export const filesystem: FsNode = buildFilesystem();

// An untouched copy, used to put deleted files back
const baseline: FsNode = buildFilesystem();

const resolveIn = (root: FsNode, path: string[]): FsNode | undefined =>
  path.reduce<FsNode | undefined>(
    (node, name) => node?.children?.find((child) => child.name === name),
    root,
  );

export const resolveNode = (path: string[]): FsNode | undefined =>
  resolveIn(filesystem, path);

/** A node as it was when the page loaded, including files since deleted */
export const baselineNode = (path: string[]): FsNode | undefined =>
  resolveIn(baseline, path);

export const nodeExists = (path: string[]) => resolveNode(path) !== undefined;

/** True for a system file or anything inside the system folder */
export const isSystemPath = (path: string[]) =>
  resolveNode(path)?.system === true;

let version = 0;
const listeners = new Set<() => void>();

export const subscribeFilesystem = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Changes whenever a file is added or removed */
export const filesystemVersion = () => version;

const changed = () => {
  version += 1;
  listeners.forEach((listener) => listener());
};

export const removeNode = (path: string[]): boolean => {
  const parent = resolveNode(path.slice(0, -1));
  const name = path[path.length - 1];
  if (!parent?.children?.some((child) => child.name === name)) return false;
  // a new array, so anything memoized on the folder notices the change
  parent.children = parent.children.filter((child) => child.name !== name);
  changed();
  return true;
};

export const addNode = (parentPath: string[], node: FsNode): boolean => {
  const parent = resolveNode(parentPath);
  if (parent?.kind !== "folder") return false;
  parent.children = [
    ...(parent.children ?? []).filter((child) => child.name !== node.name),
    node,
  ];
  changed();
  return true;
};

/** Puts a deleted file back from the untouched copy */
export const restoreNode = (
  path: string[],
): "restored" | "present" | "unknown" => {
  const original = resolveIn(baseline, path);
  if (!original) return "unknown";
  if (nodeExists(path)) return "present";
  addNode(path.slice(0, -1), JSON.parse(JSON.stringify(original)));
  return "restored";
};

/** A new empty-or-filled text file for the terminal's touch and echo */
export const newTextFile = (name: string, content: string, system = false) => {
  const node = textFile(name, content);
  return system ? { ...node, system: true } : node;
};

/** When the GitHub snapshot was taken */
export const snapshotDate: string = github.generatedAt;

/** The repository a file inside a project folder belongs to, if any */
export const repoForPath = (path: string): FsNode["repo"] =>
  path.startsWith("projects/")
    ? resolveNode(path.split("/").slice(0, 2))?.repo
    : undefined;
