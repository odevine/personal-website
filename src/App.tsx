import { useRoutes, useLocationChange } from "raviger";
import { useTransition, animated } from "react-spring";
import { useRef, useEffect, useState } from "react";
import { Box } from "@mui/material";

import { Home, Projects, Toolbar, projectCards } from "@/Components";

export const App = (): JSX.Element => {
  const location = window.location.pathname;
  const prevLocationRef = useRef<string | null>(null);

  // Local state to track the previous and current location for transition
  const [prevLocation, setPrevLocation] = useState<string | null>(null);

  const routes: { [key: string]: () => JSX.Element } = {
    "/": () => <Home />,
    "/projects": () => <Projects />,
  };

  projectCards.forEach((project) => {
    routes[project.path] = () => project.component;
  });

  const route = useRoutes(routes);

  // Function to check if the transition is going up (fewer segments)
  const isGoingOneLevelHigher = (
    currentLocation: string,
    prevLocation: string | null,
  ) => {
    const currentSegments = currentLocation.split("/").filter(Boolean);
    const prevSegments = prevLocation
      ? prevLocation.split("/").filter(Boolean)
      : [];

    return currentSegments.length <= prevSegments.length;
  };

  const transitions = useTransition(route, {
    keys: location, // Use location as a unique key to identify the current route
    enter: { transform: "translate3d(0%,0,0)" },
    from: {
      width: "100%",
      height: "100%",
    },
    ...(prevLocation !== null && {
      from: {
        transform: isGoingOneLevelHigher(location, prevLocation)
          ? "translate3d(-100%,0,0)" // Coming from the left when going one level up
          : "translate3d(100%,0,0)", // Coming from the right when going one level down
        width: "100%",
        height: "100%",
      },
      // Transition to the center when entering
      leave: {
        transform: isGoingOneLevelHigher(location, prevLocation)
          ? "translate3d(100%,0,0)" // Slide out to the right when going one level higher
          : "translate3d(-100%,0,0)", // Slide out to the left when going one level lower
      },
    }),
  });

  // Use useLocationChange to capture the previous location when it changes
  useLocationChange((newLocation) => {
    setPrevLocation(prevLocationRef.current);
    prevLocationRef.current = newLocation.path ?? "";
  });

  useEffect(() => {
    // Always keep the previous location reference updated after the render
    prevLocationRef.current = location;
  }, [location]);

  const AnimatedBox = animated(Box);

  return (
    <>
      <Toolbar location={location} />
      <Box
        sx={{
          display: "flex",
          position: "relative",
          overflow: "hidden",
          height: "100vh",
          maxWidth: "100vw",
        }}
      >
        {transitions((style, item) =>
          item ? (
            <AnimatedBox
              style={style}
              sx={{
                flexShrink: 0,
                flexGrow: 0,
                flexBasis: "100vw",
                position: "absolute",
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
