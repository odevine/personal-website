import { Box } from "@mui/material";

import { asciiAvatar } from "@/content/asciiAvatar";
import {
  FsNode,
  filesystem,
  nodeExists,
  resolveNode,
} from "@/content/filesystem";
import { getScheme } from "@/themes";
import pkg from "../../../../package.json";

const startedAt = Date.now();

const version = (range: string) => range.replace(/^[^\d]*/, "");

const countFiles = (node: FsNode): number =>
  node.kind === "folder"
    ? (node.children ?? []).reduce((sum, child) => sum + countFiles(child), 0)
    : 1;

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
    ["UI", `mui ${version(pkg.dependencies["@mui/material"])}`],
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

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-start",
        columnGap: 3,
        rowGap: 1,
        py: 0.5,
        whiteSpace: "pre",
      }}
    >
      <Box
        component="pre"
        aria-hidden
        sx={{
          m: 0,
          fontFamily: "inherit",
          fontSize: 12,
          lineHeight: 1.15,
          color: "primary.main",
        }}
      >
        {asciiAvatar}
      </Box>
      <Box>
        <Box>
          <Box component="span" sx={{ color: (t) => t.palette.syntax.fn }}>
            owen
          </Box>
          <Box
            component="span"
            sx={{ color: (t) => t.palette.syntax.operator }}
          >
            @
          </Box>
          <Box component="span" sx={{ color: (t) => t.palette.syntax.number }}>
            {host}
          </Box>
        </Box>
        <Box sx={{ color: "text.secondary" }}>
          {"-".repeat(5 + host.length)}
        </Box>
        {rows.map(([label, value]) => (
          <Box key={label}>
            <Box component="span" sx={{ color: "primary.main" }}>
              {label.padEnd(11)}
            </Box>
            {value}
          </Box>
        ))}
        <Box sx={{ mt: 1 }}>
          {swatchKeys.map((key) => (
            <Box key={key} component="span" sx={{ color: palette[key] }}>
              {"███"}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};
