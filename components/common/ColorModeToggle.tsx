"use client";

import { IconButton } from "@chakra-ui/react";
import { useTheme } from "next-themes";
import { LuMoon, LuSun } from "react-icons/lu";

/**
 * A toggle button for switching between light and dark color modes.
 *
 * Uses `next-themes` to read and update the current theme.
 * Displays a moon icon in light mode and a sun icon in dark mode.
 *
 * @returns A small icon button that toggles the color mode.
 *
 * @example
 * ```tsx
 * <ColorModeToggle />
 * ```
 */
export function ColorModeToggle() {
  const { theme, setTheme } = useTheme();

  /**
   * Toggles the current theme between "light" and "dark".
   */
  const toggleColorMode = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <IconButton
      size="xs"
      aria-label="toggle color mode"
      onClick={toggleColorMode}
    >
      {theme === "light" ? <LuMoon /> : <LuSun />}
    </IconButton>
  );
}
