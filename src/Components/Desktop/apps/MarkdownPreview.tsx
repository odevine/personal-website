import { Children, ReactElement, ReactNode, isValidElement } from "react";
import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { alpha, Box, Link, useTheme } from "@mui/material";

import { repoForPath } from "@/content/filesystem";
import { monoFont } from "@/themes";
import { Language, highlight } from "./highlight";

const codeLanguage = (fence: string | undefined): Language => {
  const name = /language-(\w+)/.exec(fence ?? "")?.[1];
  if (!name) return "plain";
  if (["md", "markdown"].includes(name)) return "md";
  if (
    [
      "ts",
      "tsx",
      "js",
      "jsx",
      "javascript",
      "typescript",
      "json",
      "css",
    ].includes(name)
  ) {
    return "ts";
  }
  return "plain";
};

const CodeBlock = ({
  text,
  language,
}: {
  text: string;
  language: Language;
}) => (
  <Box
    component="pre"
    sx={{
      m: 0,
      p: 1.5,
      overflowX: "auto",
      fontFamily: monoFont,
      fontSize: 12.5,
      lineHeight: 1.6,
      borderRadius: (theme) => `${theme.shape.borderRadius}px`,
      border: (theme) => `1px solid ${theme.palette.divider}`,
      backgroundColor: (theme) => alpha(theme.palette.text.primary, 0.04),
    }}
  >
    <code>
      {highlight(text, language).map((tokens, i) => (
        <div key={i} style={{ minHeight: "1.6em" }}>
          {tokens.map(([part, token], j) => (
            <Box
              key={j}
              component="span"
              sx={{ color: (theme) => theme.palette.syntax[token] }}
            >
              {part}
            </Box>
          ))}
        </div>
      ))}
    </code>
  </Box>
);

const textOf = (node: ReactNode): string =>
  typeof node === "string"
    ? node
    : Array.isArray(node)
      ? node.map(textOf).join("")
      : "";

interface Props {
  source: string;
  /** Path of the file in the editor, used to resolve relative links in READMEs */
  path: string;
}

// Renders markdown, including the GitHub flavored extras and the HTML READMEs use
const MarkdownPreview = ({ source, path }: Props) => {
  const theme = useTheme();
  const repo = repoForPath(path);
  const slug = repo?.url.replace("https://github.com/", "");

  // relative paths in a project's files point into its repository
  const urlTransform = (url: string, key: string) => {
    if (repo && slug && !/^([a-z][a-z0-9+.-]*:|\/|#)/i.test(url)) {
      const clean = url.replace(/^\.\//, "");
      return key === "src"
        ? `https://raw.githubusercontent.com/${slug}/${repo.branch}/${clean}`
        : `${repo.url}/blob/${repo.branch}/${clean}`;
    }
    return defaultUrlTransform(url);
  };

  return (
    <Box
      sx={{
        p: 2.5,
        fontSize: "0.875rem",
        lineHeight: 1.7,
        wordBreak: "break-word",
        "& > :first-child": { mt: 0 },
        "& h1, & h2, & h3, & h4": {
          fontFamily: monoFont,
          fontWeight: 600,
          lineHeight: 1.3,
          mt: 3,
          mb: 1.25,
        },
        "& h1": { fontSize: "1.6rem" },
        "& h2": {
          fontSize: "1.3rem",
          pb: 0.5,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        },
        "& h3": { fontSize: "1.1rem" },
        "& p, & ul, & ol, & blockquote, & table, & details": { mt: 0, mb: 1.5 },
        "& ul, & ol": { pl: 3 },
        "& li > p": { my: 0 },
        "& img": { maxWidth: "100%", height: "auto" },
        "& hr": {
          my: 2,
          border: 0,
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        },
        "& blockquote": {
          ml: 0,
          pl: 2,
          color: "text.secondary",
          borderLeft: (theme) => `3px solid ${theme.palette.primary.main}`,
        },
        "& table": {
          borderCollapse: "collapse",
          display: "block",
          overflowX: "auto",
        },
        "& th, & td": {
          px: 1.25,
          py: 0.5,
          textAlign: "left",
          border: (theme) => `1px solid ${theme.palette.divider}`,
        },
        "& th": { fontWeight: 600 },
        "& :not(pre) > code": {
          px: 0.5,
          py: 0.125,
          fontFamily: monoFont,
          fontSize: "0.85em",
          borderRadius: "4px",
          backgroundColor: (theme) => alpha(theme.palette.text.primary, 0.08),
        },
        "& pre": { mb: 1.5 },
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        remarkRehypeOptions={{ allowDangerousHtml: true }}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        urlTransform={urlTransform}
        components={{
          a: ({ href, children }) => (
            <Link
              href={href}
              underline="hover"
              {...(href?.startsWith("#")
                ? {}
                : { target: "_blank", rel: "noopener noreferrer" })}
            >
              {children}
            </Link>
          ),
          img: ({ src, alt }) => (
            <img src={src} alt={alt ?? ""} loading="lazy" />
          ),
          // picks the variant that matches the site's theme, not the system setting
          picture: ({ children }) => {
            const nodes = Children.toArray(children).filter(isValidElement);
            const img = nodes.find((node) => typeof node.type !== "string") as
              ReactElement<{ src?: string; alt?: string }> | undefined;
            const variant = nodes.find((node) => {
              const props = node.props as { media?: string };
              return (
                node.type === "source" &&
                /prefers-color-scheme:\s*dark/.test(props.media ?? "") ===
                  (theme.palette.mode === "dark")
              );
            }) as ReactElement<{ srcSet?: string | string[] }> | undefined;
            const set = variant?.props.srcSet;
            const first = (Array.isArray(set) ? set.join(",") : (set ?? ""))
              .trim()
              .split(/[\s,]+/)[0];
            const src = first ? urlTransform(first, "src") : img?.props.src;
            return src ? (
              <img src={src} alt={img?.props.alt ?? ""} loading="lazy" />
            ) : null;
          },
          pre: ({ children }) => {
            const code = isValidElement(children)
              ? (children as ReactElement<{
                  className?: string;
                  children?: ReactNode;
                }>)
              : undefined;
            return (
              <CodeBlock
                text={textOf(code?.props.children).replace(/\n$/, "")}
                language={codeLanguage(code?.props.className)}
              />
            );
          },
        }}
      >
        {source}
      </ReactMarkdown>
    </Box>
  );
};

export default MarkdownPreview;
