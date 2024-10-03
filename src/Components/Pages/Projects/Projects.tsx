import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Stack,
  Button,
} from "@mui/material";
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
    url: "https://edh.devine.dev",
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
    <Stack
      justifyContent="center"
      alignItems="center"
      height={"100%"}
      spacing={3}
    >
      <Typography variant="h4">live projects: {projectCards.length}</Typography>
      <Stack spacing={4} direction="row">
        {projectCards.map((project) => (
          <Card sx={{ width: 400 }} key={project.title}>
            <CardMedia
              sx={{ height: 140 }}
              image={project.imageSrc}
              title={project.title}
            />
            <CardContent sx={{ height: 160 }}>
              <Typography gutterBottom variant="h5" component="div">
                {project.title}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
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
                <Button size="small" onClick={() => navigate(project.path)}>
                  about
                </Button>
              )}
            </CardActions>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
};
