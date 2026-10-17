import {
  ChangeEvent,
  KeyboardEvent,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { alpha, Box } from "@mui/material";

import { monoFont } from "@/themes";
import { Language, highlight } from "./highlight";

const INDENT = "  ";

// The highlighted layer and the textarea must share these exactly
const textStyle = {
  fontFamily: monoFont,
  fontSize: 13,
  lineHeight: "22px",
  letterSpacing: 0,
  tabSize: INDENT.length,
  whiteSpace: "pre",
} as const;

const padding = "12px 16px 12px 0";

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
    <Box
      sx={{
        display: "flex",
        width: "max-content",
        minWidth: "100%",
        minHeight: "100%",
      }}
    >
      <Box
        aria-hidden
        sx={{
          ...textStyle,
          position: "sticky",
          left: 0,
          zIndex: 1,
          flexShrink: 0,
          minWidth: 36,
          py: "12px",
          pr: 1.25,
          textAlign: "right",
          userSelect: "none",
          color: "text.disabled",
          backgroundColor: "background.paper",
        }}
      >
        {lines.map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </Box>
      <Box sx={{ position: "relative", flexGrow: 1 }}>
        <Box
          component="pre"
          aria-hidden
          sx={{ ...textStyle, m: 0, p: padding, pointerEvents: "none" }}
        >
          {lines.map((tokens, i) => (
            <div key={i} style={{ minHeight: textStyle.lineHeight }}>
              {tokens.map(([text, token], j) => (
                <Box
                  key={j}
                  component="span"
                  sx={{ color: (theme) => theme.palette.syntax[token] }}
                >
                  {text}
                </Box>
              ))}
            </div>
          ))}
        </Box>
        <Box
          component="textarea"
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
          sx={{
            ...textStyle,
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            m: 0,
            p: padding,
            border: 0,
            outline: 0,
            resize: "none",
            overflow: "hidden",
            color: "transparent",
            caretColor: (theme) => theme.palette.text.primary,
            background: "transparent",
            "&::selection": {
              backgroundColor: (theme) =>
                alpha(theme.palette.primary.main, 0.35),
            },
          }}
        />
      </Box>
    </Box>
  );
};
