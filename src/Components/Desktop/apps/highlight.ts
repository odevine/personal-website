import { SyntaxToken } from "@/themes";

export type Language = "ts" | "md" | "plain";
export type Token = [text: string, token: SyntaxToken];

// Files without an extension are left uncolored
export const languageOf = (filename: string): Language => {
  if (!filename.includes(".")) return "plain";
  return filename.endsWith(".md") ? "md" : "ts";
};

const tsRules: Array<[RegExp, SyntaxToken]> = [
  [/\s+/y, "variable"],
  [/\/\/.*/y, "punctuation"],
  [/"(?:[^"\\]|\\.)*"(?=\s*:)/y, "fn"],
  [/"(?:[^"\\]|\\.)*"?|'(?:[^'\\]|\\.)*'?|`[^`]*`?/y, "string"],
  [
    /\b(?:const|let|var|export|default|import|from|function|return|if|else|true|false|null|undefined|type|interface|as|satisfies)\b/y,
    "keyword",
  ],
  [/\b\d+(?:\.\d+)?\b/y, "number"],
  [/[A-Za-z_$][\w$]*(?=\s*:)/y, "fn"],
  [/[A-Za-z_$][\w$]*/y, "variable"],
  [/[=+\-*/<>!&|?]+/y, "operator"],
  [/./y, "punctuation"],
];

const tokenizeTs = (line: string): Token[] => {
  const tokens: Token[] = [];
  let pos = 0;
  while (pos < line.length) {
    for (const [pattern, token] of tsRules) {
      pattern.lastIndex = pos;
      const match = pattern.exec(line);
      if (match) {
        tokens.push([match[0], token]);
        pos += match[0].length;
        break;
      }
    }
  }
  return tokens;
};

const tokenizeMd = (line: string): Token[] => {
  if (/^#{1,6}\s/.test(line)) return [[line, "keyword"]];
  if (/^\s*[-*]\s/.test(line)) {
    const marker = /^\s*[-*]/.exec(line)![0];
    return [
      [marker, "operator"],
      [line.slice(marker.length), "variable"],
    ];
  }
  return line
    .split(/(`[^`]*`)/)
    .filter(Boolean)
    .map((part): Token => [part, part.startsWith("`") ? "string" : "variable"]);
};

// Splits text into lines of colored tokens
export const highlight = (text: string, language: Language): Token[][] =>
  text.split("\n").map((line): Token[] => {
    if (language === "md") return tokenizeMd(line);
    if (language === "plain") return [[line, "variable"]];
    return tokenizeTs(line);
  });
