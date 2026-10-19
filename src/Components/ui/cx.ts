/** Joins the class names that are set */
export const cx = (...names: Array<string | false | null | undefined>) =>
  names.filter(Boolean).join(" ");

/** A theme color at a given opacity, for colors that are CSS variables */
export const fade = (variable: string, opacity: number) =>
  `color-mix(in srgb, var(${variable}) ${Math.round(opacity * 1000) / 10}%, transparent)`;
