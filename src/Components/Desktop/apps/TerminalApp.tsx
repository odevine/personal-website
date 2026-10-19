import {
  Fragment,
  KeyboardEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import { getAchievements, resetAchievements, unlock } from "@/achievements";
import { AchievementId, achievementsSummary } from "@/content/achievements";
import { buildDive } from "@/content/dive";
import { defaultMotd, isGeneratedFile, isSystemFile } from "@/content/files";
import {
  FsNode,
  addNode,
  baselineNode,
  filesystem,
  newTextFile,
  nodeExists,
  removeNode,
  restoreNode,
  resolveNode,
} from "@/content/filesystem";
import { useFilesystemVersion } from "@/content/useFilesystem";
import { formatDate, formatSize } from "@/format";
import { useTheme } from "@/ThemeContext";
import { colorSchemes } from "@/themes";
import { transitionToScheme } from "@/themeTransition";
import styles from "./TerminalApp.module.css";
import { AppId, appIds, appMeta } from "../appMeta";
import { useDesktop } from "../DesktopContext";
import { useEditor } from "../EditorContext";
import {
  PRESENCE_LINE,
  PRESENCE_SHUDDER,
  PRESENCE_START,
} from "../presenceEvents";
import { DiveLine, TYPE_MS } from "./DiveLine";

interface Entry {
  id: number;
  node: ReactNode;
}

const contact = [
  ["email", "mailto:owen@devine.dev", "owen@devine.dev"],
  ["github", "https://github.com/odevine", "github.com/odevine"],
  [
    "linkedin",
    "https://www.linkedin.com/in/odevine/",
    "linkedin.com/in/odevine",
  ],
  ["discord", "https://discord.com/users/98183996185255936", "@ode"],
] as const;

const resolveApp = (name: string): AppId | undefined =>
  appIds.find((id) => appMeta[id].aliases.includes(name));

// Walks the filesystem by name, ignoring case, and returns the node with its exact path
const lookup = (
  parts: string[],
): { node: FsNode; path: string[] } | undefined => {
  let node = filesystem;
  const path: string[] = [];
  for (const part of parts) {
    const child =
      node.children?.find((c) => c.name === part) ??
      node.children?.find((c) => c.name.toLowerCase() === part.toLowerCase());
    if (!child) return undefined;
    node = child;
    path.push(child.name);
  }
  return { node, path };
};

// Turns something typed like ../mimic, ~/documents or /projects into path parts
const resolvePath = (arg: string, from: string[]): string[] => {
  const parts = arg.startsWith("/") || arg.startsWith("~") ? [] : [...from];
  for (const segment of arg.replace(/^~/, "").split("/")) {
    if (!segment || segment === ".") continue;
    if (segment === "..") parts.pop();
    else parts.push(segment);
  }
  return parts;
};

const displayPath = (path: string[]) => ["~", ...path].join("/");

interface Token {
  text: string;
  /** A redirect such as > or >> rather than a word */
  operator: boolean;
}

// Splits a command line into words, keeping quoted text together and spotting > and >>
const tokenize = (line: string): Token[] =>
  [...line.matchAll(/"([^"]*)"|'([^']*)'|(>>|>)|([^\s>"']+)/g)].map((m) =>
    m[3]
      ? { text: m[3], operator: true }
      : { text: m[1] ?? m[2] ?? m[4], operator: false },
  );

// Where files can be changed: documents freely, system only with sudo
const readOnlyFolders = ["applications", "projects"];

const permission = (path: string[]) =>
  path[0] === "system" ||
  (path[0] !== undefined && readOnlyFolders.includes(path[0]))
    ? "r-"
    : "rw";

const nodeColors: Record<FsNode["icon"], string> = {
  folder: "var(--syntax-string)",
  project: "var(--syntax-string)",
  markdown: "var(--syntax-operator)",
  image: "var(--syntax-number)",
  json: "var(--syntax-fn)",
  app: "var(--primary)",
};

