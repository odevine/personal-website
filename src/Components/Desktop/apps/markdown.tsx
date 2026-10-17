import { ReactNode } from "react";
import { Link } from "@mui/material";

export type Block =
  | { kind: "heading"; level: number; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "paragraph"; text: string };

// Splits markdown into headings, bullet lists and paragraphs, line by line
export const parseBlocks = (source: string): Block[] => {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flush = () => {
    if (paragraph.length) {
      blocks.push({ kind: "paragraph", text: paragraph.join("\n") });
    }
    if (list.length) blocks.push({ kind: "list", items: list });
    paragraph = [];
    list = [];
  };

  for (const line of source.replace(/\r\n/g, "\n").split("\n")) {
    const heading = /^(#{1,3})\s+(.*)$/.exec(line.trim());
    const item = /^\s*[-*]\s+(.*)$/.exec(line);
    if (!line.trim()) {
      flush();
    } else if (heading) {
      flush();
      blocks.push({
        kind: "heading",
        level: heading[1].length,
        text: heading[2],
      });
    } else if (item) {
      if (paragraph.length) flush();
      list.push(item[1]);
    } else {
      if (list.length) flush();
      paragraph.push(line.trim());
    }
  }
  flush();
  return blocks;
};

const inline = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
const safeUrl = /^(https?:\/\/|mailto:)/i;

// Renders bold, code and links, anything else is shown as plain text
export const renderInline = (text: string): ReactNode[] =>
  text.split(inline).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code key={i} style={{ fontFamily: "inherit", opacity: 0.85 }}>
          {part.slice(1, -1)}
        </code>
      );
    }
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link && safeUrl.test(link[2])) {
      return (
        <Link
          key={i}
          href={link[2]}
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
        >
          {link[1]}
        </Link>
      );
    }
    return part;
  });
