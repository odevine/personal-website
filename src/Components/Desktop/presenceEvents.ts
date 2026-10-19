// The dive command starts the presence, which then stirs now and then for the rest of the visit
export const PRESENCE_START = "presence:start";
// A line for the terminal to print, if one is open
export const PRESENCE_LINE = "presence:line";

export const presenceLines = [
  "something stirs",
  "signal weak",
  "depth: 212m",
  "it is closer",
  "TERMINAL CONNECTED",
];

// A single shake of one window, for the dive to use at its worst moments
export const PRESENCE_SHUDDER = "presence:shudder";
