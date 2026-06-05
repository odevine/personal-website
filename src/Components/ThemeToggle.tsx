import { MouseEvent, useState } from "react";
import { flushSync } from "react-dom";
import {
  Box,
  ClickAwayListener,
  IconButton,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  Popper,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import PaletteIcon from "@mui/icons-material/Palette";

import { useTheme } from "@/ThemeContext";
import { colorSchemes, getScheme } from "@/themes";

// A small preview of a filter: its paper colour, ringed by the primary accent,
// with a dot of the secondary accent — the same roles used across the app.
const SchemeSwatch = ({ name }: { name: string }) => {
  const { palette } = getScheme(name);
  return (
    <Box
      sx={{
        width: 22,
        height: 22,
        borderRadius: "6px",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: palette.background,
        border: `2px solid ${palette.accent6}`,
      }}
    >
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: palette.accent5,
        }}
      />
    </Box>
  );
};

export const ThemeToggle = () => {
  const { scheme, setScheme } = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const toggleMenu = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl((current) => (current ? null : event.currentTarget));
  };

  const closeMenu = () => setAnchorEl(null);

  const pickScheme = (event: MouseEvent<HTMLElement>, name: string) => {
    if (name === scheme) {
      closeMenu();
      return;
    }

    // Ripple origin: the point that was clicked.
    const x = event.clientX;
    const y = event.clientY;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Close the popover synchronously so it isn't part of the transition
    // snapshot — only the page underneath should ripple.
    flushSync(() => setAnchorEl(null));

    if (!document.startViewTransition || prefersReducedMotion) {
      setScheme(name);
      return;
    }

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    const transition = document.startViewTransition(() => {
      // flushSync forces the new palette into the DOM before the API captures
      // its "new" snapshot.
      flushSync(() => setScheme(name));
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 500,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  };

  return (
    <>
      <IconButton
        onClick={toggleMenu}
        color="secondary"
        aria-label="change color theme"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <PaletteIcon />
      </IconButton>
      <Popper
        open={open}
        anchorEl={anchorEl}
        placement="bottom-end"
        sx={{ zIndex: 1300 }}
      >
        <ClickAwayListener onClickAway={closeMenu}>
          <Paper elevation={6} sx={{ mt: 1 }}>
            <MenuList dense>
              {colorSchemes.map((option) => (
                <MenuItem
                  key={option.name}
                  selected={option.name === scheme}
                  onClick={(event) => pickScheme(event, option.name)}
                  sx={{ gap: 1.5 }}
                >
                  <SchemeSwatch name={option.name} />
                  <ListItemText>{option.label}</ListItemText>
                  {option.name === scheme && (
                    <CheckIcon fontSize="small" color="secondary" />
                  )}
                </MenuItem>
              ))}
            </MenuList>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
};
