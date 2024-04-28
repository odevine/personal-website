import { useRoutes, useLocationChange } from "raviger";
import { useTransition, animated } from "react-spring";
import { useRef } from "react";
import { Box } from "@mui/material";

import { Home, Projects, Toolbar } from "@/Components";

const routes = {
  "/": () => <Home />,
  "/projects": () => <Projects />,
};

export const App = (): JSX.Element => {
  const route = useRoutes(routes);
  const location = window.location.pathname;
  const prevLocationRef = useRef<string>(location);

  useLocationChange((newLocation) => {
    prevLocationRef.current = newLocation.path ?? "";
  });

  const transitions = useTransition(route, {
    keys: location,
    from: {
      transform:
        prevLocationRef.current === "/"
          ? "translate3d(-100%,0,0)"
          : "translate3d(100%,0,0)",
      width: "100%",
      height: "100%",
    },
    enter: { transform: "translate3d(0%,0,0)" },
    leave: {
      transform:
        location === "/" ? "translate3d(100%,0,0)" : "translate3d(-100%,0,0)",
    },
  });

  const AnimatedBox = animated(Box);

  return (
    <>
      <Toolbar location={location}  />
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
