import { useMemo } from "react";

import { Button } from "@/Components/ui/Button";
import { nodeExists } from "@/content/filesystem";
import { useFilesystemVersion } from "@/content/useFilesystem";
import { useTheme } from "@/ThemeContext";
import { getScheme, monochromeScheme } from "@/themes";
import { useEditor } from "../EditorContext";
import { ABOUT_PATH } from "../liveFiles";
import { Block, parseBlocks, renderInline } from "./markdown";
import styles from "./AboutApp.module.css";

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
    <h5 className="t-h5">
      <span style={{ color: palette[firstKey] }}>{first}</span>
      {rest.length > 0 && (
        <span style={{ color: palette[restKey] }}> {rest.join(" ")}</span>
      )}
    </h5>
  );
};

const BlockView = ({ block }: { block: Block }) => {
  if (block.kind === "heading") {
    return block.level === 1 ? (
      <h5 className="t-h5">{renderInline(block.text)}</h5>
    ) : (
      <h6 className="t-subtitle1">{renderInline(block.text)}</h6>
    );
  }
  if (block.kind === "list") {
    return (
      <ul className={styles.list}>
        {block.items.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ul>
    );
  }
  return (
    <p className={`t-body2 t-secondary ${styles.paragraph}`}>
      {renderInline(block.text)}
    </p>
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
    <div className={styles.about}>
      <div className={styles.header}>
        {hasAvatar ? (
          <img
            alt="picture of me"
            src="/images/avatar.png"
            className={styles.avatar}
          />
        ) : (
          <div aria-label="missing photo" className={styles.missingAvatar}>
            👻
          </div>
        )}
        <div className={styles.heading}>
          {!hasAbout && (
            <p className="t-body2 t-secondary">about.md: no such file</p>
          )}
          {title && <Title text={title.text} />}
          {subtitle && (
            <p className="t-body2 t-secondary">{renderInline(subtitle.text)}</p>
          )}
        </div>
      </div>
      {body.map((block, i) => (
        <BlockView key={i} block={block} />
      ))}
      <div className={styles.links}>
        {links.map(({ label, href }) => (
          <Button
            key={label}
            variant="outlined"
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
};
