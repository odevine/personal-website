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

// Width at which the art and the text fit on one line
const SIDE_BY_SIDE_PX = 700;
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

  // the name, a rule, every row and the swatches, plus the gap above the swatches
  const textHeight = (2 + rows.length + 1) * TEXT_ROW_HEIGHT + 0.6;
  const artRows = asciiAvatar.split("\n").length;
  const artScale = +(textHeight / (artRows * ART_ROW_HEIGHT)).toFixed(3);

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
        containerType: "inline-size",
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
          // side by side with the text, the art grows to the text's height with its shape kept
          [`@container (min-width: ${SIDE_BY_SIDE_PX}px)`]: {
            fontSize: `${artScale}em`,
          },
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
