import { Container, Stack, Button, Typography, Link, Box } from "@mui/material";
import ArrowForward from "@mui/icons-material/ArrowForward";
import { useState } from "react";
import TextTransition from "react-text-transition";
import { navigate } from "raviger";

import { CodeBlock, CodeSegment, Reveal } from "@/Components";
import { SyntaxToken } from "@/themes";

// Each column is a [character, syntax-token] tuple. The token drives the color
// of that column (see theme.palette.syntax), giving the morphing text a
// code-like, multi-color look. Empty columns still carry a token, but it is
// never visible.
type Column = [string, SyntaxToken];

const buttons: Array<{
  transitionArray: Column[];
  caption: string;
  buttonText: string;
  link?: string;
  action?: () => void;
}> = [
  {
    // owen devine
    transitionArray: [
      ["", "punctuation"],
      ["o", "fn"],
      ["w", "fn"],
      ["e", "fn"],
      ["n", "fn"],
      [" ", "punctuation"],
      ["d", "number"],
      ["e", "number"],
      ["v", "number"],
      ["i", "number"],
      ["n", "number"],
      ["e", "number"],
      ["", "punctuation"],
    ],
    caption: "software developer in brunswick, maine",
    buttonText: "me",
  },
  {
    // owen.devine.dev
    transitionArray: [
      ["", "punctuation"],
      ["o", "fn"],
      ["w", "fn"],
      ["e", "fn"],
      ["n", "fn"],
      [".", "operator"],
      ["d", "number"],
      ["e", "number"],
      ["v", "number"],
      ["i", "number"],
      ["n", "number"],
      ["e", "number"],
      [".dev", "string"],
    ],
    caption: "built with ⚡ vite ⚡",
    buttonText: "website",
  },
  {
    // owen@devine.dev
    transitionArray: [
      ["", "punctuation"],
      ["o", "fn"],
      ["w", "fn"],
      ["e", "fn"],
      ["n", "fn"],
      ["@", "operator"],
      ["d", "number"],
      ["e", "number"],
      ["v", "number"],
      ["i", "number"],
      ["n", "number"],
      ["e", "number"],
      [".dev", "string"],
    ],
    caption: "powered by fastmail <3",
    buttonText: "contact",
    link: "mailto: owen@devine.dev",
  },
  {
    // @ode
    transitionArray: [
      ["@", "operator"],
      ["o", "fn"],
      ["", "punctuation"],
      ["", "punctuation"],
      ["", "punctuation"],
      ["", "punctuation"],
      ["d", "number"],
      ["e", "number"],
      ["", "punctuation"],
      ["", "punctuation"],
      ["", "punctuation"],
      ["", "punctuation"],
      ["", "punctuation"],
    ],
    caption: "this counts as social media, right?",
    buttonText: "discord",
    link: "https://discord.com/users/98183996185255936",
  },
  {
    // @odevine
    transitionArray: [
      ["@", "operator"],
      ["o", "fn"],
      ["", "punctuation"],
      ["", "punctuation"],
      ["", "punctuation"],
      ["", "punctuation"],
      ["d", "number"],
      ["e", "number"],
      ["v", "number"],
      ["i", "number"],
      ["n", "number"],
      ["e", "number"],
      ["", "punctuation"],
    ],
    caption: "a graveyard of good intentions",
    buttonText: "github",
    link: "https://github.com/odevine",
  },
  {
    // oh no
    transitionArray: [
      ["", "punctuation"],
      ["o", "keyword"],
      ["h", "keyword"],
      ["", "punctuation"],
      ["", "punctuation"],
      [" ", "punctuation"],
      ["", "punctuation"],
      ["", "punctuation"],
      ["", "punctuation"],
      ["", "punctuation"],
      ["", "punctuation"],
      ["n", "keyword"],
      ["o", "keyword"],
    ],
    caption: "half-baked but sometimes still cooking",
    buttonText: "current projects",
    action: () => navigate("/projects"),
  },
];

const kw = (t: string): CodeSegment => [t, "keyword"];
const fn = (t: string): CodeSegment => [t, "fn"];
const str = (t: string): CodeSegment => [t, "string"];
const num = (t: string): CodeSegment => [t, "number"];
const op = (t: string): CodeSegment => [t, "operator"];
const v = (t: string): CodeSegment => [t, "variable"];
const p = (t: string): CodeSegment => [t, "punctuation"];

