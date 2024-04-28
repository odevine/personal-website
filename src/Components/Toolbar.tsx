import { navigate } from "raviger";
import { Box, IconButton } from "@mui/material";
import ArrowBack from "@mui/icons-material/ArrowBack";

import { ThemeToggle } from "@/Components";

export const Toolbar = (props: { location: string }) => (
  <Box>
    {props.location !== "/" && (
      <IconButton
        onClick={() => navigate("/")}
        color="secondary"
        sx={{
          zIndex: 100,
          position: "fixed",
          top: 8,
          left: 8,
        }}
      >
        <ArrowBack />
      </IconButton>
    )}
    <Box
      sx={{
        zIndex: 100,
        position: "fixed",
        top: 8,
        right: 8,
      }}
    >
      <ThemeToggle />
    </Box>
  </Box>
);
