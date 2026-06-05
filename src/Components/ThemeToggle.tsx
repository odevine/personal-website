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

// A row of the filter's six accent colors as dots. The menu item itself
// carries the theme background, so the whole row previews the palette.
const SchemeSwatch = ({ name }: { name: string }) => {
  const { palette } = getScheme(name);
  const accents = [
    palette.accent1,
    palette.accent2,
    palette.accent3,
    palette.accent4,
    palette.accent5,
    palette.accent6,
  ];

  return (
    <Box
      sx={{
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: 0.75,
      }}
    >
      {accents.map((color, i) => (
        <Box
          key={i}
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: color,
          }}
        />
      ))}
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
          <Paper elevation={6} sx={{ mt: 1, overflow: "hidden" }}>
            <MenuList dense disablePadding>
              {colorSchemes.map((option) => {
                const { palette } = getScheme(option.name);
                // Each row previews its own theme: background + primary text,
                // with a translucent overlay of the text color on hover.
                const hoverOverlay = `inset 0 0 0 999px ${palette.text}14`;
                return (
                  <MenuItem
                    key={option.name}
                    selected={option.name === scheme}
                    onClick={(event) => pickScheme(event, option.name)}
                    sx={{
                      gap: 1.5,
                      color: palette.text,
                      backgroundColor: palette.background,
                      "&.Mui-selected": {
                        backgroundColor: palette.background,
                      },
                      "&:hover, &.Mui-selected:hover": {
                        backgroundColor: palette.background,
                        boxShadow: hoverOverlay,
                      },
                    }}
                  >
                    <SchemeSwatch name={option.name} />
                    <ListItemText>{option.label}</ListItemText>
                    {option.name === scheme && (
                      <CheckIcon
                        fontSize="small"
                        sx={{ color: palette.accent6 }}
                      />
                    )}
                  </MenuItem>
                );
              })}
            </MenuList>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
};
