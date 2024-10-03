import { useNavigate } from "raviger";
import { Box, IconButton } from "@mui/material";
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

  return <Box>
    {props.location !== "/" && <IconButton
        onClick={goOneLevelUp}
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
    }
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
};
