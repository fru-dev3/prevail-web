import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion, useInView, useReducedMotion, useMotionValue, useSpring, useTransform, MotionConfig } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Calendar,
  Crown,
  Download,
  FileText,
  Gift,
  GraduationCap,
  Heart,
  Home,
  Layers,
  MessageSquare,
  Moon,
  Paperclip,
  Receipt,
  Scale,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Target,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import {
  siApple,
  siClaude,
  siGooglegemini,
} from "simple-icons";
import { APP_VERSION, useLatestVersion, useLiveVersion } from "./version";

const GITHUB_DESKTOP = "https://github.com/fru-dev3/prevail-desktop";
// Download is served from GitHub Releases, NOT this site. GitHub has no
// bandwidth limit for release assets; serving a ~32 MB DMG from Netlify blew
// the free-tier bandwidth quota and took the whole site down. `latest/download`
// + the stable asset name `Prevail-mac-arm64.dmg` (uploaded by the release
// workflow) keeps the URL fixed across versions.
const DMG_URL =
  "https://github.com/fru-dev3/prevail-desktop/releases/latest/download/Prevail-mac-arm64.dmg";
const DMG_NAME = `Prevail-${APP_VERSION}-arm64.dmg`;

// Download link. Once GitHub confirms the latest version, link to the
// version-named asset (CI publishes Prevail_<ver>_aarch64.dmg on every
// release) so the saved file says exactly what it is; until then, the
// stable alias above. (`download=` is ignored cross-origin, so the
// filename must come from the asset itself.)
function useDmgDownload(): { url: string; name: string } {
  const live = useLiveVersion();
  if (live)
    return {
      url: `${GITHUB_DESKTOP}/releases/download/v${live}/Prevail_${live}_aarch64.dmg`,
      name: `Prevail_${live}_aarch64.dmg`,
    };
  return { url: DMG_URL, name: DMG_NAME };
}

// Windows installer (NSIS). Same scheme as the DMG: a stable `latest/download`
// alias (Prevail-windows-x64-setup.exe, uploaded by the release workflow) until
// the live version resolves, then the version-named asset CI publishes.
const EXE_URL =
  "https://github.com/fru-dev3/prevail-desktop/releases/latest/download/Prevail-windows-x64-setup.exe";
const EXE_NAME = `Prevail-${APP_VERSION}-x64-setup.exe`;
function useExeDownload(): { url: string; name: string } {
  const live = useLiveVersion();
  if (live)
    return {
      url: `${GITHUB_DESKTOP}/releases/download/v${live}/Prevail_${live}_x64-setup.exe`,
      name: `Prevail_${live}_x64-setup.exe`,
    };
  return { url: EXE_URL, name: EXE_NAME };
}
// Best-guess visitor OS so the primary CTA offers the right installer first
// (Windows visitors were only ever shown "Download for Mac"). Falls back to Mac.
function useIsWindows(): boolean {
  return useMemo(() => {
    if (typeof navigator === "undefined") return false;
    const s = `${navigator.userAgent} ${navigator.platform}`.toLowerCase();
    return s.includes("win");
  }, []);
}
const EASE = [0.22, 1, 0.36, 1] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Primitives

function FadeIn({
  children,
  delay = 0,
  y = 16,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function Brand({ className = "" }: { className?: string }) {
  return (
    <span className={className}>
      Prev<span className="text-ai">ai</span>l
    </span>
  );
}

// Persistent theme toggle. Dark is always the default — we intentionally do
// NOT honor the OS color-scheme preference, so the brand-tuned dark theme is
// what every first-time visitor sees. Light only applies if the user has
// explicitly toggled it (persisted via localStorage).
type Theme = "dark" | "light";
const LS_THEME = "prevail.site.theme";

function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    const saved = localStorage.getItem(LS_THEME) as Theme | null;
    return saved === "light" ? "light" : "dark";
  });
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(LS_THEME, theme);
  }, [theme]);
  return [theme, () => setTheme((t) => (t === "dark" ? "light" : "dark"))];
}

// Wraps a Simple Icons SVG path into a sized React SVG. Used for brand
// logos (Telegram). Lucide icons handle generic glyphs.
function SimpleIcon({
  icon,
  className = "",
}: {
  icon: { path: string };
  className?: string;
}) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="currentColor"
    >
      <path d={icon.path} />
    </svg>
  );
}

// Microsoft Windows mark — simple-icons no longer ships the Windows logo
// (trademark), so we render the classic four-pane logotype directly.
function WindowsMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
    </svg>
  );
}

// Custom MCP server logo — Model Context Protocol uses a stylized
// 'M' or hexagon-grid mark. The official protocol mark isn't on
// simple-icons yet, so we render a small stylized version that reads
// as "connected nodes" — the spirit of MCP.
// Hermes AI brand mark — winged caduceus. References the Greek
// messenger god Hermes (caduceus = the winged staff with two snakes).
// Stylized + simplified for icon-scale rendering. No canonical public
// SVG exists for any product called "Hermes AI" so this is bespoke.
function HermesBrand({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {/* Central staff */}
      <line x1="12" y1="3" x2="12" y2="22" strokeWidth="2" />
      {/* Ball on top */}
      <circle cx="12" cy="3.2" r="1.2" fill="currentColor" stroke="none" />
      {/* Wings — two angled strokes off each side near the top */}
      <path d="M12 6 Q 7 5.5 4 7.5 Q 7.5 7 9 8.5" />
      <path d="M12 6 Q 17 5.5 20 7.5 Q 16.5 7 15 8.5" />
      {/* Two snakes — single S-curves crossing the staff */}
      <path d="M12 9 C 9 11 15 12 12 14" strokeWidth="1.4" />
      <path d="M12 14 C 9 16 15 17 12 19" strokeWidth="1.4" />
    </svg>
  );
}

// OpenClaw brand mark — Fru's Telegram gateway. Its canonical logo is a
// lobster (openclaw.ai/favicon.svg). This is that mark as a monochrome
// silhouette (currentColor) so it tints consistently with the rest of the
// "works with" strip; the full-color brand-red version is OpenClawBrand below.
function OpenClawMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="currentColor" stroke="currentColor" aria-label="OpenClaw">
      {/* body */}
      <path d="M60 10 C30 10 15 35 15 55 C15 75 30 95 45 100 L45 110 L55 110 L55 100 C55 100 60 102 65 100 L65 110 L75 110 L75 100 C90 95 105 75 105 55 C105 35 90 10 60 10Z" />
      {/* left claw */}
      <path d="M20 45 C5 40 0 50 5 60 C10 70 20 65 25 55 C28 48 25 45 20 45Z" />
      {/* right claw */}
      <path d="M100 45 C115 40 120 50 115 60 C110 70 100 65 95 55 C92 48 95 45 100 45Z" />
      {/* antennae */}
      <path d="M45 15 Q35 5 30 8" fill="none" strokeWidth="3" strokeLinecap="round" />
      <path d="M75 15 Q85 5 90 8" fill="none" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// "Works with" ecosystem strip — Fru's own systems (OpenClaw, Paperclip,
// Hermes) alongside the model CLIs they bridge to.
// Each mark carries its brand color so the strip reads at a glance. The icons
// render in `currentColor`, so the wrapper sets the color per brand. OpenAI's
// mark is monochrome by design, so it stays light on the dark strip.
const WORKS_WITH = [
  { name: "OpenClaw", color: "#ff4d4d", render: (c: string) => <OpenClawMark className={c} /> },
  { name: "Paperclip", color: "#0092b7", render: (c: string) => <Paperclip className={c} /> },
  { name: "Gemini", color: "#4285F4", render: (c: string) => <SimpleIcon icon={siGooglegemini} className={c} /> },
  { name: "Codex", color: "#ededed", render: (c: string) => <OpenAIMark className={c} /> },
  { name: "Claude", color: "#cc785c", render: (c: string) => <SimpleIcon icon={siClaude} className={c} /> },
  { name: "Hermes", color: "#c4a8ff", render: (c: string) => <HermesBrand className={c} /> },
];