const NodeName = ({ node }: { node: FsNode }) => (
  <span style={{ color: nodeColors[node.icon] }}>
    {node.name}
    {node.kind === "folder" ? "/" : ""}
  </span>
);

// Folders first, then by name, the same order the explorer starts with
const listing = (folder: FsNode) =>
  [...(folder.children ?? [])].sort((a, b) =>
    (a.kind === "folder") !== (b.kind === "folder")
      ? a.kind === "folder"
        ? -1
        : 1
      : a.name.localeCompare(b.name, undefined, { numeric: true }),
  );

// What deleting each system file does to the site
const removalNotes: Record<string, string> = {
  "system/theme.json": "the site has lost its look",
  "system/dock.json": "the dock is gone",
  "system/fonts": "falling back to the browser's own fonts",
  "system/animations":
    "everything stops moving and the screen stops repainting properly",
  "system/gravity": "open windows begin to drift",
  "system/hostname": "the host is now localhost",
  "system/motd": "there is no message of the day",
  "pictures/avatar.png": "the about window has no photo",
};

// Deleting these files unlocks an achievement, folders count for the files inside
const deletionAchievements: Record<string, AchievementId> = {
  "system/theme.json": "lost-its-look",
  "system/gravity": "weightless",
  "system/animations": "frozen",
  "system/fonts": "serif-society",
  "system/hostname": "identity-crisis",
  "system/motd": "silence",
  "pictures/avatar.png": "faceless",
};

// The path of a node and of everything inside it
const pathsWithin = (node: FsNode, path: string[]): string[] => [
  path.join("/"),
  ...(node.children ?? []).flatMap((child) =>
    pathsWithin(child, [...path, child.name]),
  ),
];

const commandNames = [
  "help",
  "whoami",
  "ls",
  "cd",
  "pwd",
  "cat",
  "echo",
  "touch",
  "rm",
  "open",
  "projects",
  "contact",
  "theme",
  "ach",
  "restore",
  "reboot",
  "shutdown",
  "sudo",
  "clear",
];

// Commands whose arguments are paths
const pathCommands = ["cd", "ls", "cat", "rm", "open", "touch", "restore"];

interface Completion {
  text: string;
  /** Added after a unique match, a space for words and files, a slash for folders */
  suffix: string;
  node?: FsNode;
}

