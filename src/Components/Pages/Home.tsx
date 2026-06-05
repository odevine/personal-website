import { Container, Stack, Button, Typography, Link, Box } from "@mui/material";
import { useState } from "react";
import TextTransition from "react-text-transition";
import { navigate } from "raviger";

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
      ["o", "fn"], ["w", "fn"], ["e", "fn"], ["n", "fn"],
      [" ", "punctuation"],
      ["d", "number"], ["e", "number"], ["v", "number"],
      ["i", "number"], ["n", "number"], ["e", "number"],
      ["", "punctuation"],
    ],
    caption: "software developer in brunswick, maine",
    buttonText: "me",
  },
  {
    // owen.devine.dev
    transitionArray: [
      ["", "punctuation"],
      ["o", "fn"], ["w", "fn"], ["e", "fn"], ["n", "fn"],
      [".", "operator"],
      ["d", "number"], ["e", "number"], ["v", "number"],
      ["i", "number"], ["n", "number"], ["e", "number"],
      [".dev", "string"],
    ],
    caption: "built with ⚡ vite ⚡",
    buttonText: "website",
  },
  {
    // owen@devine.dev
    transitionArray: [
      ["", "punctuation"],
      ["o", "fn"], ["w", "fn"], ["e", "fn"], ["n", "fn"],
      ["@", "operator"],
      ["d", "number"], ["e", "number"], ["v", "number"],
      ["i", "number"], ["n", "number"], ["e", "number"],
      [".dev", "string"],
    ],
    caption: "powered by fastmail <3",
    buttonText: "contact",
    link: "mailto: owen@devine.dev",
  },
  {
    // @ode
    transitionArray: [
      ["@", "operator"], ["o", "fn"],
      ["", "punctuation"], ["", "punctuation"], ["", "punctuation"], ["", "punctuation"],
      ["d", "fn"], ["e", "fn"],
      ["", "punctuation"], ["", "punctuation"], ["", "punctuation"], ["", "punctuation"], ["", "punctuation"],
    ],
    caption: "this counts as social media, right?",
    buttonText: "discord",
    link: "https://discord.com/users/98183996185255936",
  },
  {
    // @odevine
    transitionArray: [
      ["@", "operator"], ["o", "fn"],
      ["", "punctuation"], ["", "punctuation"], ["", "punctuation"], ["", "punctuation"],
      ["d", "fn"], ["e", "fn"], ["v", "fn"], ["i", "fn"], ["n", "fn"], ["e", "fn"],
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
      ["o", "keyword"], ["h", "keyword"],
      ["", "punctuation"], ["", "punctuation"],
      [" ", "punctuation"],
      ["", "punctuation"], ["", "punctuation"], ["", "punctuation"],
      ["", "punctuation"], ["", "punctuation"],
      ["n", "keyword"], ["o", "keyword"],
    ],
    caption: "half-baked but sometimes still cooking",
    buttonText: "current projects",
    action: () => navigate("/projects"),
  },
];

export const Home = (): JSX.Element => {
  const [currentButtonIndex, setCurrentButtonIndex] = useState(0);

  return (
    <Container sx={{ height: "100%" }}>
      <Stack
        direction="column"
        alignItems="center"
        justifyContent="center"
        sx={{ height: "100%", minHeight: { xs: 600 } }}
      >
        <Box
          component="img"
          alt="picture of me"
          src="/images/me.jpg"
          sx={{
            height: { xs: 140, sm: 200 },
            borderRadius: 8,
            border: (theme): string =>
              `2px solid ${theme.palette.secondary.main}`,
          }}
        />
        <Stack direction="row" sx={{ mt: { xs: 1, sm: 4 }, height: 48 }}>
          {buttons[currentButtonIndex].transitionArray.map(
            ([char, token], i) => (
              <Typography
                variant="h4"
                key={i}
                sx={{ color: (theme) => theme.palette.syntax[token] }}
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
        <Typography variant="h6" sx={{ mt: 3, mb: 2, textAlign: "center" }}>
          {buttons[currentButtonIndex].caption}
        </Typography>
        {buttons.map((button, index) => (
          <Link
            key={button.buttonText}
            sx={{ mt: 2 }}
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
              sx={{
                background: (theme) => theme.palette.background.paper,
                width: 150,
                textTransform: "none",
              }}
              {...(button.action
                ? {
                    onClick: button.action,
                  }
                : {})}
            >
              {button.buttonText}
            </Button>
          </Link>
        ))}
      </Stack>
    </Container>
  );
};
