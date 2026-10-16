import { Box, Stack, Typography } from "@mui/material";

import { SyntaxToken, monoFont } from "@/themes";

export type CodeSegment = [text: string, token: SyntaxToken];

// Renders lines of syntax-colored segments in an editor-style window, using
// the active theme's palette for both the chrome and the code
export const CodeBlock = ({
  lines,
  filename,
}: {
  lines: CodeSegment[][];
  filename: string;
}) => (
  <Box
    sx={{
      overflow: "hidden",
      borderRadius: 2,
      border: (theme) => `1px solid ${theme.palette.divider}`,
      backgroundColor: "background.paper",
      boxShadow: (theme) => `0 24px 60px -24px ${theme.palette.common.black}99`,
    }}
  >
    <Stack
      direction="row"
      alignItems="center"
      spacing={2}
      sx={{
        px: 2,
        py: 1.25,
        backgroundColor: "background.default",
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Stack direction="row" spacing={1} aria-hidden>
        {(["keyword", "string", "fn"] as SyntaxToken[]).map((token) => (
          <Box
            key={token}
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: (theme) => theme.palette.syntax[token],
            }}
          />
        ))}
      </Stack>
      <Typography
        variant="caption"
        sx={{ fontFamily: monoFont, color: "text.secondary" }}
      >
        {filename}
      </Typography>
    </Stack>
    <Box
      component="pre"
      sx={{
        m: 0,
        py: 2,
        overflowX: "auto",
        fontFamily: monoFont,
        fontSize: { xs: "0.75rem", sm: "0.875rem" },
        lineHeight: 1.8,
      }}
    >
      <code>
        {lines.map((segments, i) => (
          <Box
            key={i}
            component="div"
            sx={{ display: "flex", whiteSpace: "pre", minHeight: "1.8em" }}
          >
            <Box
              component="span"
              aria-hidden
              sx={{
                flexShrink: 0,
                width: { xs: 36, sm: 48 },
                pr: 2,
                textAlign: "right",
                userSelect: "none",
                color: "text.disabled",
              }}
            >
              {i + 1}
            </Box>
            <span>
              {segments.map(([text, token], j) => (
                <Box
                  key={j}
                  component="span"
                  sx={{ color: (theme) => theme.palette.syntax[token] }}
                >
                  {text}
                </Box>
              ))}
              {i === lines.length - 1 && (
                <Box
                  component="span"
                  aria-hidden
                  sx={{
                    display: "inline-block",
                    width: "0.55em",
                    height: "1.1em",
                    verticalAlign: "text-bottom",
                    backgroundColor: "text.secondary",
                    "@keyframes blink": { "50%": { opacity: 0 } },
                    animation: "blink 1.1s step-end infinite",
                    "@media (prefers-reduced-motion: reduce)": {
                      animation: "none",
                    },
                  }}
                />
              )}
            </span>
          </Box>
        ))}
      </code>
    </Box>
  </Box>
);
