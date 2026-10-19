import {
  ChangeEvent,
  KeyboardEvent,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";

import { Language, highlight } from "./highlight";
import styles from "./CodeEditor.module.css";

// matches tab-size in the stylesheet
const INDENT = "  ";

interface Props {
  value: string;
  /** The text can be selected and copied but not changed */
  readOnly?: boolean;
  language: Language;
  onChange: (value: string) => void;
}

// A text editor built from a syntax-colored layer with a transparent textarea on top
export const CodeEditor = ({
  value,
  language,
  onChange,
  readOnly = false,
}: Props) => {
  const lines = useMemo(() => highlight(value, language), [value, language]);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const caret = useRef<number | null>(null);

  // Controlled textareas reset the caret on change, so restore it after edits made here
  useLayoutEffect(() => {
    if (caret.current !== null && textarea.current) {
      textarea.current.selectionStart = textarea.current.selectionEnd =
        caret.current;
      caret.current = null;
    }
  });

  const insert = (text: string) => {
    const el = textarea.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    caret.current = start + text.length;
    onChange(value.slice(0, start) + text + value.slice(end));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Tab" && !event.shiftKey) {
      event.preventDefault();
      insert(INDENT);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const start = event.currentTarget.selectionStart;
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const indent = /^[ \t]*/.exec(value.slice(lineStart, start))![0];
      const opensBlock = /[{[(]$/.test(value.slice(0, start));
      insert("\n" + indent + (opensBlock ? INDENT : ""));
    }
  };

  return (
    <div className={styles.editor}>
      <div
        aria-hidden
        data-fade-inset="left"
        className={`${styles.text} ${styles.gutter}`}
      >
        {lines.map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <div className={styles.page}>
        <pre aria-hidden className={`${styles.text} ${styles.layer}`}>
          {lines.map((tokens, i) => (
            <div key={i} className={styles.row}>
              {tokens.map(([text, token], j) => (
                <span key={j} style={{ color: `var(--syntax-${token})` }}>
                  {text}
                </span>
              ))}
            </div>
          ))}
        </pre>
        <textarea
          ref={textarea}
          value={value}
          aria-label="editor"
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          wrap="off"
          readOnly={readOnly}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
            onChange(event.target.value)
          }
          onKeyDown={onKeyDown}
          className={`${styles.text} ${styles.input}`}
        />
      </div>
    </div>
  );
};
