// True when the user's setting, or the OS preference before it loads, asks for less motion
export const reducedMotion = (): boolean => {
  const setting = document.documentElement.dataset.reduceMotion;
  return setting
    ? setting === "true"
    : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};
