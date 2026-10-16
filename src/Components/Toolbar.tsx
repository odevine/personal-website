import { useNavigate } from "raviger";
import { Box, Button } from "@mui/material";
import ArrowBack from "@mui/icons-material/ArrowBack";

import { ThemeToggle } from "@/Components";

export const Toolbar = (props: { location: string }) => {
  const navigate = useNavigate();

  const goOneLevelUp = () => {
    const currentPath = props.location;

    // Split the path into segments and remove the last segment
    const pathSegments = currentPath.split("/").filter(Boolean); // Remove empty strings from the array
    if (pathSegments.length > 0) {
      pathSegments.pop(); // Remove the last segment
    }

    // Recreate the parent path, or go to root if there's no parent
    const parentPath = "/" + pathSegments.join("/");
    navigate(parentPath || "/");
  };

  return (
    <Box>
      {props.location !== "/" && (
        <Button
          onClick={goOneLevelUp}
          color="secondary"
          startIcon={<ArrowBack />}
          sx={{
            zIndex: 100,
            position: "fixed",
            top: 8,
            left: 8,
          }}
        >
          back
        </Button>
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
};