// Reusable model-logo row — actual brand logos in their official colors.
// Used to anchor "the best reasoning models" claims visually.
// OpenAI starburst — simple-icons doesn't ship one due to trademark
// constraints, so we render the public-domain hexagonal knot
// approximation used by community marks.
function OpenAIMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.205 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.074zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.142-.08 4.774-2.757a.795.795 0 0 0 .392-.681v-6.737l2.018 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.488 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.78 2.756a.78.78 0 0 0 .785 0l5.843-3.369v2.33a.082.082 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.594 3.855L13.075 8.37l2.02-1.169a.076.076 0 0 1 .071 0l4.83 2.792a4.504 4.504 0 0 1-.681 8.116v-5.678a.79.79 0 0 0-.392-.679zm2.01-3.02l-.141-.085-4.774-2.776a.795.795 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.676 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v3l-2.597 1.5-2.607-1.5z" />
    </svg>
  );
}

// "Star on GitHub" pill — single rounded shape, no internal divider.
// Modeled after the Linear / Vercel / shadcn-ui pattern: cream pill on
// dark, dark pill on light. Star icon → "Star" → live count.
function GitHubStarButton({
  size = "sm",
  className = "",
}: {
  size?: "sm" | "lg";
  className?: string;
}) {
  const [stars, setStars] = useState<number | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch("https://api.github.com/repos/fru-dev3/prevail-desktop")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (cancelled || !j) return;
        if (typeof j.stargazers_count === "number") setStars(j.stargazers_count);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  const isLg = size === "lg";
  return (
    <a
      href={GITHUB_DESKTOP}
      target="_blank"
      rel="noreferrer"
      title="Star on GitHub"
      className={`group inline-flex items-center gap-2 rounded-full bg-text text-bg transition-all hover:opacity-90 hover:-translate-y-0.5 ${
        isLg ? "px-5 py-2.5 text-sm" : "px-3.5 py-1.5 text-xs"
      } ${className}`}
    >
      <Star className={isLg ? "h-4 w-4" : "h-3.5 w-3.5"} />
      <span className="font-semibold">Star</span>
      <span className="font-semibold opacity-70">
        {stars !== null ? formatStars(stars) : "-"}
      </span>
    </a>
  );
}

function formatStars(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toString();
}

