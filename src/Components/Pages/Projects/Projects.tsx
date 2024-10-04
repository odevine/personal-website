import {
  Box,
  Card,
  Container,
  CardContent,
  Typography,
  CardActions,
  Stack,
  Button,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useNavigate } from "raviger";

import { EDHTrackerAbout } from "@/Components";

interface ProjectCard {
  imageSrc: string;
  title: string;
  description: string;
  path: string;
  component: JSX.Element;
  urlButtonText?: string;
  url?: string;
}

export const projectCards: ProjectCard[] = [
  {
    imageSrc: "/images/edh-card-header.png",
    title: "edh tracker",
    description:
      "originally built to replace a spreadsheet, this online tool allows my magic the gathering playgroup to easily keep track of decks, record matches, and get a peek into overall statistics",
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
    path: "",
    url: "https://owen.devine.dev",
    urlButtonText: "already here!",
    component: <EDHTrackerAbout />,
  },
];

export const Projects = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        mt: 8,
        mb: 3,
        height: "calc(100vh - 96px)",
        overflowX: "auto",
        "::-webkit-scrollbar": {
          display: "none",
        },
      }}
    >
      <Stack
        justifyContent="center"
        alignItems="center"
        spacing={3}
        marginX={1}
      >
        <Typography variant="h4">
          live projects: {projectCards.length}
        </Typography>
        {/* Adjust Stack to change direction based on screen size */}
        <Container>
          <Grid
            container
            spacing={4}
            direction={{ xs: "column", sm: "row" }} // column for extra small screens, row for small and above
            alignItems="center"
          >
            {projectCards.map((project) => (
              <Grid key={project.title} size={{ xs: 12 }}>
                <Card sx={{ width: { xs: "100%" } }}>
                  <CardContent sx={{ maxHeight: 200 }}>
                    <Typography gutterBottom variant="h5" component="div">
                      {project.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary" }}
                    >
                      {project.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    {project.url && (
                      <Button
                        size="small"
                        onClick={() => window.open(project.url, "_blank")}
                      >
                        {project.urlButtonText ?? "website"}
                      </Button>
                    )}
                    {project.path !== "" && (
                      <Button
                        size="small"
                        onClick={() => navigate(project.path)}
                      >
                        about
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Stack>
    </Box>
  );
};
