// Regenerates public/og-image.png — the 1200×630 social share card.
//
// Why a script (not a design tool): the card is mostly type, and the tagline
// changes when positioning changes. This renders it deterministically so the
// text is always pixel-exact. We build an SVG and rasterize with rsvg-convert.
//
// Fonts: the live site uses Inter + Instrument Serif (webfonts). rsvg can't see
// those, so we render with the closest premium macOS faces — Helvetica Neue for
// the sans and Baskerville italic for the serif accent. Good enough for a
// thumbnail; the wording is what matters.
//
//   node scripts/build-og.mjs && open public/og-image.png
//
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const logo64 = readFileSync(join(root, "public/logo.png")).toString("base64");

const C = {
  bg: "#0a0a0c",
  cream: "#f5f3ed",
  soft: "#b6b1a3",
  mute: "#6e6a5e",
  gold: "#c4a35a",
  ai: "#5fbfff",
  green: "#6ee787",
  purple: "#c4a8ff",
};
const SANS = "Helvetica Neue, Helvetica, Arial, sans-serif";
const SERIF = "Baskerville, Hoefler Text, Georgia, serif";
const MONO = "Menlo, SF Mono, monospace";

// Four council dots (claude · codex · antigravity · ollama), top-right.
const dots = [C.gold, C.ai, C.green, C.purple]
  .map((c, i) => `<circle cx="${1018 + i * 30}" cy="104" r="7" fill="${c}" />`)
  .join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="glow" cx="78%" cy="14%" r="60%">
      <stop offset="0%" stop-color="${C.gold}" stop-opacity="0.20" />
      <stop offset="45%" stop-color="${C.gold}" stop-opacity="0.05" />
      <stop offset="100%" stop-color="${C.gold}" stop-opacity="0" />
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="${C.bg}" />
  <rect width="1200" height="630" fill="url(#glow)" />

  <!-- top lockup: mark + wordmark -->
  <image x="90" y="68" width="66" height="66" xlink:href="data:image/png;base64,${logo64}" />
  <text x="172" y="120" font-family="${SANS}" font-size="42" font-weight="600" fill="${C.cream}">Prev<tspan fill="${C.ai}">ai</tspan>l</text>
  ${dots}

  <!-- the line -->
  <text x="88" y="330" font-family="${SERIF}" font-style="italic" font-size="96" fill="${C.ai}">AI <tspan fill="${C.gold}">harness</tspan></text>
  <text x="90" y="430" font-family="${SANS}" font-size="86" font-weight="600" fill="${C.cream}">for life&#39;s hard questions.</text>

  <!-- supporting line -->
  <text x="92" y="500" font-family="${SANS}" font-size="30" font-weight="400" fill="${C.soft}">One question to Claude, Codex, Antigravity &amp; Ollama at once — one verdict.</text>

  <!-- footer -->
  <text x="92" y="566" font-family="${MONO}" font-size="25" fill="${C.mute}"><tspan fill="${C.gold}">prevail.sh</tspan>  ·  local-first  ·  free &amp; open source  ·  Mac app + CLI</text>
</svg>`;

const svgPath = join(root, "scripts/.og.svg");
writeFileSync(svgPath, svg);
execFileSync(
  "rsvg-convert",
  ["-w", "1200", "-h", "630", svgPath, "-o", join(root, "public/og-image.png")],
  { stdio: "inherit" },
);
console.log("wrote public/og-image.png (1200×630)");
