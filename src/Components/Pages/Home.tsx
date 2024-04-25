import { Container, Stack, Button, Typography, Link, Box } from "@mui/material";
import { useState } from "react";
import TextTransition from "react-text-transition";

const buttons: Array<{
  transitionArray: string[];
  caption: string;
  buttonText: string;
  link: string;
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
    link: "",
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
    caption: "built in a couple hours to try out vite",
    buttonText: "website",
    link: "",
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
    caption: "where my bad ideas go to die",
    buttonText: "github",
    link: "https://github.com/odevine",
  },
  {
    transitionArray: ["@", "o", "", "", "", "", "d", "e", "", "", "", "", ""],
    caption: "it's like irc but worse?",
    buttonText: "discord",
    link: "https://discord.com/users/98183996185255936",
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
        spacing={2}
        sx={{ height: "100%" }}
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
        <Stack direction="row" sx={{ height: 42 }}>
          {buttons[currentButtonIndex].transitionArray.map((col, i) => (
            <Typography variant="h3" color="secondary">
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
        <Typography variant="h6">
          {buttons[currentButtonIndex].caption}
        </Typography>
        {buttons.map((button, index) => (
          <Link
            href={button.link}
            underline="none"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outlined"
              key={button.buttonText}
              onMouseEnter={(): void => setCurrentButtonIndex(index)}
              sx={{
                width: 120,
                textTransform: "none",
              }}
            >
              {button.buttonText}
            </Button>
          </Link>
        ))}
      </Stack>
    </Container>
  );
};
