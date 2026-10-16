import { useRoutes } from "raviger";
import { useTransition, animated } from "react-spring";
import { Box } from "@mui/material";

import { Home, Projects, Toolbar, projectCards } from "@/Components";

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const AnimatedBox = animated(Box);

export const App = (): JSX.Element => {
  const location = window.location.pathname;

  const routes: { [key: string]: () => JSX.Element } = {
    "/": () => <Home />,
    "/projects": () => <Projects />,
  };

  projectCards.forEach((project) => {
    if (project.path && project.component) {
      const { component } = project;
      routes[project.path] = () => component;
    }
  });

  const route = useRoutes(routes);

  // Short fade with a small upward shift, keyed on the location so each page
  // cross-fades with the one it replaces
  const transitions = useTransition(route, {
    keys: location,
    from: { opacity: 0, y: 12 },
    enter: { opacity: 1, y: 0 },
    leave: { opacity: 0, y: 0 },
    config: { duration: 180 },
    immediate: prefersReducedMotion(),
  });

  return (
    <>
      <Toolbar location={location} />
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          height: "100vh",
          maxWidth: "100vw",
        }}
      >
        {transitions((style, item) =>
          item ? (
            <AnimatedBox
              style={{
                opacity: style.opacity,
                transform: style.y.to((y) => `translateY(${y}px)`),
              }}
              sx={{
                position: "absolute",
                inset: 0,
                overflowY: "auto",
              }}
              key={location}
            >
              {item}
            </AnimatedBox>
          ) : null,
        )}
      </Box>
    </>
  );
};
