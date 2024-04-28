import { Container, Stack, Button, Typography, Link, Box } from "@mui/material";
import { useState } from "react";
import TextTransition from "react-text-transition";

const buttons: Array<{
  transitionArray: string[];
  caption: string;
  buttonText: string;
  link?: string;
  action?: () => void;
}> = [
  {
    transitionArray: [
      "",
      "o",
      "w",
      "e",
      "n",
      " ",
      "d",
      "e",
      "v",
      "i",
      "n",
      "e",
      "",
    ],
    caption: "software developer in brunswick, maine",
    buttonText: "me",
  },
  {
    transitionArray: [
      "",
      "o",
      "w",
      "e",
      "n",
      ".",
      "d",
      "e",
      "v",
      "i",
      "n",
      "e",
      ".dev",
    ],
    caption: "built to try out ⚡ vite ⚡",
    buttonText: "website",
  },
  {
    transitionArray: [
      "",
      "o",
      "w",
      "e",
      "n",
      "@",
      "d",
      "e",
      "v",
      "i",
      "n",
      "e",
      ".dev",
    ],
    caption: "powered by fastmail <3",
    buttonText: "contact",
    link: "mailto: owen@devine.dev",
  },
  {
    transitionArray: ["@", "o", "", "", "", "", "d", "e", "", "", "", "", ""],
    caption: "it's like irc but worse?",
    buttonText: "discord",
    link: "https://discord.com/users/98183996185255936",
  },
  {
    transitionArray: [
      "@",
      "o",
      "",
      "",
      "",
      "",
      "d",
      "e",
      "v",
      "i",
      "n",
      "e",
      "",
    ],
    caption: "a graveyard of good intentions",
    buttonText: "github",
    link: "https://github.com/odevine",
  },
  // TODO: actually have projects to list ehre
  // {
  //   transitionArray: ["", "o", "h", "", "", " ", "", "", "", "", "", "n", "o"],
  //   caption: "half-baked but sometimes still cooking",
  //   buttonText: "live projects",
  //   action: () => navigate("/projects"),
  // },
];

export const Home = (): JSX.Element => {
  const [currentButtonIndex, setCurrentButtonIndex] = useState(0);

  return (
    <Container sx={{ height: "100%" }}>
      <Stack
        direction="column"
        alignItems="center"
        justifyContent="center"
        sx={{ height: "100%", minHeight: 750 }}
      >
        <Box
          component="img"
          alt="picture of me"
          src="/test-avatar.jpg"
          sx={{
            height: 240,
            borderRadius: 8,
            border: (theme): string =>
              `2px solid ${theme.palette.secondary.main}`,
          }}
        />
        <Stack direction="row" sx={{ mt: 4, height: 48 }}>
          {buttons[currentButtonIndex].transitionArray.map((col, i) => (
            <Typography variant="h4" color="secondary" key={i}>
              <TextTransition
                inline
                key={i}
                springConfig={{ mass: 5, tension: 2000, friction: 200 }}
              >
                {col}
              </TextTransition>
            </Typography>
          ))}
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
