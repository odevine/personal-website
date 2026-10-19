import { CSSProperties } from "react";

import { asciiAvatar } from "@/content/asciiAvatar";
import {
  FsNode,
  filesystem,
  nodeExists,
  resolveNode,
} from "@/content/filesystem";
import { getScheme } from "@/themes";
import pkg from "../../../../package.json";
import styles from "./Neofetch.module.css";

const startedAt = Date.now();

const version = (range: string) => range.replace(/^[^\d]*/, "");

const countFiles = (node: FsNode): number =>
  node.kind === "folder"
    ? (node.children ?? []).reduce((sum, child) => sum + countFiles(child), 0)
    : 1;

const ART_ROW_HEIGHT = 1.15;
const TEXT_ROW_HEIGHT = 1.7;

const swatchKeys = [
  "accent1",
  "accent2",
  "accent3",
  "accent4",
  "accent5",
  "accent6",
] as const;

export const Neofetch = ({
  host,
  scheme,
  themeMissing,
}: {
  host: string;
  scheme: string;
  themeMissing: boolean;
}) => {
  const minutes = Math.max(1, Math.round((Date.now() - startedAt) / 60000));
  const fontsMissing = !nodeExists(["system", "fonts"]);
  const palette = getScheme(scheme).palette;
  const rows: Array<[string, string]> = [
    ["OS", "devine.dev"],
    ["Host", host],
    ["Kernel", `react ${version(pkg.dependencies.react)}`],
    ["Bundler", `vite ${version(pkg.devDependencies.vite)}`],
    ["UI", "css modules, radix primitives"],
    ["Uptime", `${minutes} ${minutes === 1 ? "min" : "mins"}`],
    ["Shell", "owen-sh"],
    ["Resolution", `${window.innerWidth}x${window.innerHeight}`],
    [
      "Theme",
      themeMissing
        ? "monochrome (system/theme.json is missing)"
        : getScheme(scheme).label.toLowerCase(),
    ],
    [
      "Font",
      fontsMissing
        ? "Times New Roman (system/fonts is missing)"
        : "Inter, Noto Mono",
    ],
    ["Files", String(countFiles(filesystem))],
    ["Projects", String(resolveNode(["projects"])?.children?.length ?? 0)],
    ["Location", "maine"],
  ];

  // the name, a rule, every row and the swatches, plus the gap above the swatches
  const textHeight = (2 + rows.length + 1) * TEXT_ROW_HEIGHT + 0.6;
  const artRows = asciiAvatar.split("\n").length;
  const artScale = +(textHeight / (artRows * ART_ROW_HEIGHT)).toFixed(3);

  return (
    <div className={styles.neofetch}>
      <pre
        aria-hidden
        className={styles.art}
        style={{ "--art-scale": `${artScale}em` } as CSSProperties}
      >
        {asciiAvatar}
      </pre>
      <div>
        <div>
          <span style={{ color: "var(--syntax-fn)" }}>owen</span>
          <span style={{ color: "var(--syntax-operator)" }}>@</span>
          <span style={{ color: "var(--syntax-number)" }}>{host}</span>
        </div>
        <div className="t-secondary">{"-".repeat(5 + host.length)}</div>
        {rows.map(([label, value]) => (
          <div key={label}>
            <span className={styles.label}>{label.padEnd(11)}</span>
            {value}
          </div>
        ))}
        <div className={styles.swatches}>
          {swatchKeys.map((key) => (
            <span key={key} style={{ color: palette[key] }}>
              {"███"}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