// Placeholder content for the about section
const aboutCode: CodeSegment[][] = [
  [p("// who i am, as far as typescript is concerned")],
  [kw("const "), v("owen"), op(" = "), p("{")],
  [p("  "), fn("role"), p(": "), str('"frontend developer"'), p(",")],
  [p("  "), fn("location"), p(": "), str('"brunswick, maine"'), p(",")],
  [
    p("  "),
    fn("yearsOfExperience"),
    p(": "),
    num("0"),
    p(",  "),
    p("// placeholder"),
  ],
  [p("  "), fn("stack"), p(": [")],
  [
    p("    "),
    str('"react"'),
    p(", "),
    str('"typescript"'),
    p(", "),
    str('"vite"'),
    p(","),
  ],
  [p("    "), str('"mui"'), p(", "), str('"react-spring"'), p(",")],
  [p("  ],")],
  [p("  "), fn("currentlyBuilding"), p(": "), str('"edh tracker"'), p(",")],
  [
    p("  "),
    fn("funFact"),
    p(": "),
    str('"placeholder, write something real here"'),
    p(","),
  ],
  [p("  "), fn("openToWork"), p(": "), kw("true"), p(",")],
  [p("}"), p(";")],
  [],
  [kw("export default "), v("owen"), p(";")],
];

export const Home = (): JSX.Element => {
  const [currentButtonIndex, setCurrentButtonIndex] = useState(0);

  return (
    <Container maxWidth="lg">
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems="center"
        justifyContent="center"
        spacing={{ xs: 4, md: 10 }}
        sx={{ minHeight: "100vh", pt: { xs: 9, md: 0 }, pb: 6 }}
      >
        <Box
          component="img"
          alt="picture of me"
          src="/images/me.jpg"
          sx={{
            order: { md: 2 },
            width: { xs: 160, sm: 220, md: 320 },
            aspectRatio: "1",
            objectFit: "cover",
            borderRadius: "50%",
            border: (theme): string =>
              `2px solid ${theme.palette.secondary.main}`,
            boxShadow: (theme): string =>
              `0 0 0 8px ${theme.palette.background.paper}, 0 0 60px ${theme.palette.secondary.main}33`,
          }}
        />
        <Stack
          alignItems={{ xs: "center", md: "flex-start" }}
          sx={{ order: { md: 1 }, textAlign: { xs: "center", md: "left" } }}
        >
          <Typography
            variant="overline"
            sx={{ color: "text.secondary", letterSpacing: "0.2em" }}
          >
            frontend developer
          </Typography>
          <Stack direction="row" sx={{ mt: 1, height: { xs: 40, sm: 52 } }}>
            {buttons[currentButtonIndex].transitionArray.map(
              ([char, token], i) => (
                <Typography
                  variant="h3"
                  key={i}
                  sx={{
                    color: (theme) => theme.palette.syntax[token],
                    // Noto Mono advances 0.6em, and TextTransition rounds each
                    // column's width to whole pixels, so keep 0.6 * size integral
                    fontSize: { xs: 25, sm: 35 },
                    fontWeight: 400,
                    letterSpacing: 0,
                  }}
                >
                  <TextTransition
                    inline
                    key={i}
                    springConfig={{ mass: 5, tension: 2000, friction: 200 }}
                  >
                    {char}
                  </TextTransition>
                </Typography>
              ),
            )}
          </Stack>
          <Typography
            variant="h6"
            sx={{ mt: 2, color: "text.secondary", minHeight: 32 }}
          >
            {buttons[currentButtonIndex].caption}
          </Typography>
          <Stack
            direction="row"
            useFlexGap
            flexWrap="wrap"
            justifyContent={{ xs: "center", md: "flex-start" }}
            sx={{ mt: 4, gap: 1.5, maxWidth: 480 }}
          >
            {buttons.map((button, index) => (
              <Link
                key={button.buttonText}
                {...(button.link
                  ? {
                      href: button.link,
                      underline: "none",
                      target: "_blank",
                      rel: "noopener noreferrer",
                    }
                  : {})}
              >
                <Button
                  variant="outlined"
                  onMouseEnter={(): void => setCurrentButtonIndex(index)}
                  onFocus={(): void => setCurrentButtonIndex(index)}
                  endIcon={button.action ? <ArrowForward /> : undefined}
                  sx={{
                    background: (theme) => theme.palette.background.paper,
                    minWidth: 130,
                  }}
                  {...(button.action ? { onClick: button.action } : {})}
                >
                  {button.buttonText}
                </Button>
              </Link>
            ))}
          </Stack>
        </Stack>
      </Stack>

      <Box sx={{ maxWidth: 720, mx: "auto", pb: 10 }}>
        <Reveal>
          <Typography variant="h5" gutterBottom>
            about
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            i build interfaces for the web. most of my free time goes into side
            projects, usually something that scratches a small itch for me or my
            friends.
          </Typography>
          <CodeBlock lines={aboutCode} filename="owen.ts" />
        </Reveal>
      </Box>

      <Box
        component="footer"
        sx={{
          py: 3,
          textAlign: "center",
          color: "text.secondary",
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="caption">
          © {new Date().getFullYear()} owen devine
        </Typography>
      </Box>
    </Container>
  );
};
