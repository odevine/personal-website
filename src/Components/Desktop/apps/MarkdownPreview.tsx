import { Children, ReactElement, ReactNode, isValidElement } from "react";
import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

import { Link } from "@/Components/ui/Link";
import { repoForPath } from "@/content/filesystem";
import { useTheme } from "@/ThemeContext";
import { getScheme } from "@/themes";
import { Language, highlight } from "./highlight";
import styles from "./MarkdownPreview.module.css";

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
  <pre className={styles.code}>
    <code>
      {highlight(text, language).map((tokens, i) => (
        <div key={i} className={styles.codeLine}>
          {tokens.map(([part, token], j) => (
            <span key={j} style={{ color: `var(--syntax-${token})` }}>
              {part}
            </span>
          ))}
        </div>
      ))}
    </code>
  </pre>
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
  const { scheme, themeMissing } = useTheme();
  const dark = themeMissing || getScheme(scheme).mode === "dark";
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
    <div className={styles.markdown}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        remarkRehypeOptions={{ allowDangerousHtml: true }}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        urlTransform={urlTransform}
        components={{
          a: ({ href, children }) => (
            <Link
              href={href}
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
                /prefers-color-scheme:\s*dark/.test(props.media ?? "") === dark
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
    </div>
  );
};

export default MarkdownPreview;
