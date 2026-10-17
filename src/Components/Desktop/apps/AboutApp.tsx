import { useMemo } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";

import { nodeExists } from "@/content/filesystem";
import { useFilesystemVersion } from "@/content/useFilesystem";
import { useTheme } from "@/ThemeContext";
import { getScheme, monochromeScheme } from "@/themes";
import { useEditor } from "../EditorContext";
import { ABOUT_PATH } from "../liveFiles";
import { Block, parseBlocks, renderInline } from "./markdown";

const links = [
  { label: "email", href: "mailto:owen@devine.dev" },
  { label: "github", href: "https://github.com/odevine" },
  { label: "linkedin", href: "https://www.linkedin.com/in/odevine/" },
  { label: "discord", href: "https://discord.com/users/98183996185255936" },
];

const colorKeys = [
  "accent1",
  "accent2",
  "accent3",
  "accent4",
  "accent5",
  "accent6",
] as const;

// Shuffled once per page load, so the name's colors differ between visits
// but stay put while the page is open
const shuffled = (() => {
  const keys = [...colorKeys];
  for (let i = keys.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [keys[i], keys[j]] = [keys[j], keys[i]];
  }
  return keys;
})();

// The first word and the rest of a title get two different scheme colors,
// neither of them the current accent
const Title = ({ text }: { text: string }) => {
  const { scheme, settings, themeMissing } = useTheme();
  const [first, ...rest] = text.split(" ");
  const accentKey = settings.accent === "default" ? "accent6" : settings.accent;
  const [firstKey, restKey] = shuffled.filter((key) => key !== accentKey);
  const palette = (themeMissing ? monochromeScheme : getScheme(scheme)).palette;

  return (
    <Typography variant="h5">
      <Box component="span" sx={{ color: palette[firstKey] }}>
        {first}
      </Box>
      {rest.length > 0 && (
        <Box component="span" sx={{ color: palette[restKey] }}>
          {" "}
          {rest.join(" ")}
        </Box>
      )}
    </Typography>
  );
};

const BlockView = ({ block }: { block: Block }) => {
  if (block.kind === "heading") {
    return (
      <Typography variant={block.level === 1 ? "h5" : "subtitle1"}>
        {renderInline(block.text)}
      </Typography>
    );
  }
  if (block.kind === "list") {
    return (
      <Box
        component="ul"
        sx={{ m: 0, pl: 2.5, color: "text.secondary", fontSize: "0.875rem" }}
      >
        {block.items.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </Box>
    );
  }
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ whiteSpace: "pre-line" }}
    >
      {renderInline(block.text)}
    </Typography>
  );
};

export const AboutApp = () => {
  const { contents } = useEditor();
  useFilesystemVersion();
  // deleting these from the terminal shows what the window looks like without them
  const hasAbout = nodeExists(["documents", "about.md"]);
  const hasAvatar = nodeExists(["pictures", "avatar.png"]);
  const blocks = useMemo(
    () => parseBlocks(hasAbout ? (contents[ABOUT_PATH] ?? "") : ""),
    [contents, hasAbout],
  );

  // a leading title and the line after it sit beside the photo
  const title = blocks[0]?.kind === "heading" ? blocks[0] : undefined;
  const afterTitle = title ? blocks.slice(1) : blocks;
  const subtitle =
    title && afterTitle[0]?.kind === "paragraph" ? afterTitle[0] : undefined;
  const body = subtitle ? afterTitle.slice(1) : afterTitle;

  return (
    <Stack spacing={2} sx={{ p: 2.5 }}>
      <Stack direction="row" alignItems="center" spacing={2.5}>
        {hasAvatar ? (
          <Box
            component="img"
            alt="picture of me"
            src="/images/avatar.png"
            sx={{
              width: 80,
              height: 80,
              flexShrink: 0,
              objectFit: "cover",
              borderRadius: "50%",
              border: (theme) => `2px solid ${theme.palette.primary.main}`,
            }}
          />
        ) : (
          <Box
            aria-label="missing photo"
            sx={{
              width: 80,
              height: 80,
              flexShrink: 0,
              display: "grid",
              placeItems: "center",
              fontSize: 40,
              borderRadius: "50%",
              border: (theme) => `2px dashed ${theme.palette.divider}`,
            }}
          >
            👻
          </Box>
        )}
        <Stack spacing={0.5} sx={{ minWidth: 0 }}>
          {!hasAbout && (
            <Typography variant="body2" color="text.secondary">
              about.md: no such file
            </Typography>
          )}
          {title && <Title text={title.text} />}
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {renderInline(subtitle.text)}
            </Typography>
          )}
        </Stack>
      </Stack>
      {body.map((block, i) => (
        <BlockView key={i} block={block} />
      ))}
      <Stack direction="row" useFlexGap flexWrap="wrap" gap={1}>
        {links.map(({ label, href }) => (
          <Button
            key={label}
            size="small"
            variant="outlined"
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
          >
            {label}
          </Button>
        ))}
      </Stack>
    </Stack>
  );
};