export const TerminalApp = () => {
  const { openApp, openFile, openImage, revealInExplorer, showScreen } =
    useDesktop();
  const { scheme, setScheme, themeMissing } = useTheme();
  const { contents, editFile, replaceFile } = useEditor();
  useFilesystemVersion();

  const [entries, setEntries] = useState<Entry[]>(() => [
    {
      id: 0,
      node: nodeExists(["system", "motd"])
        ? (contents["system/motd"] ?? defaultMotd).trimEnd()
        : "motd: file not found",
    },
  ]);
  const [input, setInput] = useState("");
  const [past, setPast] = useState<string[]>([]);
  const [cursor, setCursor] = useState<number>();
  const [cwd, setCwd] = useState<string[]>([]);
  const nextId = useRef(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const host = nodeExists(["system", "hostname"])
    ? contents["system/hostname"]?.trim() || "devine"
    : "localhost";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [entries]);

  const print = (node: ReactNode) =>
    setEntries((prev) => [...prev, { id: nextId.current++, node }]);

  // The dive plays out line by line, and ctrl+c cuts it short
  const diving = useRef<{ timers: ReturnType<typeof setTimeout>[] } | null>(
    null,
  );
  const SURFACE = "https://depthcollector.com/";

  // while the dive plays the prompt is hidden, but the input stays focused to catch ctrl+c
  const [busy, setBusy] = useState(false);

  const finishDive = () => {
    diving.current = null;
    setBusy(false);
    // whether it ended or was cut off, whatever is down there stays on the line
    window.dispatchEvent(new Event(PRESENCE_START));
  };

  const startDive = () => {
    if (diving.current) return;
    unlock("dive");
    const run = { timers: [] as ReturnType<typeof setTimeout>[] };
    diving.current = run;
    setBusy(true);
    let at = 0;
    for (const step of buildDive()) {
      at += step.wait;
      run.timers.push(
        setTimeout(() => {
          print(
            <DiveLine tone={step.tone} text={step.text} type={step.type} />,
          );
          if (step.shudder) window.dispatchEvent(new Event(PRESENCE_SHUDDER));
        }, at),
      );
      // a typed line is not finished until the last character is out
      if (step.type) at += step.text.length * TYPE_MS;
    }
    run.timers.push(
      setTimeout(() => {
        print(
          <>
            <DiveLine text="surface link: " />
            <a
              href={SURFACE}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              depthcollector.com
            </a>
          </>,
        );
        finishDive();
      }, at + 900),
    );
  };

  const cutDive = () => {
    diving.current?.timers.forEach(clearTimeout);
    print(<DiveLine tone="threat" text="^C" />);
    print(<DiveLine tone="corrupt" text="CONNECTION DROPPED" />);
    print(<DiveLine tone="dim" text="(something is still on the line)" />);
    finishDive();
  };

  // closing the terminal mid dive leaves the sequence unfinished, not the presence
  useEffect(
    () => () => {
      if (!diving.current) return;
      diving.current.timers.forEach(clearTimeout);
      finishDive();
    },
    // finishDive only uses a ref and the window
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // the presence sends the odd line while this terminal is open
  useEffect(() => {
    const onLine = (event: Event) =>
      print(<DiveLine text={String((event as CustomEvent).detail)} />);
    window.addEventListener(PRESENCE_LINE, onLine);
    return () => window.removeEventListener(PRESENCE_LINE, onLine);
    // print only uses state setters and a ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The text a file currently holds, which may have been edited since it was opened
  const readText = (path: string[]): string | undefined => {
    const node = lookup(path)?.node;
    if (node?.content === undefined) return undefined;
    return contents[path.join("/")] ?? node.content;
  };

  // Returns a reason if the terminal may not create or change a file here
  const writeError = (path: string[], elevated: boolean) => {
    const shown = displayPath(path);
    if (path.length < 2) return `${shown}: cannot write here`;
    if (isGeneratedFile(path.join("/"))) return `${shown}: read-only`;
    if (path[0] === "system") {
      return elevated ? undefined : `${shown}: permission denied, try sudo`;
    }
    if (path[0] === "documents") return undefined;
    return `${shown}: read-only`;
  };

  const writeText = (
    typed: string[],
    text: string,
    append: boolean,
    elevated: boolean,
  ): string | undefined => {
    const existing = lookup(typed);
    const path = existing?.path ?? typed;
    const error = writeError(path, elevated);
    if (error) return error;

    if (existing) {
      if (
        existing.node.kind !== "file" ||
        existing.node.content === undefined
      ) {
        return `${displayPath(path)}: not a text file`;
      }
      editFile(path.join("/"), append ? (readText(path) ?? "") + text : text);
      return undefined;
    }

    const parent = lookup(typed.slice(0, -1));
    if (!parent || parent.node.kind !== "folder") {
      return `${displayPath(typed)}: no such folder`;
    }
    const name = typed[typed.length - 1];
    const fullPath = [...parent.path, name];
    replaceFile(fullPath.join("/"), text);
    addNode(
      parent.path,
      newTextFile(name, text, isSystemFile(fullPath.join("/"))),
    );
    unlock("scribe");
    return undefined;
  };

  const remove = (
    flags: string,
    targets: string[],
    elevated: boolean,
  ): ReactNode => {
    const recursive = /[rR]/.test(flags);
    const lines: string[] = [];

    for (const target of targets) {
      // the one command everybody tries
      if (target === "/" || target === "/*") {
        if (!recursive) {
          lines.push(`rm: ${target}: is a folder, use -r`);
        } else if (!elevated) {
          unlock("nice-try");
          lines.push("rm: it is dangerous to operate recursively on '/'");
        } else {
          unlock("kernel-panic");
          showScreen("panic");
          lines.push("removing everything...");
        }
        continue;
      }

      const found = lookup(resolvePath(target, cwd));
      if (!found) {
        lines.push(`rm: ${target}: no such file or folder`);
        continue;
      }
      const { node, path } = found;
      const shown = displayPath(path);

      if (path[0] === "system" && !elevated) {
        lines.push(`rm: ${shown}: permission denied, try sudo`);
      } else if (path[0] === "applications" || path[0] === "projects") {
        lines.push(`rm: ${shown}: read-only`);
      } else if (isGeneratedFile(path.join("/"))) {
        lines.push(`rm: ${shown}: read-only`);
      } else if (node.kind === "folder" && !recursive) {
        lines.push(`rm: ${shown}: is a folder, use -r`);
      } else if (path.length === 1 && !(path[0] === "system" && recursive)) {
        lines.push(`rm: ${shown}: refusing to remove a top-level folder`);
      } else {
        const removed = pathsWithin(node, path);
        removeNode(path);
        removed.forEach((gone) => {
          const id = deletionAchievements[gone];
          if (id) unlock(id);
        });
        if (
          path[0] === "system" &&
          !resolveNode(["system"])?.children?.length
        ) {
          unlock("spring-cleaning");
        }
        lines.push(`removed ${shown}`);
        const note =
          removalNotes[path.join("/")] ??
          (path[0] === "system" && path.length === 1
            ? "all of the site's system files are gone"
            : undefined);
        if (note) lines.push(note);
        if (path[0] === "system") {
          lines.push(
            `undo it with: sudo restore ${displayPath(path)}, or refresh the page`,
          );
        }
      }
    }
    return lines.join("\n");
  };

  // Completes the word at the end of the input, or lists the choices when there are several
  const complete = () => {
    const finished = /\s$/.test(input);
    const words = input.trim() ? input.trimStart().split(/\s+/) : [];
    const current = finished || !words.length ? "" : words[words.length - 1];
    const done = finished || !words.length ? words : words.slice(0, -1);
    // the words before this one, without a leading sudo
    const lead = done[0] === "sudo" ? done.slice(1) : done;
    const prefixOf = (text: string) =>
      text.toLowerCase().startsWith(current.toLowerCase());

    let options: Completion[] = [];
    if (!lead.length) {
      options = commandNames
        .filter(prefixOf)
        .map((text) => ({ text, suffix: " " }));
    } else {
      const command = lead[0].toLowerCase();
      const previous = done[done.length - 1];
      if (command === "theme" && lead.length === 1) {
        options = colorSchemes
          .filter((s) => prefixOf(s.name))
          .map((s) => ({ text: s.name, suffix: "" }));
      } else if (
        pathCommands.includes(command) ||
        (command === "echo" && (previous === ">" || previous === ">>"))
      ) {
        if (current === "~") {
          options = [{ text: "~/", suffix: "" }];
        } else {
          const slash = current.lastIndexOf("/");
          const dirPart = current.slice(0, slash + 1);
          const typed = current.slice(slash + 1).toLowerCase();
          const parts = resolvePath(dirPart, cwd);
          // restore looks at what the page started with, so deleted files show up
          const folder =
            command === "restore" ? baselineNode(parts) : lookup(parts)?.node;
          options = (folder?.children ?? [])
            .filter(
              (child) =>
                child.name.toLowerCase().startsWith(typed) &&
                (command !== "cd" || child.kind === "folder"),
            )
            .map((child) => ({
              text: dirPart + child.name,
              suffix: child.kind === "folder" ? "/" : " ",
              node: child,
            }));
          if (command === "open" && !dirPart) {
            options.push(
              ...appIds
                .map((id) => appMeta[id].aliases[0])
                .filter((name) => name.startsWith(typed) && typed)
                .map((text) => ({ text, suffix: " " })),
            );
          }
        }
      }
    }
    if (!options.length) return;

    const head = input.slice(0, input.length - current.length);
    if (options.length === 1) {
      setInput(head + options[0].text + options[0].suffix);
      return;
    }

    // several matches, extend to what they share, or show them when that adds nothing
    let shared = options[0].text;
    for (const option of options) {
      let i = 0;
      while (
        i < shared.length &&
        i < option.text.length &&
        shared[i].toLowerCase() === option.text[i].toLowerCase()
      ) {
        i += 1;
      }
      shared = shared.slice(0, i);
    }
    if (shared.length > current.length) {
      setInput(head + shared);
      return;
    }
    setEntries((prev) => [
      ...prev,
      {
        id: nextId.current++,
        node: (
          <div className={styles.echo}>
            <Prompt cwd={cwd} host={host} /> {input}
          </div>
        ),
      },
      {
        id: nextId.current++,
        node: (
          <>
            {options.map((option, i) => (
              <Fragment key={option.text}>
                {option.node ? (
                  <NodeName node={option.node} />
                ) : (
                  option.text.replace(/^.*\//, "")
                )}
                {i < options.length - 1 && "  "}
              </Fragment>
            ))}
          </>
        ),
      },
    ]);
  };

  const run = (raw: string): ReactNode | null | undefined => {
    let tokens = tokenize(raw);
    if (!tokens.length) return undefined;

    let elevated = false;
    if (tokens[0].text === "sudo" && !tokens[0].operator) {
      elevated = true;
      tokens = tokens.slice(1);
      if (!tokens.length) return "usage: sudo <command>";
    }

    const [head, ...rest] = tokens;
    const command = head.text.toLowerCase();
    const args = rest.map((t) => t.text);
    const arg = args.join(" ").toLowerCase();

    switch (command) {
      case "help":
        return [
          "help             show this list",
          "whoami           a short intro",
          "ls [-l] [path]   list a folder",
          "cd [path]        change folder",
          "pwd              show the current folder",
          "cat <file>       print a text file",
          "echo <text>      print text, or write it with > file or >> file",
          "touch <file>     create an empty file",
          "rm [-r] <path>   delete a file",
          "open <name>      open an app, file or folder",
          "projects         list projects",
          "contact          ways to reach me",
          "theme [name]     list or switch color schemes",
          "ach              show what you have unlocked",
          "ach reset --yes  forget everything you have unlocked",
          "sudo <command>   run a command as the system owner",
          "clear            clear the screen",
        ].join("\n");
      case "whoami":
        return "owen devine, software developer in maine";
      case "pwd":
        return displayPath(cwd);
      case "cd": {
        // with no argument cd goes home
        const typed = args.join(" ").trim();
        const target = lookup(typed ? resolvePath(typed, cwd) : []);
        if (!target) return `cd: no such folder: ${typed}`;
        if (target.node.kind !== "folder") return `cd: not a folder: ${typed}`;
        setCwd(target.path);
        return undefined;
      }
      case "ls": {
        const long = args.some((a) => a.startsWith("-") && a.includes("l"));
        const where = args.filter((a) => !a.startsWith("-")).join(" ");
        const target = lookup(resolvePath(where, cwd));
        if (!target) return `ls: no such file or folder: ${where}`;
        const nodes =
          target.node.kind === "folder" ? listing(target.node) : [target.node];
        if (!nodes.length) return undefined;
        if (!long) {
          return (
            <>
              {nodes.map((node, i) => (
                <Fragment key={node.name}>
                  <NodeName node={node} />
                  {i < nodes.length - 1 && "  "}
                </Fragment>
              ))}
            </>
          );
        }
        return (
          <>
            {nodes.map((node) => (
              <div key={node.name} className={styles.pre}>
                {node.kind === "folder" ? "d" : "-"}
                {permission([...target.path, node.name])}{" "}
                {(formatSize(node.bytes) || "-").padStart(8)}{" "}
                {(formatDate(node.modified) || "-").padStart(13)}{" "}
                <NodeName node={node} />
              </div>
            ))}
          </>
        );
      }
      case "cat": {
        if (!args.length) return "cat: which file?";
        return args
          .map((a) => {
            const found = lookup(resolvePath(a, cwd));
            if (!found) return `cat: ${a}: no such file`;
            const text = readText(found.path);
            return text === undefined
              ? `cat: ${a}: not a text file`
              : text.replace(/\n$/, "");
          })
          .join("\n");
      }
      case "echo": {
        const redirectAt = rest.findIndex((t) => t.operator);
        if (redirectAt === -1) return args.join(" ");
        const text = rest
          .slice(0, redirectAt)
          .map((t) => t.text)
          .join(" ");
        const target = rest[redirectAt + 1];
        if (!target || target.operator) return "echo: missing file after >";
        return (
          writeText(
            resolvePath(target.text, cwd),
            text + "\n",
            rest[redirectAt].text === ">>",
            elevated,
          ) ?? undefined
        );
      }
      case "touch": {
        if (!args.length) return "touch: which file?";
        return (
          args
            .map((a) => {
              const typed = resolvePath(a, cwd);
              return lookup(typed)
                ? undefined
                : writeText(typed, "", false, elevated);
            })
            .filter(Boolean)
            .join("\n") || undefined
        );
      }
      case "rm": {
        const flags = args.filter((a) => a.startsWith("-")).join("");
        const targets = args.filter((a) => !a.startsWith("-"));
        if (!targets.length) return "rm: what should i remove?";
        return remove(flags, targets, elevated);
      }
      case "restore": {
        if (!args.length) return "restore: which file?";
        const typed = resolvePath(args.join(" "), cwd);
        if (typed[0] === "system" && !elevated) {
          return `restore: ${displayPath(typed)}: permission denied, try sudo`;
        }
        const result = restoreNode(typed);
        if (result === "unknown")
          return `restore: nothing to restore at ${displayPath(typed)}`;
        if (result === "present")
          return `${displayPath(typed)} is already there`;
        unlock("undo");
        return `restored ${displayPath(typed)}`;
      }
      case "reboot":
      case "shutdown": {
        if (!elevated) return `${command}: permission denied, try sudo`;
        unlock(
          command === "reboot" ? "turn-it-off-and-on" : "safe-to-turn-off",
        );
        showScreen(command === "reboot" ? "boot" : "off");
        return command === "reboot" ? "rebooting..." : "shutting down...";
      }
      case "open": {
        const typed = args.join(" ").trim();
        if (!typed) return "open: what should i open? try ls";
        // a bare name that is not in this folder is also looked for in documents
        const found =
          lookup(resolvePath(typed, cwd)) ?? lookup(["documents", typed]);
        if (found) {
          const { node, path } = found;
          if (node.kind === "app" && node.appId) {
            openApp(node.appId);
          } else if (node.kind === "folder") {
            revealInExplorer(path.join("/"));
          } else if (node.src) {
            const siblings = (lookup(path.slice(0, -1))?.node.children ?? [])
              .filter((n) => n.src)
              .map((n) => ({ name: n.name, src: n.src!, bytes: n.bytes }));
            openImage(
              siblings,
              siblings.findIndex((n) => n.name === node.name),
            );
          } else if (node.content !== undefined) {
            openFile(
              path.join("/"),
              node.content,
              node.name.endsWith(".md") ? "preview" : undefined,
            );
          } else {
            return `open: ${node.name} cannot be opened`;
          }
          return `opening ${node.name}`;
        }
        const target = resolveApp(arg);
        if (!target) return `open: nothing named "${typed}". try ls`;
        openApp(target);
        return `opening ${appMeta[target].title}`;
      }
      case "projects":
        return (resolveNode(["projects"])?.children ?? [])
          .map((p) => `${p.name}\n  ${p.repo?.description ?? "no description"}`)
          .join("\n\n");
      case "dive":
        startDive();
        return diving.current ? (
          <DiveLine text="dialing depthcollector.com ..." />
        ) : (
          <DiveLine text="already connected. try ctrl+c" />
        );
      case "contact":
        return (
          <>
            {contact.map(([label, href, text]) => (
              <div key={label}>
                {label.padEnd(10)}
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  {text}
                </a>
              </div>
            ))}
          </>
        );
      case "theme": {
        if (themeMissing) {
          return "theme: unavailable, system/theme.json is missing";
        }
        if (!arg) {
          return colorSchemes
            .map((s) => `${s.name === scheme ? "*" : " "} ${s.name}`)
            .join("\n");
        }
        const match = colorSchemes.find((s) => s.name === arg);
        if (!match) return `theme: unknown scheme "${arg}". try theme`;
        // ripple outward from the prompt line
        const rect = inputRef.current?.getBoundingClientRect();
        transitionToScheme(
          setScheme,
          match.name,
          rect ? rect.left + 24 : window.innerWidth / 2,
          rect ? rect.top + rect.height / 2 : window.innerHeight / 2,
        );
        return `switched to ${match.label}`;
      }
      case "ach": {
        if (args[0]?.toLowerCase() !== "reset") {
          return achievementsSummary(getAchievements().unlocked);
        }
        // forgetting everything cannot be undone, so it needs a second word
        if (args[1] !== "--yes") {
          return "this forgets everything you have unlocked. run it again as: ach reset --yes";
        }
        resetAchievements();
        return "achievements reset";
      }
      case "clear":
        return null;
      default:
        unlock("typo");
        return `command not found: ${head.text}. try help`;
    }
  };

  const submit = () => {
    const raw = input;
    const result = run(raw);
    const echoed: Entry = {
      id: nextId.current++,
      node: (
        <div className={styles.echo}>
          <Prompt cwd={cwd} host={host} /> {raw}
        </div>
      ),
    };

    if (result === null) {
      setEntries([]);
    } else {
      const output: Entry[] =
        result === undefined ? [] : [{ id: nextId.current++, node: result }];
      setEntries((prev) => [...prev, echoed, ...output]);
    }
    if (raw.trim()) setPast((prev) => [...prev, raw]);
    setCursor(undefined);
    setInput("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (busy) {
      // nothing can be typed until the dive ends, only ctrl+c gets through
      event.preventDefault();
      if (event.ctrlKey && event.key.toLowerCase() === "c") cutDive();
    } else if (event.key === "Tab") {
      event.preventDefault();
      complete();
    } else if (event.key === "Enter") {
      submit();
    } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      const step = event.key === "ArrowUp" ? -1 : 1;
      const from = cursor ?? past.length;
      const next = Math.min(Math.max(from + step, 0), past.length);
      setCursor(next);
      setInput(past[next] ?? "");
    }
  };

  return (
    <div
      onClick={() =>
        !window.getSelection()?.toString() && inputRef.current?.focus()
      }
      className={styles.terminal}
    >
      {entries.map((entry) => (
        <div key={entry.id} className={styles.entry}>
          {entry.node}
        </div>
      ))}
      {/* while the dive plays the prompt is hidden, but the input stays focused */}
      <div className={busy ? "sr-only" : styles.promptLine}>
        <Prompt cwd={cwd} host={host} />
        <input
          ref={inputRef}
          autoFocus
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          aria-label="terminal input"
          value={input}
          onChange={(e) => !busy && setInput(e.target.value)}
          onKeyDown={onKeyDown}
          className={styles.input}
        />
      </div>
      <div ref={bottomRef} />
    </div>
  );
};

const Prompt = ({ cwd, host }: { cwd: string[]; host: string }) => (
  <span className={styles.prompt}>
    <span style={{ color: "var(--syntax-fn)" }}>owen</span>
    <span style={{ color: "var(--syntax-operator)" }}>@</span>
    <span style={{ color: "var(--syntax-number)" }}>{host}</span>
    <span className="t-secondary">{` ${displayPath(cwd)} $`}</span>
  </span>
);