// Reusable mock window chrome — used in every product mockup.
// fillParent=true makes the chrome stretch to its container's height so
// the slider mockups (Desktop ↔ CLI) stay the same size regardless of
// which one is active.
function WindowChrome({
  title,
  children,
  fillParent = false,
}: {
  title: string;
  children: ReactNode;
  fillParent?: boolean;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-border bg-surface-0 shadow-2xl ${
        fillParent ? "flex h-full flex-col" : ""
      }`}
    >
      <div className="frost flex shrink-0 items-center gap-2 border-b border-border-soft px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
        <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
        <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
        <span className="ml-3 font-mono text-xs text-text-mute">{title}</span>
      </div>
      <div className={fillParent ? "flex-1 overflow-hidden" : ""}>{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Nav — frosted, minimal

function Nav({ theme, onToggleTheme }: { theme: Theme; onToggleTheme: () => void }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 frost border-b border-border-soft">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <a href="/" className="flex items-center gap-2.5">
          <Logo />
          <span className="text-lg font-semibold tracking-tight">
            <Brand />
          </span>
        </a>
        <div className="hidden items-center gap-6 text-sm text-text-soft md:flex">
          <a href="/#how" className="inline-flex items-center gap-1.5 hover:text-text"><Layers className="h-4 w-4" /> How it works</a>
          <a href="/thesis" className="inline-flex items-center gap-1.5 hover:text-text"><Sparkles className="h-4 w-4" /> Thesis</a>
          <a href="/#install" className="inline-flex items-center gap-1.5 hover:text-text"><Download className="h-4 w-4" /> Install</a>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border-soft text-text-soft hover:bg-surface-1 hover:text-text"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <span className="hidden sm:inline-flex">
            <GitHubStarButton />
          </span>
          <a
            href="#install"
            className="inline-flex items-center gap-1.5 rounded-md bg-gold px-3 py-1.5 text-sm font-medium text-bg transition-all hover:bg-gold-bright hover:-translate-y-0.5 sm:px-4"
            style={{ boxShadow: "0 4px 24px rgba(196, 163, 90, 0.25)" }}
          >
            Download
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </nav>
  );
}

// Official Prevail mark — inline SVG (dark tile + ascending chevrons + a
// guiding star lifted clear of the apex). Vector, so it stays crisp and the
// star can animate on its own.
function Logo({ size = 24, animated = false }: { size?: number; animated?: boolean }) {
  const star = animated ? (
    <motion.circle
      cx="256"
      r="22"
      fill="#3CD8FF"
      animate={{ cy: [106, 90, 106], opacity: [1, 0.75, 1] }}
      transition={{ duration: 1.9, ease: "easeInOut", repeat: Infinity }}
      style={{ filter: "drop-shadow(0 0 6px rgba(60,216,255,0.55))" }}
    />
  ) : (
    <circle cx="256" cy="106" r="22" fill="#3CD8FF" />
  );
  const svg = (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      style={{ width: size, height: size, display: "block" }}
      role="img"
      aria-label="Prevail"
    >
      <rect x="0" y="0" width="512" height="512" rx="116" fill="#141416" />
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M116 312 L256 176 L396 312" stroke="#C4A35A" strokeWidth="56" />
        <path d="M156 392 L256 296 L356 392" stroke="#6E5C32" strokeWidth="34" />
      </g>
      {star}
    </svg>
  );
  if (!animated) return svg;
  const T = 6;
  const float = Math.max(2, size * 0.045);
  return (
    <MotionConfig reducedMotion="never">
      <span
        className="group relative inline-block"
        style={{ perspective: size * 6, width: size, height: size }}
      >
        <motion.span
          className="relative inline-block"
          style={{ transformStyle: "preserve-3d", willChange: "transform, filter" }}
          animate={{
            y: [0, -float, 0],
            rotateX: [7, 2, 7],
            rotateY: [-5, 5, -5],
            filter: [
              "drop-shadow(0 2px 6px rgba(196,163,90,0.35))",
              "drop-shadow(0 8px 18px rgba(60,216,255,0.45))",
              "drop-shadow(0 2px 6px rgba(196,163,90,0.35))",
            ],
          }}
          transition={{ duration: T, ease: "easeInOut", repeat: Infinity }}
          whileHover={{ scale: 1.1 }}
        >
          {svg}
        </motion.span>
      </span>
    </MotionConfig>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HARNESS LINE — the category claim. Every other AI tool is a *coding* harness:
// a wrapper that points a model (Claude, Codex, Antigravity, Ollama) at a
// codebase. Prevail wraps the same models and points them at your *life*. We
// say it the way an editor would — strike the word "coding", write "life" over
// it. The frozen / reduced-motion / SSR state already reads "A c̶o̶d̶i̶n̶g̶ life
// harness." so the wordplay never depends on JS running.
function HarnessLine() {
  const reduce = useReducedMotion();
  // Dim "coding" only after the strike has been drawn. Reduced motion lands on
  // the finished correction immediately.
  const [struck, setStruck] = useState(!!reduce);
  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => setStruck(true), 1000);
    return () => clearTimeout(t);
  }, [reduce]);

  const strikeT = reduce
    ? { duration: 0 }
    : { duration: 0.45, delay: 0.55, ease: EASE };
  const lifeT = reduce
    ? { duration: 0 }
    : { duration: 0.5, delay: 0.95, ease: EASE };

  return (
    <h1 className="text-4xl font-semibold tracking-[-0.02em] md:text-5xl lg:text-6xl xl:text-[68px] xl:leading-[1.05]">
      <span className="font-serif italic">
        <span className="text-ai">AI</span>{" "}
        <span className="text-gold">harness</span>
      </span>
      <br />
      <span className="inline-flex flex-wrap items-baseline gap-x-3">
        <span className="text-text">for</span>
        <span className="relative inline-block text-[0.5em]">
          <span
            className={`transition-colors duration-500 ${
              struck ? "text-text-mute" : "text-text"
            }`}
          >
            coding
          </span>
          <motion.span
            aria-hidden
            className="absolute inset-x-[-2px] top-1/2 h-[0.06em] -translate-y-1/2 rounded-full bg-gold"
            style={{ transformOrigin: "left center" }}
            initial={{ scaleX: reduce ? 1 : 0 }}
            animate={{ scaleX: 1 }}
            transition={strikeT}
          />
        </span>
        <motion.span
          className="font-serif italic text-gold [text-shadow:0_2px_28px_rgba(196,163,90,0.35)]"
          initial={{ opacity: reduce ? 1 : 0, y: reduce ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={lifeT}
        >
          Life
        </motion.span>
      </span>
    </h1>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO

// Deterministic dust-mote field — fixed positions so there's no hydration
// flicker and no Math.random. Spread across the canvas, varied size/opacity.
const DUST = Array.from({ length: 44 }, (_, i) => {
  // cheap hash-ish spread from the index — stable across renders
  const a = (i * 73 + 11) % 100;
  const b = (i * 37 + 7) % 100;
  const c = (i * 53) % 100;
  return {
    left: a,
    top: b,
    size: 1.5 + (c % 4),
    delay: (i % 10) * 0.7,
    dur: 9 + (c % 8),
    drift: 14 + (c % 22),
    opacity: 0.18 + (c % 5) * 0.06,
  };
});

// Ambient hero background — three layers that fill the empty space with life:
//   1. slow-drifting blurred "cloud" orbs (gold + the "AI" blue) that breathe
//   2. a floating dust-mote field
//   3. a gold glow that tracks the cursor
// Layers parallax-shift with the mouse for depth. This is intentionally
// decoration the owner wants ALWAYS on, so it does NOT gate on the OS
// reduced-motion preference (the headline/strike animations still do).
// aria-hidden + pointer-events-none so it never interferes with content.
function HeroAuroras() {
  // Normalized cursor position (-0.5 .. 0.5), spring-smoothed.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  // Raw cursor pixels for the follow-glow.
  const gx = useMotionValue(-1000);
  const gy = useMotionValue(-1000);
  const sx = useSpring(mx, { stiffness: 50, damping: 22, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 50, damping: 22, mass: 0.6 });
  const glowX = useSpring(gx, { stiffness: 120, damping: 26, mass: 0.4 });
  const glowY = useSpring(gy, { stiffness: 120, damping: 26, mass: 0.4 });

  // Parallax offsets per depth (px). Far layers move least.
  const farX = useTransform(sx, (v) => v * -28);
  const farY = useTransform(sy, (v) => v * -28);
  const midX = useTransform(sx, (v) => v * 55);
  const midY = useTransform(sy, (v) => v * 55);
  const nearX = useTransform(sx, (v) => v * 95);
  const nearY = useTransform(sy, (v) => v * 95);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
      gx.set(e.clientX);
      gy.set(e.clientY);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my, gx, gy]);

  // Cool-dominant palette: the "AI" blue + neutral cool-white carry the
  // ambient motion; gold appears only as a single low-key warm accent so the
  // brand colour stays present without taking over.
  const orbs = [
    {
      className: "left-[-10%] top-[2%] h-[46vw] w-[46vw] bg-[radial-gradient(circle,rgba(122,162,247,0.30),transparent_70%)]",
      anim: { x: [0, 60, -20, 0], y: [0, -40, 26, 0], scale: [1, 1.12, 0.94, 1] },
      dur: 20,
    },
    {
      className: "right-[-8%] top-[-6%] h-[40vw] w-[40vw] bg-[radial-gradient(circle,rgba(180,200,255,0.16),transparent_70%)]",
      anim: { x: [0, -48, 20, 0], y: [0, 36, -24, 0], scale: [1, 0.92, 1.1, 1] },
      dur: 24,
    },
    {
      className: "left-[34%] bottom-[-18%] h-[44vw] w-[44vw] bg-[radial-gradient(circle,rgba(196,163,90,0.14),transparent_70%)]",
      anim: { x: [0, 40, -34, 0], y: [0, -28, 20, 0], scale: [1, 1.14, 0.88, 1] },
      dur: 28,
    },
  ];

  return (
    // reducedMotion="never" forces this purely-decorative layer to animate
    // even when the OS has Reduce Motion on (framer-motion v12 otherwise
    // freezes all animations globally when it detects that preference).
    <MotionConfig reducedMotion="never">
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Layer 1 — drifting cloud orbs (far parallax) */}
      <motion.div className="absolute inset-0" style={{ x: farX, y: farY }}>
        {orbs.map((o, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full blur-3xl ${o.className}`}
            animate={o.anim}
            transition={{ duration: o.dur, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }}
          />
        ))}
      </motion.div>

      {/* Layer 2 — floating dust motes (mid parallax) */}
      <motion.div className="absolute inset-0" style={{ x: midX, y: midY }}>
        {DUST.map((d, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${d.left}%`,
              top: `${d.top}%`,
              width: d.size + 1,
              height: d.size + 1,
              opacity: d.opacity * 0.8,
              boxShadow: "0 0 6px rgba(200,212,255,0.45)",
            }}
            animate={{ y: [0, -d.drift, 0], opacity: [d.opacity, Math.min(d.opacity * 2.2, 0.9), d.opacity] }}
            transition={{ duration: d.dur, delay: d.delay, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }}
          />
        ))}
      </motion.div>

      {/* Layer 3 — cursor-following glow. Cool blue-white so the reactive
          motion reads clearly without adding more gold to the page. */}
      <motion.div
        className="absolute h-[55vw] w-[55vw] rounded-full blur-3xl bg-[radial-gradient(circle,rgba(150,178,255,0.34),rgba(150,178,255,0.10)_35%,transparent_65%)]"
        style={{ left: glowX, top: glowY, x: "-50%", y: "-50%" }}
      />

      {/* Layer 4 — near sparkle layer (strongest parallax on mouse move) */}
      <motion.div className="absolute inset-0" style={{ x: nearX, y: nearY }}>
        {DUST.filter((_, i) => i % 3 === 0).map((d, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-ai"
            style={{
              left: `${(d.left + 13) % 100}%`,
              top: `${(d.top + 29) % 100}%`,
              width: d.size,
              height: d.size,
              opacity: d.opacity * 0.9,
              boxShadow: "0 0 6px rgba(122,162,247,0.5)",
            }}
            animate={{ y: [0, d.drift * 0.8, 0] }}
            transition={{ duration: d.dur + 3, delay: d.delay, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }}
          />
        ))}
      </motion.div>
    </div>
    </MotionConfig>
  );
}

function Hero() {
  const dmg = useDmgDownload();
  const exe = useExeDownload();
  const isWindows = useIsWindows();
  const primary = isWindows ? { url: exe.url, name: exe.name, label: "Download for Windows" } : { url: dmg.url, name: dmg.name, label: "Download for Mac" };
  const other = isWindows ? { url: dmg.url, name: dmg.name, label: "Mac" } : { url: exe.url, name: exe.name, label: "Windows" };
  return (
    <section className="relative isolate overflow-hidden pt-24 pb-16 grain lg:flex lg:min-h-screen lg:flex-col lg:justify-center lg:pt-12 lg:pb-28">
      <div className="glow-gold absolute inset-0 -z-10" />
      <HeroAuroras />
      <div className="mx-auto max-w-7xl px-6">
        {/* Centered animated logo crown (à la OpenClaw). The inner translate
            nudges the mark down without reserving extra layout space, so the
            content below doesn't shift. */}
        <FadeIn delay={0.02}>
          <div className="mb-2 flex justify-center md:mb-3">
            <div className="translate-y-1 md:translate-y-2">
              <Logo animated size={84} />
            </div>
          </div>
        </FadeIn>
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-12 xl:gap-16">
          {/* LEFT — text */}
          <div className="min-w-0">
            <FadeIn delay={0.05}>
              <HarnessLine />
            </FadeIn>

            <FadeIn delay={0.12}>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-soft md:text-xl">
                The most important AI you'll ever use won't be the one at work.{" "}
                <span className="text-text">It'll be the one that knows your life, and keeps it yours.</span>
              </p>
            </FadeIn>

            <FadeIn delay={0.18}>
              <div className="mt-8 flex w-full max-w-2xl items-center gap-3">
                <a
                  href={primary.url}
                  download={primary.name}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-gold px-5 py-2.5 text-sm font-medium text-bg transition-all hover:bg-gold-bright hover:-translate-y-0.5"
                  style={{ boxShadow: "0 6px 32px rgba(196, 163, 90, 0.3)" }}
                >
                  {isWindows ? <WindowsMark className="h-4 w-4" /> : <SimpleIcon icon={siApple} className="h-4 w-4" />}
                  {primary.label}
                </a>
                <a
                  href="#council"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-border-strong bg-surface-1 px-5 py-2.5 text-sm font-medium hover:bg-surface-2"
                >
                  <Users className="h-4 w-4" />
                  How it works
                </a>
              </div>
              {/* Both platforms are available: always show a link to the other OS
                  so Windows visitors (and Mac visitors on Windows) see their build. */}
              <p className="mt-3 text-sm text-text-soft">
                Also for{" "}
                <a href={other.url} download={other.name} className="font-medium text-gold underline-offset-2 hover:underline">{other.label}</a>
                {" · "}
                <a href="#install" className="text-text-soft underline-offset-2 hover:text-text hover:underline">all downloads</a>
              </p>
            </FadeIn>

            <div className="mt-8">
              <SocialProof center={false} showMeta={false} />
            </div>

            {/* small trust row */}
            <FadeIn delay={0.24}>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-text-mute">
                <span><span className="text-gold">✓</span> Free, GPL-3.0</span>
                <span><span className="text-gold">✓</span> Local-first</span>
                <span><span className="text-gold">✓</span> Works with Claude, Codex, Antigravity, Ollama</span>
              </div>
            </FadeIn>

            {/* Works-with ecosystem icons */}
            <FadeIn delay={0.28}>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-text-mute">
                <span className="uppercase tracking-[0.18em]">Works with</span>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                  {WORKS_WITH.map((w) => (
                    <div
                      key={w.name}
                      title={w.name}
                      className="group flex items-center gap-1.5 text-text-soft transition-colors hover:text-text"
                    >
                      <span style={{ color: w.color }} className="inline-flex">
                        {w.render("h-5 w-5")}
                      </span>
                      <span className="text-[11px]">{w.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>

          {/* RIGHT — slider */}
          <FadeIn delay={0.28} y={20} className="min-w-0">
            <HeroSlider />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// Hero product shot — the native desktop app.
function HeroSlider() {
  return (
    <div>
      <div className="relative h-[410px] sm:h-[440px] md:h-[460px]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="absolute inset-0"
        >
          <DesktopAppMock />
        </motion.div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Polished CSS/SVG mockup of the desktop app — appears in hero. Looks like
// a real screenshot but stays sharp at any density.

function DesktopAppMock() {
  return (
    <WindowChrome title="Prevail" fillParent>
      <div className="grid h-full grid-cols-[180px_1fr] bg-surface-0">
        {/* sidebar */}
        <div className="border-r border-border-soft bg-surface-0 p-3">
          <div className="mb-3 px-2 font-mono text-[9px] uppercase tracking-[0.18em] text-text-mute">
            <span className="text-gold">◆</span> Domains · 20
          </div>
          <ul className="space-y-0.5 font-mono text-[11px]">
            {[
              ["chief", true],
              ["vision", false],
              ["wealth", false],
              ["health", false],
              ["tax", false],
              ["career", false],
              ["business", false],
              ["estate", false],
              ["insurance", false],
            ].map(([d, active]) => (
              <li
                key={d as string}
                className={`flex items-center justify-between rounded px-2 py-1 ${
                  active
                    ? "bg-gold-soft text-gold"
                    : "text-text-soft"
                }`}
              >
                <span>
                  <span className="mr-2 text-text-mute">
                    {active ? "▸" : "·"}
                  </span>
                  {d}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-border-soft pt-3 font-mono text-[9px]">
            <div className="mb-1.5 uppercase tracking-[0.18em] text-text-mute">
              CLIs
            </div>
            <div className="flex flex-wrap gap-x-2 gap-y-1 text-[10px]">
              <span className="text-ok">✓ claude</span>
              <span className="text-ok">✓ codex</span>
              <span className="text-ok">✓ agy</span>
              <span className="text-text-mute">· ollama</span>
            </div>
          </div>
        </div>

        {/* main pane — COUNCIL TAB active, fan-out + verdict */}
        <div className="flex min-h-0 flex-col bg-bg">
          {/* tab bar — Council is active */}
          <div className="flex shrink-0 items-center gap-1 border-b border-border-soft px-4">
            <button className="flex items-center gap-2 px-3 py-2.5 text-xs text-text-mute">
              <MessageSquare className="h-3 w-3" /> Chat
            </button>
            <button className="relative -mb-px flex items-center gap-2 px-3 py-2.5 text-xs text-gold">
              <Scale className="h-3 w-3" /> Council
              <span className="absolute bottom-0 left-0 right-0 h-px bg-gold" />
            </button>
            <button className="flex items-center gap-2 px-3 py-2.5 text-xs text-text-mute">
              <Sparkles className="h-3 w-3" /> Benchmark
            </button>
          </div>

          {/* council body */}
          <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-hidden px-4 py-3 text-[11px]">
            {/* Question echo */}
            <div className="shrink-0 rounded-md border border-border bg-surface-1 px-3 py-2 font-mono text-[10px] text-text-soft">
              <span className="text-gold">$</span> Should I prepay the mortgage
              or invest the delta?
            </div>

            {/* 4 panelist replies in a 2x2 grid */}
            <div className="grid shrink-0 grid-cols-2 gap-2">
              {[
                { name: "claude", color: "#c4a35a", text: "Invest. 22-yr horizon dominates.", done: true },
                { name: "codex", color: "#5fbfff", text: "Invest. Tax wrapper > prepay.", done: true },
                { name: "agy", color: "#6ee787", text: "Split. 60/40 toward investing.", done: true },
                { name: "ollama", color: "#c4a8ff", text: "Prepay. Guaranteed 6.2%.", done: false },
              ].map((p) => (
                <div
                  key={p.name}
                  className="overflow-hidden rounded-md border border-border bg-surface-1"
                >
                  <div className="flex items-center justify-between border-b border-border-soft bg-surface-2 px-2.5 py-1 font-mono text-[9px]">
                    <span style={{ color: p.color }}>◇ {p.name}</span>
                    {p.done ? (
                      <span className="text-ok">✓</span>
                    ) : (
                      <span className="pulse-soft text-gold">stream</span>
                    )}
                  </div>
                  <div className="px-2.5 py-1.5 text-[10px] text-text-soft">
                    {p.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Disagreement panel */}
            <div className="shrink-0 rounded-md border-l-2 border-gold bg-surface-1 px-3 py-1.5">
              <div className="font-mono text-[9px] uppercase tracking-wider text-gold">
                ▸ Where panelists disagreed
              </div>
              <div className="mt-0.5 text-[10px] text-text-soft">
                3/4 favor investment; Ollama anchors on guaranteed return.
              </div>
            </div>

            {/* Verdict block */}
            <div className="shrink-0 rounded-md border border-gold-border bg-gold-soft p-3">
              <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-gold">
                <span>◆</span>
                <span>Verdict · synthesized by claude</span>
              </div>
              <div className="mt-1 text-[11px] leading-relaxed text-text">
                Invest 60% in tax-advantaged index funds. Prepay 40% quarterly.
                Revisit annually.
                <span className="blink text-gold">▌</span>
              </div>
            </div>
          </div>

          {/* composer */}
          <div className="shrink-0 border-t border-border-soft p-3">
            <div className="flex items-center gap-2 rounded-md border border-border bg-surface-0 p-2 text-[11px] text-text-mute">
              <Scale className="h-3 w-3 text-gold" />
              <span>ask the council · cmd+enter to convene</span>
              <div className="ml-auto flex items-center gap-1.5 rounded bg-gold px-2 py-0.5 text-bg">
                <span>convene</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </WindowChrome>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HARD QUESTIONS — the "why this matters" section
// One agent isn't enough. Generic benchmarks don't grade your life.

const HARD_QUESTIONS = [
  { domain: "Wealth", Icon: TrendingUp, color: "#c4a35a", q: "Prepay the mortgage, or invest the delta?" },
  { domain: "Career", Icon: Briefcase, color: "#5fbfff", q: "Take the Series B offer, or stay where I am?" },
  { domain: "Health", Icon: Heart, color: "#6ee787", q: "Lab panel just landed: what do I act on first?" },
  { domain: "Tax", Icon: Receipt, color: "#f0c674", q: "Roth conversion this year: does the IRMAA cliff bite?" },
  { domain: "Family", Icon: Users, color: "#ffb38a", q: "Sister's wedding back home: contribute $40k?" },
  { domain: "Estate", Icon: ShieldCheck, color: "#c4a8ff", q: "Term life or whole life, for my situation?" },
];

function HardQuestionsSection() {
  return (
    <section className="relative border-t border-border-soft py-24 md:py-32 grain">
      <div className="glow-ai absolute inset-0 -z-10 opacity-30" />
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-ai">
              Why one model isn't enough
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.02em] md:text-5xl">
              Your life doesn't fit{" "}
              <span className="font-serif italic text-text-soft">a benchmark.</span>
            </h2>
            <p className="mt-5 text-lg text-text-soft">
              The benchmarks that rank models never grade the questions you
              actually wrestle with. These are the ones <Brand /> is for.
            </p>
          </div>
        </FadeIn>

        <div className="mx-auto mt-14 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HARD_QUESTIONS.map((q, i) => {
            const Icon = q.Icon;
            return (
              <FadeIn key={q.q} delay={0.05 * i}>
                <div className="group flex h-full flex-col gap-3 rounded-2xl border border-border-soft bg-surface-0 p-6 transition-all hover:-translate-y-0.5 hover:border-border hover:bg-surface-1">
                  <div className="flex items-center justify-between">
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${q.color}18`, color: q.color }}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-mute">
                      {q.domain}
                    </span>
                  </div>
                  <div className="text-lg font-medium leading-snug text-text">{q.q}</div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COUNCIL PITCH — model logos + "around one table" + Convene CTA + GitHub
// star button. Lives right under the hero, above the install section.

// ─────────────────────────────────────────────────────────────────────────────
// LOGO BAR — gentle social proof / "what you use it with"

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE SECTION — reusable, alternating layout

// ─────────────────────────────────────────────────────────────────────────────
// COUNCIL MOCK — fan-out + verdict, 4 panelist replies streaming

// ─────────────────────────────────────────────────────────────────────────────
// BENCHMARK MOCK — leaderboard

// Per-domain leaderboards. The point: the best model for one part of your life
// isn't the best for another — the winner (row 0) deliberately changes by
// domain. Rows are [judge score, keyword %, model].
// Heat color for a 0-10 judge score: emerald green for strong, muted slate for
// weak. Green reads as "good" at a glance and keeps the board off the gold the
// rest of the site uses.
// The live Prevail Benchmark: model x domain matrix + leaderboard, loaded from
// the committed results JSON (refreshed by the weekly CI). Synthetic data.
// ─────────────────────────────────────────────────────────────────────────────
// VAULT MOCK — folder tree

// ─────────────────────────────────────────────────────────────────────────────
// PILLARS — three small cards

function Pillars() {
  return (
    <section id="how" className="scroll-mt-20 border-t border-border-soft py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn>
          <p className="text-center text-xs uppercase tracking-[0.2em] text-gold">
            How <Brand /> works
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl text-center text-4xl font-semibold tracking-[-0.02em] md:text-5xl">
            Three ideas. <span className="font-serif italic text-text-soft">That's the whole app.</span>
          </h2>
        </FadeIn>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Scale,
              title: "A council, not a chatbot",
              text: "Ask every model at once. A chair reads all the answers and writes one verdict, and flags where they disagree.",
              color: "#c4a35a",
              visual: (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex -space-x-2">
                    {["#cc785c", "#4285F4", "#6ee787", "#ededed"].map((c) => (
                      <span key={c} className="h-7 w-7 rounded-full ring-2 ring-surface-0" style={{ background: c }} aria-hidden />
                    ))}
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-text-mute" />
                  <span className="rounded-md border border-gold-border bg-gold/10 px-2.5 py-1 text-xs font-medium text-gold">one verdict</span>
                </div>
              ),
            },
            {
              icon: Layers,
              title: "Just folders you own",
              text: "Your life in plain markdown, one folder per domain. No database, no cloud. Read it without the app.",
              color: "#6ee787",
              visual: (
                <div className="rounded-lg border border-border-soft bg-bg/60 p-3 font-mono text-[11px] leading-relaxed">
                  <div className="text-text-mute">~/prevail-vault/</div>
                  {["wealth", "health", "career"].map((d) => (
                    <div key={d} className="pl-3 text-text-soft">
                      <span className="text-[#6ee787]">{d}/</span> state.md
                    </div>
                  ))}
                </div>
              ),
            },
            {
              icon: Sparkles,
              title: "It compounds",
              text: "Every chat and decision feeds the next answer. It gets sharper the longer you use it, and never starts from zero.",
              color: "#5fbfff",
              visual: (
                <div>
                  <div className="flex h-16 items-end gap-1.5">
                    {[18, 30, 40, 55, 72, 92].map((h, j) => (
                      <span key={j} className="flex-1 rounded-sm bg-gradient-to-t from-[#5fbfff]/25 to-[#5fbfff]" style={{ height: `${h}%` }} aria-hidden />
                    ))}
                  </div>
                  <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-text-mute">sharper over time</div>
                </div>
              ),
            },
          ].map((p, i) => {
            const Icon = p.icon;
            return (
              <FadeIn key={p.title} delay={i * 0.06}>
                <div className="group flex h-full flex-col rounded-xl border border-border-soft bg-surface-0 p-7 transition-all hover:border-border hover:bg-surface-1">
                  <div
                    className="inline-flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${p.color}15`, color: p.color }}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-soft">{p.text}</p>
                  <div className="mt-6 pt-1">{p.visual}</div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FRAMEWORKS — how Prevail SHAPES the answer (BLUF, WIN, SCQA, ...)

// Each framework gets a STRUCTURALLY distinct rendering — the visual
// shape should reveal the framework. Banner labels, dividers, grids,
// loops — not just colored prefix letters on similar paragraphs.

// ─────────────────────────────────────────────────────────────────────────────
// LENSES — different angles of attack. With lens=ALL, every panelist runs
// every lens, then the chair synthesizes across all of them.

// What each lens does to the same mortgage question — used by the
// interactive demo. Each rendering should LOOK like the lens worked on
// it (terminal-styled snippet inside the mock window).
// ─────────────────────────────────────────────────────────────────────────────
// SELF-LEARNING / ECOSYSTEM — combined section
//
// Self-learning: every council verdict logs to the vault. Over time, your
// vault BECOMES the benchmark — new models get graded against you.
// Ecosystem: MCP server, Telegram bridge, OpenClaw, Paperclip, Hermes,
// Multica all share the ~/.ai/ knowledge layer.

// OpenClaw brand mark — real lobster mark pulled verbatim from
// https://openclaw.ai/favicon.svg. Body + two claws + antennae + eyes
// with teal pupils. Recolored via currentColor on the wrapping span,
// but the gradient defs are inlined so the brand red shows through
// even on a tinted wrapper.
// Real Multica logo — pulled verbatim from https://multica.ai/favicon.svg.
// 8-spoke star/cross polygon; we recolor to currentColor so it picks up the
// brand tint we set on the wrapper.
// Real Paperclip AI logo mark — extracted from paperclip-logo.svg. The
// original is wordmark+mark; we keep only the mark on the left (a stylized
// paper corner with arrow). Colors use currentColor so it tints to brand.
// Ecosystem section — icons only, no titles, no descriptions.
// Just a clean strip of brand marks showing 'plays with these tools'.
// ─────────────────────────────────────────────────────────────────────────────
// DOWNLOAD / INSTALL section — native Mac app

function DownloadSection() {
  const version = useLatestVersion();
  const dmg = useDmgDownload();
  const exe = useExeDownload();
  return (
    <section id="install" className="border-t border-border-soft py-24 md:py-32 grain">
      <div className="glow-gold absolute inset-0 -z-10 opacity-50" />
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn>
          <p className="text-center text-xs uppercase tracking-[0.2em] text-gold">
            Ask a council. Prevail.
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl text-center text-4xl font-semibold tracking-[-0.02em] md:text-5xl">
            Get it <span className="font-serif italic text-text-soft">in a click.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-center text-lg text-text-soft">
            Native desktop app for Mac and Windows: self-contained, no terminal,
            no setup. Download and open.
          </p>
        </FadeIn>

        <div className="mx-auto mt-16 grid max-w-4xl gap-6 md:grid-cols-2">
          {/* Desktop card — macOS */}
          <FadeIn delay={0.05}>
            <div
              id="desktop"
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gold-border bg-gradient-to-br from-surface-1 to-surface-0 p-8"
            >
              <div className="shimmer absolute inset-x-0 top-0 h-px" />
              <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-gold">
                <SimpleIcon icon={siApple} className="h-4 w-4" />
                Desktop · macOS arm64
              </div>
              <h3 className="mt-5 text-3xl font-bold tracking-tight">
                Prevail.app
              </h3>
              <p className="mt-3 mb-8 text-text-soft">
                Native Mac app. v{version}. Self-contained, no terminal required.
                Signed &amp; notarized by Apple: opens like any Mac app.
              </p>

              <a
                href={dmg.url}
                download={dmg.name}
                className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-md bg-gold py-3 font-medium text-bg transition-all hover:bg-gold-bright hover:-translate-y-0.5"
                style={{ boxShadow: "0 6px 32px rgba(196, 163, 90, 0.3)" }}
              >
                Download .dmg
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>

              <div className="mt-6 flex items-center justify-between text-xs text-text-mute">
                <span>Apple Silicon · macOS 13+</span>
                <a
                  href={`${GITHUB_DESKTOP}/releases`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-gold"
                >
                  All releases →
                </a>
              </div>
            </div>
          </FadeIn>

          {/* Desktop card — Windows */}
          <FadeIn delay={0.1}>
            <div className="group relative h-full overflow-hidden rounded-2xl border border-gold-border bg-gradient-to-br from-surface-1 to-surface-0 p-8">
              <div className="shimmer absolute inset-x-0 top-0 h-px" />
              <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-gold">
                <WindowsMark className="h-4 w-4" />
                Desktop · Windows x64
              </div>
              <h3 className="mt-5 text-3xl font-bold tracking-tight">
                Prevail for Windows
              </h3>
              <p className="mt-3 mb-8 text-text-soft">
                Same app, same vault. v{version}. NSIS installer, no terminal
                required. Unsigned for now; SmartScreen may warn at first.
              </p>

              <a
                href={exe.url}
                download={exe.name}
                className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-md bg-gold py-3 font-medium text-bg transition-all hover:bg-gold-bright hover:-translate-y-0.5"
                style={{ boxShadow: "0 6px 32px rgba(196, 163, 90, 0.3)" }}
              >
                Download installer
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>

              <div className="mt-6 flex items-center justify-between text-xs text-text-mute">
                <span>Windows 10/11 · x64</span>
                <a
                  href={`${GITHUB_DESKTOP}/releases`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-gold"
                >
                  All releases →
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FAQ

const FAQ = [
  {
    q: "What's a council?",
    a: "Every available CLI is asked the same question at once. A chair model reads all the answers and writes a single verdict: plus a panel that surfaces where the panelists disagreed.",
  },
  {
    q: "Does my data leave my Mac?",
    a: "Your vault always stays on your Mac, in plain files you own. Whether anything leaves is your call: Bunker Mode keeps everything on-device with local models; Cloud Mode sends your prompts to the frontier models you pick. You choose, per question.",
  },
  {
    q: "Bunker Mode or Cloud Mode?",
    a: "Bunker Mode runs entirely on local models (via Ollama): nothing leaves your machine. Cloud Mode brings in the frontier, Claude, GPT, Gemini, when you want their horsepower. Same vault, same council, you decide how private versus how powerful.",
  },
  {
    q: "Which models can sit on the council?",
    a: "Claude, Codex, Gemini, and local Ollama models, auto-detected at startup. You pick who's on the council for any given question, and a chair model you choose writes the verdict.",
  },
  {
    q: "Do I have to use the desktop app?",
    a: "No. The CLI works on macOS, Linux, and WSL. Same features, same vault, same benchmark.",
  },
  {
    q: "Is it open source?",
    a: "Yes. GPL-3.0. Read every line on GitHub.",
  },
];

function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="border-t border-border-soft py-24 md:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <FadeIn>
          <p className="text-center text-xs uppercase tracking-[0.2em] text-gold">FAQ</p>
          <h2 className="mt-4 text-center text-4xl font-semibold tracking-[-0.02em] md:text-5xl">
<span className="font-serif italic text-text-soft">Quick</span> answers.
          </h2>
        </FadeIn>
        <div className="mt-12 space-y-2">
          {FAQ.map((item, i) => {
            const isOpen = open === i;
            return (
              <FadeIn key={item.q} delay={i * 0.04}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full rounded-lg border border-border-soft bg-surface-0 px-6 py-5 text-left transition-colors hover:bg-surface-1"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium">{item.q}</span>
                    <span
                      className={`text-gold transition-transform ${
                        isOpen ? "rotate-45" : ""
                      }`}
                    >
                      +
                    </span>
                  </div>
                  {isOpen && (
                    <p className="mt-4 border-t border-border-soft pt-4 text-text-soft">
                      {item.a}
                    </p>
                  )}
                </button>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Footer

function Footer() {
  const dmg = useDmgDownload();
  const [showLegal, setShowLegal] = useState(false);
  return (
    <footer className="border-t border-border-soft bg-surface-0">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <Logo size={20} />
              <Brand className="text-lg font-semibold" />
            </div>
            <p className="mt-4 max-w-xs text-sm text-text-soft">
              A native Mac app for AI council deliberation.
              Local. Open source. GPL-3.0.
            </p>
          </div>
          {[
            {
              title: "Product",
              links: [
                ["Download (DMG)", dmg.url],
                ["All releases", `${GITHUB_DESKTOP}/releases`],
                ["Source", GITHUB_DESKTOP],
              ],
            },
            {
              title: "Source",
              links: [
                ["Prevail desktop", GITHUB_DESKTOP],
                ["Demo vault", `${GITHUB_DESKTOP}/tree/main/src-tauri/resources/sample-vault`],
              ],
            },
            {
              title: "Legal",
              links: [
                ["GPL-3.0 License", `${GITHUB_DESKTOP}/blob/main/LICENSE`],
                ["Security", `${GITHUB_DESKTOP}/blob/main/SECURITY.md`],
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <div className="text-xs font-medium uppercase tracking-wider text-text-mute">
                {col.title}
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-text-soft hover:text-text"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 border-t border-border-soft pt-12">
          <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-text-mute">
            Part of a family of private, local-first tools
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                name: "Memosa",
                tagline: "Private meeting memory for Mac",
                href: "https://memosa.dev/",
                tile: <span className="font-serif text-xl font-semibold text-[#5fd0a8]">M</span>,
                tileClass: "bg-[#0c0c0e]",
              },
              {
                name: "Prevail",
                tagline: "A private AI that learns you, local-first",
                href: null,
                tile: <Logo size={22} />,
                tileClass: "bg-[#0c0c0e]",
              },
              {
                name: "AI Ready U",
                tagline: "Score and grow your AI readiness",
                href: "https://aireadyu.dev/",
                tile: <span className="text-xl font-bold text-white">U</span>,
                tileClass: "bg-[#2f9e6f]",
              },
            ].map((f) => {
              const inner = (
                <div
                  className={`flex h-full items-center gap-4 rounded-2xl border p-5 transition-colors ${
                    f.href ? "border-border-soft hover:border-border hover:bg-surface-1" : "border-gold-border/60 bg-surface-1"
                  }`}
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${f.tileClass}`}>
                    {f.tile}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 font-semibold">
                      {f.name}
                      {f.href ? (
                        <ArrowRight className="h-3.5 w-3.5 text-text-mute" />
                      ) : (
                        <span className="font-mono text-[9px] uppercase tracking-wider text-gold">you're here</span>
                      )}
                    </div>
                    <div className="mt-0.5 text-sm text-text-soft">{f.tagline}</div>
                  </div>
                </div>
              );
              return f.href ? (
                <a key={f.name} href={f.href} target="_blank" rel="noreferrer">{inner}</a>
              ) : (
                <div key={f.name}>{inner}</div>
              );
            })}
          </div>
        </div>
        <div className="mt-14 border-t border-border-soft pt-12 text-center">
          <p className="font-serif text-2xl italic text-text-soft md:text-3xl">
            Ask a council. <span className="not-italic text-gold">Prevail.</span>
          </p>
        </div>
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowLegal(true)}
            className="text-xs text-text-mute underline-offset-2 hover:text-text-soft hover:underline"
          >
            Disclaimer, privacy &amp; legal
          </button>
        </div>
        <div className="mt-6 flex flex-col items-start justify-between gap-3 text-xs text-text-mute md:flex-row md:items-center">
          <span>© 2026 Prevail.sh · built local, shipped open · alpha</span>
          <span>Built with Tauri · React · Tailwind · Rust</span>
        </div>
      </div>

      {showLegal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowLegal(false)} />
          <div className="relative max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface-0 p-7 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Disclaimer, privacy &amp; legal</h3>
              <button
                onClick={() => setShowLegal(false)}
                aria-label="Close"
                className="rounded-md p-1 text-text-mute hover:bg-surface-1 hover:text-text"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-text-soft">
              Prevail is an early, experimental alpha released for demonstration and testing. It is provided "as is",
              without warranty of any kind, and you use it at your own risk. It runs third-party AI tools and, unless
              Bunker Mode is on, may send data to cloud providers, so always review anything important yourself.
              Feedback and bug reports are very welcome and directly shape what comes next.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-text-soft">
              Prevail is free, open-source software released under the GNU General Public License v3.0. Your vault
              lives on your Mac in plain files you own. In Bunker Mode nothing leaves your machine; in Cloud Mode
              your prompts go to the model providers you choose. The app collects no telemetry unless you opt in.
              This marketing site uses Google Analytics. Ratings and the user count shown elsewhere on this site
              are illustrative.
            </p>
          </div>
        </div>
      )}
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DESKTOP SHOWCASE — real product shots of Prevail Desktop

// ─────────────────────────────────────────────────────────────────────────────
// USE CASES — the questions people point the council at

// Brand color per engine — shared by the header dots and the panel rows so a
// model is always the same hue wherever it appears.
// Each card shows the panel disagreeing (`panel`), the crux of the split
// (`split`), then the chair's synthesized call (`verdict`). `lean` is the
// one-word stance used to tint each row so agreement/dissent reads at a glance.
// ─────────────────────────────────────────────────────────────────────────────
// Root

// Demo video — a compact, self-hosted MP4 (1.3 MB, poster + preload=metadata
// so it only fully downloads on play). Hosting the binary DMG here is what blew
// the bandwidth budget; a tiny lazy video is fine.
function DemoVideo() {
  return (
    <section id="demo" className="border-t border-border-soft py-20 md:py-28 grain">
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn>
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">
              See it in action
            </p>
            <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.02em] md:text-5xl">
              The whole thing,{" "}
              <span className="font-serif italic text-text-soft">in two minutes.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-text-soft">
              A real walkthrough: convene a council, watch it self-learn, and see
              your life become markdown you own.
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={0.15}>
          <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-surface-0 shadow-2xl">
            <video
              src="/prevail-demo.mp4"
              poster="/prevail-demo-poster.jpg"
              controls
              playsInline
              preload="metadata"
              className="block aspect-video w-full"
            />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPARISON section — sits directly under the demo video. Shows the full
// ~/.ai crew (Prevail + its companion agents/channels) next to the external
// all-in-one alternative (Odysseus), so a visitor sees at a glance WHAT each
// does and WHERE Prevail fits. Prevail is the highlighted "you're here" column.
//
// NOTE: Hermes + Multica copy below is intentionally generic ("AI agent in the
// ~/.ai layer") — drop in their real one-liners when ready.

// Minimal Odysseus mark — no official logo, so a clean monochrome sail-on-wave
// glyph (currentColor) for the "external alternative" card. Geometric only.
// Each product is a COLUMN. `blurb` is the short 1–2 sentence description that
// sits under the logo in the header. `hero` lights Prevail's column gold.
// Cell value: true = full, "part" = partial/indirect, false = absent.
// #RRGGBB → rgba(), for the per-brand color bands and glows applied inline.
// ─────────────────────────────────────────────────────────────────────────────
// THESIS PAGE — why Prevail exists. A quiet manifesto, one belief per block.

// Aspirational social-proof figures. NOT real yet — surfaced with an explicit
// "illustrative" label (here and in the footer disclaimer). Edit to the real
// numbers once they exist; the live GitHub-star count beside them is always true.
const ILLUSTRATIVE = { users: "5,000+", rating: "4.9" };

const THESES = [
  {
    title: "AI for your life will matter more than AI for your work.",
    body: "Everyone is racing to build AI for code, email, and the office. The bigger prize is the AI that helps with the decisions that actually shape a life: money, health, family, career. The hard calls you only get to make once.",
  },
  {
    title: "Context compounds.",
    body: "An AI that knows your whole life gets more useful the longer you use it. Most assistants start from zero every session. Prevail keeps a durable record of who you are and what you've decided, and feeds it forward, so every answer is sharper than the last.",
  },
  {
    title: "Everyone deserves a council of advisors.",
    body: "The wealthy keep lawyers, accountants, doctors, and wealth managers on call. AI can give everyone that same caliber of counsel, in private, for the cost of the electricity. A panel of the best models, not a single guess.",
  },
  {
    title: "Your context is the most valuable thing you own, so it should never leave your machine.",
    body: "The industry default is \"send us everything.\" We think that's backwards: the intelligence should come to your data, not your data to the intelligence. Local-first isn't a feature, it's the moral position. Your vault stays on your Mac, in plain files you can read and delete.",
  },
  {
    title: "Your life deserves the same rigor as your code.",
    body: "We version, test, and peer-review our software. Our biggest personal decisions get a gut feeling at 11pm. That asymmetry is absurd. Prevail brings structure, a second opinion, and a durable record to the choices that matter most.",
  },
];

function SocialProof({ center = true, showMeta = true }: { center?: boolean; showMeta?: boolean }) {
  // Illustrative avatars: generated illustrated portraits (DiceBear), not stock
  // photos of real people who aren't users. Honest placeholder, and the count /
  // ratings beside them are explicitly labelled illustrative below.
  const avatars = ["Aria", "Marcus", "Sofia", "Devin", "Priya"].map(
    (seed) => `https://api.dicebear.com/9.x/micah/svg?seed=${seed}&radius=50&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
  );
  return (
    <FadeIn>
      <div className={`flex max-w-xl flex-col gap-3 ${center ? "mx-auto items-center" : "items-start"}`}>
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2.5">
            {avatars.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                loading="lazy"
                className="h-9 w-9 rounded-full bg-surface-2 ring-2 ring-bg"
              />
            ))}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
              ))}
              <span className="ml-1 text-sm font-semibold">{ILLUSTRATIVE.rating}</span>
            </div>
            <div className="text-sm text-text-soft">
              Loved by {ILLUSTRATIVE.users} early users
            </div>
          </div>
        </div>
        {showMeta && (
          <div className="flex items-center gap-3">
            <GitHubStarButton size="sm" />
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-mute">
              ratings &amp; count illustrative
            </span>
          </div>
        )}
      </div>
    </FadeIn>
  );
}

function ThesisPage() {
  const dmg = useDmgDownload();
  return (
    <main className="pt-14">
      <section className="relative overflow-hidden py-24 md:py-32 grain">
        <div className="glow-gold absolute inset-0 -z-10 opacity-30" />
        <div className="mx-auto max-w-3xl px-6 text-center">
          <FadeIn>
            <p className="text-xs uppercase tracking-[0.2em] text-gold">Why <Brand /> exists</p>
            <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-[-0.02em] md:text-6xl">
              A private intelligence for every person,{" "}
              <span className="font-serif italic text-text-soft">that compounds for a lifetime.</span>
            </h1>
            <p className="mx-auto mt-7 max-w-xl text-lg text-text-soft">
              Prevail is a bet on a simple idea: the most important AI you ever use
              won't be the one at work. It'll be the one that knows your life, and
              keeps it yours.
            </p>
          </FadeIn>
          <div className="mt-10">
            <SocialProof />
          </div>
        </div>
      </section>

      <section className="border-t border-border-soft py-8 md:py-12">
        <div className="mx-auto max-w-3xl px-6">
          {THESES.map((t, i) => (
            <FadeIn key={t.title} delay={i * 0.04}>
              <div className="flex gap-6 border-b border-border-soft py-12 last:border-b-0 md:gap-10">
                <div className="font-serif text-4xl italic text-gold md:text-5xl">{String(i + 1).padStart(2, "0")}</div>
                <div>
                  <h2 className="text-2xl font-semibold leading-snug tracking-[-0.01em] md:text-3xl">{t.title}</h2>
                  <p className="mt-4 text-lg leading-relaxed text-text-soft">{t.body}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="border-t border-border-soft py-20 md:py-28 grain">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <FadeIn>
            <h2 className="text-3xl font-semibold tracking-[-0.02em] md:text-4xl">
              Start your vault. <span className="font-serif italic text-text-soft">It only compounds from here.</span>
            </h2>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={dmg.url}
                className="inline-flex items-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-medium text-bg transition-all hover:bg-gold-bright hover:-translate-y-0.5"
                style={{ boxShadow: "0 4px 24px rgba(196, 163, 90, 0.25)" }}
              >
                <Download className="h-4 w-4" /> Download for macOS
              </a>
              <a href="/" className="inline-flex items-center gap-1.5 rounded-md border border-border-soft px-6 py-3 text-sm text-text-soft hover:text-text">
                Back to home <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LIFE DOMAINS — radial constellation of the life areas Prevail covers.

const LIFE_DOMAINS: { label: string; Icon: typeof Heart }[] = [
  { label: "Health", Icon: Heart },
  { label: "Wealth", Icon: TrendingUp },
  { label: "Tax", Icon: Receipt },
  { label: "Career", Icon: Briefcase },
  { label: "Benefits", Icon: Gift },
  { label: "Home", Icon: Home },
  { label: "Insure", Icon: ShieldCheck },
  { label: "Calendar", Icon: Calendar },
  { label: "Records", Icon: FileText },
  { label: "Family", Icon: Users },
  { label: "Learning", Icon: GraduationCap },
  { label: "Chief", Icon: Crown },
];

const VAULT_QUESTIONS = [
  { q: "Which of my documents are about to expire?", tag: "Records" },
  { q: "Can I afford to take three months off?", tag: "Wealth" },
  { q: "What should I ask at my next review?", tag: "Career" },
  { q: "Is this insurance policy still worth keeping?", tag: "Insure" },
];

function LifeDomains() {
  const [qi, setQi] = useState(0);
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const N = LIFE_DOMAINS.length;
  useEffect(() => {
    if (reduce) return;
    const tq = setInterval(() => setQi((n) => (n + 1) % VAULT_QUESTIONS.length), 3200);
    const ta = setInterval(() => setActive((a) => (a + 1) % N), 1500);
    return () => { clearInterval(tq); clearInterval(ta); };
  }, [reduce, N]);
  const R = 40;
  const nodes = LIFE_DOMAINS.map((d, i) => {
    const ang = ((-90 + i * (360 / N)) * Math.PI) / 180;
    return { ...d, x: 50 + R * Math.cos(ang), y: 50 + R * Math.sin(ang) };
  });
  return (
    <section className="border-t border-border-soft py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn>
          <p className="text-center text-xs uppercase tracking-[0.2em] text-gold">One place for all of it</p>
          <h2 className="mx-auto mt-4 max-w-2xl text-center text-4xl font-semibold tracking-[-0.02em] md:text-5xl">
            Your whole life, <span className="font-serif italic text-text-soft">one domain at a time.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-text-soft">
            Prevail organizes your life into domains, each a folder the council can reason over. Start with one, or all of them.
          </p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="relative mx-auto mt-14 aspect-square w-full max-w-[560px]">
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
              {nodes.map((n, i) => (
                <line
                  key={n.label}
                  x1="50"
                  y1="50"
                  x2={n.x}
                  y2={n.y}
                  stroke="currentColor"
                  strokeWidth={active === i ? 0.35 : 0.2}
                  strokeDasharray="0.9 0.9"
                  className={`transition-all duration-500 ${active === i ? "text-gold/60" : "text-border"}`}
                />
              ))}
              {/* pulses flowing from each domain into "You" */}
              {!reduce && nodes.map((n, i) => (
                <motion.circle
                  key={`pulse-${n.label}`}
                  r="0.75"
                  className="fill-gold"
                  initial={{ cx: n.x, cy: n.y, opacity: 0 }}
                  animate={{ cx: 50, cy: 50, opacity: [0, 0.9, 0] }}
                  transition={{ duration: 2.1, repeat: Infinity, ease: "easeIn", delay: (i / N) * 2.1 }}
                />
              ))}
            </svg>

            {/* breathing glow behind center */}
            {!reduce && (
              <motion.span
                className="absolute left-1/2 top-1/2 -z-0 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ width: "34%", height: "34%", background: "radial-gradient(circle, rgba(196,163,90,0.28), transparent 70%)" }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.25, 0.6] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                aria-hidden
              />
            )}

            <div className="absolute left-1/2 top-1/2 z-10 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-gold-border bg-surface-1 shadow-lg md:h-24 md:w-24">
              <Logo size={26} />
              <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-gold">You</span>
            </div>

            {nodes.map((n, i) => {
              const Icon = n.Icon;
              const on = active === i;
              return (
                <div
                  key={n.label}
                  className="group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5"
                  style={{ left: `${n.x}%`, top: `${n.y}%` }}
                >
                  <motion.div
                    initial={reduce ? false : { opacity: 0, scale: 0.4 }}
                    whileInView={reduce ? undefined : { opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ delay: 0.25 + i * 0.05, type: "spring", stiffness: 220, damping: 18 }}
                    className={`flex h-11 w-11 items-center justify-center rounded-full border bg-surface-0 transition-all duration-500 md:h-12 md:w-12 group-hover:border-gold-border group-hover:text-gold ${
                      on ? "border-gold-border text-gold shadow-[0_0_18px_rgba(196,163,90,0.35)]" : "border-border-soft text-text-soft"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.div>
                  <span className={`font-mono text-[9px] uppercase tracking-[0.14em] transition-colors duration-500 md:text-[10px] ${on ? "text-gold" : "text-text-mute"}`}>
                    {n.label}
                  </span>
                </div>
              );
            })}
          </div>
        </FadeIn>
        <FadeIn delay={0.15}>
          <div className="mx-auto mt-12 max-w-md text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-mute">Ask your vault</div>
            <motion.p
              key={qi}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-3 text-lg italic text-text-soft md:text-xl"
            >
              "{VAULT_QUESTIONS[qi].q}"
            </motion.p>
            <span className="mt-3 inline-block rounded-full border border-border-soft px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-gold">{VAULT_QUESTIONS[qi].tag}</span>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DIFFERENTIATORS — the genuinely unique stuff: a council you assemble,
// self-learning memory, proactive loops, and Bunker/Cloud control.

const DIFFERENTIATORS = [
  {
    Icon: Users,
    color: "#c4a35a",
    title: "A council you assemble",
    body: "Pick which models sit on the council. They answer in parallel, a chair you choose writes one verdict, and the panel shows exactly where they disagreed.",
  },
  {
    Icon: Sparkles,
    color: "#5fbfff",
    title: "It learns you, not just your question",
    body: "Every decision is captured the moment you make it and distilled into living memory. The next answer already knows what you decided last time.",
  },
  {
    Icon: Target,
    color: "#6ee787",
    title: "It works toward your goals",
    body: "Proactive loops, reminders, and generated tasks pursue what matters in the background. It doesn't just respond, it follows up.",
  },
  {
    Icon: ShieldCheck,
    color: "#c4a8ff",
    title: "Bunker or Cloud, your call",
    body: "Bunker Mode runs entirely on local models, nothing leaves your Mac. Cloud Mode brings in Claude, GPT, and Gemini for the frontier. Switch per question.",
  },
];

function Differentiators() {
  return (
    <section className="relative border-t border-border-soft py-24 md:py-28">
      <div className="glow-ai absolute inset-0 -z-10 opacity-20" />
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn>
          <p className="text-center text-xs uppercase tracking-[0.2em] text-ai">More than a chatbot</p>
          <h2 className="mx-auto mt-4 max-w-2xl text-center text-4xl font-semibold tracking-[-0.02em] md:text-5xl">
            It doesn't just answer. <span className="font-serif italic text-text-soft">It works for you.</span>
          </h2>
        </FadeIn>
        <div className="mx-auto mt-14 grid max-w-5xl gap-5 md:grid-cols-2">
          {DIFFERENTIATORS.map((it, i) => {
            const Icon = it.Icon;
            return (
              <FadeIn key={it.title} delay={i * 0.06}>
                <div className="flex h-full gap-5 rounded-2xl border border-border-soft bg-surface-0 p-7 transition-all hover:-translate-y-0.5 hover:border-border hover:bg-surface-1">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${it.color}18`, color: it.color }}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold leading-snug">{it.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-text-soft">{it.body}</p>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function LandingMain() {
  return (
    <main className="pt-14">
      <Hero />
      <LifeDomains />
      <DemoVideo />
      <HardQuestionsSection />
      <Pillars />
      <Differentiators />
      <DownloadSection />
      <FAQSection />
    </main>
  );
}

export default function App() {
  const [theme, toggleTheme] = useTheme();
  const path = typeof window !== "undefined" ? window.location.pathname.replace(/\/+$/, "") : "";
  const isThesis = path === "/thesis";

  useEffect(() => {
    const handler = (e: Event) => {
      const t = e.target as HTMLAnchorElement;
      if (t.tagName === "A" && t.hash && t.hash.length > 1) {
        const el = document.querySelector(t.hash);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <div className="min-h-screen bg-bg">
      <Nav theme={theme} onToggleTheme={toggleTheme} />
      {isThesis ? <ThesisPage /> : <LandingMain />}
      <Footer />
    </div>
  );
}
