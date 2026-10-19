// What the game's colors mean on its own screens, and so what each kind of line is
export type DiveTone =
  "base" | "dim" | "nav" | "loot" | "threat" | "corp" | "corrupt";

export interface DiveStep {
  tone: DiveTone;
  text: string;
  /** Pause before this line appears, in milliseconds */
  wait: number;
  /** The line is typed out a character at a time */
  type?: boolean;
  /** The terminal window shakes as the line appears */
  shudder?: boolean;
}

const tips: Array<[string, string]> = [
  [
    "A clean ship is a happy ship.",
    "Bio-matter accumulation attracts void-fauna. Sanitize frequently.",
  ],
  [
    "Your potential is limitless!",
    "Unlike your oxygen supply. Check gauges often.",
  ],
  [
    "Silence is golden.",
    "Auditory hallucinations are not covered by health insurance. Do not listen to the whispering.",
  ],
  [
    "There is no 'I' in Team.",
    "There is also no 'U' in Escape Pod. It is a single-occupancy vessel.",
  ],
  [
    "Debt is just a number.",
    "A number that determines your eligibility for surface extraction.",
  ],
  [
    "You are unique.",
    "Just like the 41 previous operators. Make this one count!",
  ],
  [
    "Structural groaning is the sound of resilience.",
    "Until it becomes the sound of implosion. Work faster.",
  ],
];

const warnings: Array<[string, string]> = [
  [
    "HULL BREACH DETECTED",
    "Water damage to company property is deducted from your final paycheck. Please seal the breach immediately to avoid penalties.",
  ],
  [
    "OXYGEN LOW",
    "Panic increases respiration rates by 30%. Please remain calm to maximize company resources.",
  ],
  [
    "LIGHTS MALFUNCTION",
    "Darkness is cost-efficient! Use this opportunity to develop your spatial awareness skills.",
  ],
];

const pick = <T>(items: T[]): T =>
  items[Math.floor(Math.random() * items.length)];

const bar = (meters: number) => {
  const filled = Math.round(meters / 40);
  return `[${"#".repeat(filled)}${"-".repeat(10 - filled)}]`;
};

// The dive, from connecting to losing the signal. The tip and the warning change from run to run
export const buildDive = (): DiveStep[] => {
  const [tip, truth] = pick(tips);
  const [warning, advice] = pick(warnings);
  const line = (
    tone: DiveTone,
    text: string,
    wait = 500,
    extra: Partial<DiveStep> = {},
  ): DiveStep => ({ tone, text, wait, ...extra });

  return [
    line("base", "TERMINAL CONNECTED", 800),
    line(
      "base",
      "A.B.Y.S.S. // ADVANCED BENTHIC YIELD & SALVAGE SOLUTIONS",
      500,
    ),
    line("base", "AUTHENTICATING PROVISIONAL ASSOCIATE ........ OK", 700, {
      type: true,
    }),
    line("base", "VESSEL 04 REINSTATED", 600),

    line("corp", "", 300),
    line("corp", "INCOMING MEMO", 400),
    line("corp", "FROM: Asset Optimization & Collections", 250),
    line("corp", "SUBJECT: Deployment Manifest / Account Consolidation", 250),
    line(
      "corp",
      "Post-incident sanitation cycle is complete. You may detect residual moisture on the pilot interface. No further cleaning is authorized.",
      600,
      { type: true },
    ),
    line("loot", "TRF-LEG   Outstanding Balance Transfer ... $14,203.50", 700),
    line("loot", "SAN-L3    Post-Incident Sanitation Levy ...    $125.00", 350),
    line(
      "loot",
      "TOTAL DUE ..................................  $16,000.00",
      450,
    ),
    line(
      "corp",
      "Reminder: idle engine time is billable. Commence descent immediately.",
      700,
    ),

    line("base", "", 300),
    line("base", "COMMENCING DESCENT", 600),
    line("base", `depth   40m  ${bar(40)}`, 700),
    line("base", `depth  120m  ${bar(120)}`, 550),
    line("corp", `A.B.Y.S.S. TIP: "${tip}"`, 650, { type: true }),
    line("dim", `(${truth})`, 500, { type: true }),
    line("base", `depth  210m  ${bar(210)}`, 800),
    line("threat", `HUD WARNING: ${warning}`, 600),
    line("corp", `A.B.Y.S.S. TIP: "${advice}"`, 500, { type: true }),

    line("base", "", 300),
    line("base", "SONAR: ACTIVE PING", 700),
    line("nav", "ping ............ contact, bearing 214, range 380m", 900),
    line("loot", "contact: salvage signature, value unknown", 600),
    line("base", "SONAR: PASSIVE LISTEN", 800),
    line("threat", "contact: moving", 900),
    line("threat", "contact: moving faster than expected", 1000),

    line("base", "", 300),
    line("corrupt", "ARTIFACTING DETECTED", 700, { shudder: true }),
    line(
      "corp",
      "NOTE: ARTIFACTING IS A KNOWN GPU FAULT. NO ACTION IS REQUIRED.",
      600,
    ),
    line("corrupt", "VARIANCE DETECTED. MAP LAYOUT HAS CHANGED.", 800),

    line("base", "", 300),
    line("corp", "MESSAGE FROM PREVIOUS ASSOCIATE", 600),
    line("corp", "FROM: Associate 882 (Deceased)", 250),
    line("corp", "SUBJECT: It's looking at me", 250),
    line(
      "corp",
      "There is something outside the viewport. It has too many eyes. I'm requesting an immediate emergency ascent.",
      700,
      { type: true },
    ),
    line(
      "corp",
      "RE: Management. Ascent denied. Shift is not over. Please refer to Employee Handbook Section 4: 'Overcoming Distractions'.",
      900,
      { type: true },
    ),

    line("base", "", 300),
    line("threat", "PROXIMITY ALERT", 900),
    line("threat", "PROXIMITY ALERT", 350),
    line("base", "no contacts.", 700),
    line("threat", "PROXIMITY ALERT", 250),
    line("corrupt", "SIGNAL LOST", 1000, { shudder: true }),
    line("corp", "Thank you for choosing A.B.Y.S.S.", 800),
    line("base", "SOMETHING STIRS IN THE DEEP", 1300),
  ];
};
