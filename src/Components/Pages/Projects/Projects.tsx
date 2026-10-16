import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { navigate } from "raviger";

import { EDHTrackerAbout } from "@/Components";

interface ProjectCard {
  imageSrc: string;
  title: string;
  description: string;
  tags: string[];
  /** Route of the in-site write-up. Cards without one link out only. */
  path?: string;
  component?: JSX.Element;
  urlButtonText?: string;
  url?: string;
}

export const projectCards: ProjectCard[] = [
  {
    imageSrc: "/images/edh-card-header.png",
    title: "edh tracker",
    description:
      "originally built to replace a spreadsheet, this online tool allows my magic the gathering playgroup to easily keep track of decks, record matches, and get a peek into overall statistics",
    tags: ["react", "typescript", "mui"],
    path: "/projects/edh-tracker",
    urlButtonText: "repo",
    url: "https://github.com/odevine/edh-tracker",
    component: <EDHTrackerAbout />,
  },
  {
    imageSrc: "/images/website-card-header.png",
    title: "personal website",
    description:
      "purely an excuse to start trying out vite instead of bootstrapping with create-react-app",
    tags: ["react", "vite", "react-spring"],
    url: "https://owen.devine.dev",
    urlButtonText: "already here!",
  },
];

export const Projects = () => (
  <Box sx={{ pt: 10, pb: 6, minHeight: "100vh" }}>
    <Container maxWidth="lg">
      <Stack spacing={1} sx={{ mb: 5 }}>
        <Typography
          variant="h3"
          sx={{ fontSize: { xs: "2rem", sm: "2.5rem" } }}
        >
          projects
        </Typography>
        <Typography color="text.secondary">
          live projects: {projectCards.length}
        </Typography>
      </Stack>
      <Grid container spacing={4}>
        {projectCards.map((project) => {
          const { path, url } = project;
          const open = () =>
            path ? navigate(path) : url && window.open(url, "_blank");

          return (
            <Grid key={project.title} size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  transition: "transform 200ms ease, border-color 200ms ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    borderColor: "secondary.main",
                  },
                  "@media (prefers-reduced-motion: reduce)": {
                    transition: "none",
                    "&:hover": { transform: "none" },
                  },
                }}
              >
                <CardActionArea
                  onClick={open}
                  sx={{ flexGrow: 1, alignItems: "stretch" }}
                >
                  <CardMedia
                    component="img"
                    image={project.imageSrc}
                    alt=""
                    sx={{ width: "100%", height: "auto" }}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {project.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {project.description}
                    </Typography>
                    <Stack
                      direction="row"
                      useFlexGap
                      flexWrap="wrap"
                      gap={1}
                      mt={2}
                    >
                      {project.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          variant="outlined"
                          color="primary"
                          sx={{ fontFamily: "inherit" }}
                        />
                      ))}
                    </Stack>
                  </CardContent>
                </CardActionArea>
                <CardActions sx={{ px: 2, pb: 2 }}>
                  {url && (
                    <Button
                      size="small"
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {project.urlButtonText ?? "website"}
                    </Button>
                  )}
                  {path && (
                    <Button size="small" onClick={() => navigate(path)}>
                      about
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  </Box>
);
