import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { alpha, Box, IconButton, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import FitScreenIcon from "@mui/icons-material/FitScreen";
import ZoomInIcon from "@mui/icons-material/ZoomIn";

import { formatSize } from "@/format";
import { useViewer } from "../ViewerContext";

export const ViewerApp = () => {
  const { images, index, select } = useViewer();
  const [fit, setFit] = useState(true);
  const [dimensions, setDimensions] = useState<string>("");
  const current = images[index];
  const activeThumb = useRef<HTMLButtonElement>(null);

  const step = (delta: number) =>
    select(Math.min(Math.max(index + delta, 0), images.length - 1));

  useEffect(() => {
    activeThumb.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [index, images]);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight") step(1);
    else if (event.key === "ArrowLeft") step(-1);
    else return;
    event.preventDefault();
  };

  if (!current) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{ height: "100%" }}
      >
        <Typography variant="caption" color="text.secondary">
          no images to show
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack
      tabIndex={0}
      onKeyDown={onKeyDown}
      sx={{ height: "100%", outline: 0 }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.5}
        sx={{
          flexShrink: 0,
          px: 1,
          py: 0.5,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <IconButton
          size="small"
          aria-label="previous image"
          disabled={index === 0}
          onClick={() => step(-1)}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          aria-label="next image"
          disabled={index === images.length - 1}
          onClick={() => step(1)}
        >
          <ArrowForwardIcon fontSize="small" />
        </IconButton>
        <Typography
          variant="caption"
          noWrap
          sx={{ flexGrow: 1, minWidth: 0, px: 1 }}
        >
          {current.name}
          <Box component="span" sx={{ color: "text.secondary" }}>
            {` · ${index + 1} of ${images.length}`}
            {dimensions && ` · ${dimensions}`}
            {current.bytes !== undefined && ` · ${formatSize(current.bytes)}`}
          </Box>
        </Typography>
        <IconButton
          size="small"
          aria-label={fit ? "show actual size" : "fit to window"}
          onClick={() => setFit(!fit)}
        >
          {fit ? (
            <ZoomInIcon fontSize="small" />
          ) : (
            <FitScreenIcon fontSize="small" />
          )}
        </IconButton>
      </Stack>

      <Box
        sx={{
          flexGrow: 1,
          minHeight: 0,
          overflow: "auto",
          display: "flex",
          backgroundColor: "background.default",
        }}
      >
        <Box
          component="img"
          key={current.src}
          src={current.src}
          alt={current.name}
          onLoad={(event) =>
            setDimensions(
              `${event.currentTarget.naturalWidth}×${event.currentTarget.naturalHeight}`,
            )
          }
          sx={
            fit
              ? {
                  m: "auto",
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }
              : { m: "auto", flexShrink: 0 }
          }
        />
      </Box>

      {images.length > 1 && (
        <Stack
          direction="row"
          spacing={0.75}
          sx={{
            flexShrink: 0,
            overflowX: "auto",
            p: 0.75,
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          {images.map((image, i) => (
            <Box
              key={image.src}
              component="button"
              type="button"
              ref={i === index ? activeThumb : undefined}
              aria-label={`show ${image.name}`}
              aria-current={i === index}
              onClick={() => select(i)}
              sx={{
                flexShrink: 0,
                p: 0,
                width: 56,
                height: 40,
                cursor: "pointer",
                overflow: "hidden",
                borderRadius: (theme) => `${theme.shape.borderRadius * 0.5}px`,
                border: (theme) =>
                  `2px solid ${i === index ? theme.palette.primary.main : "transparent"}`,
                backgroundColor: (theme) =>
                  alpha(theme.palette.text.primary, 0.06),
                opacity: i === index ? 1 : 0.65,
                "&:hover": { opacity: 1 },
              }}
            >
              <Box
                component="img"
                src={image.src}
                alt=""
                loading="lazy"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
};
