import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion, useInView, useReducedMotion, useMotionValue, useSpring, useTransform, MotionConfig } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Crown,
  Download,
  FileText,
  GraduationCap,
  Heart,
  Home,
  Layers,
  Moon,
  Paperclip,
  Play,
  Receipt,
  Scale,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Target,
  Terminal,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  siApple,
  siClaude,
  siGooglegemini,
  siOllama,
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
          <a href="/#demo" className="inline-flex items-center gap-1.5 hover:text-text">
            <Play className="h-4 w-4" /> Demo
            <span className="rounded-full bg-gold/15 px-1.5 py-0.5 text-[10px] font-semibold text-gold">{DEMO_SLIDES.length}</span>
          </a>
          <a href="/#how" className="inline-flex items-center gap-1.5 hover:text-text"><Layers className="h-4 w-4" /> How it works</a>
          <a href="/thesis" className="inline-flex items-center gap-1.5 hover:text-text"><Sparkles className="h-4 w-4" /> Thesis</a>
          <a href="/#install" className="inline-flex items-center gap-1.5 hover:text-text"><Download className="h-4 w-4" /> Install</a>
          <a href="https://docs.prevail.sh" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-text"><FileText className="h-4 w-4" /> Docs</a>
          <a href="https://prevail.sh/llms.txt" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-text"><Terminal className="h-4 w-4" /> llms.txt</a>
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
// Types `word` out character by character, holds, deletes it back slowly, then
// calls onCycle so the parent advances to the next domain. The word stays in
// sync with the highlighted domain in the hero radial (parent owns the index).
// A faint full-word ghost sits behind so the word has a "background feel".
function DomainTyper({ word, onCycle }: { word: string; onCycle: () => void }) {
  const reduce = useReducedMotion();
  const [text, setText] = useState("");
  useEffect(() => {
    if (reduce) {
      setText(word);
      return;
    }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const type = (i: number) => {
      if (cancelled) return;
      setText(word.slice(0, i));
      timer = i < word.length
        ? setTimeout(() => type(i + 1), 130)
        : setTimeout(() => del(word.length), 2600);
    };
    const del = (i: number) => {
      if (cancelled) return;
      setText(word.slice(0, i));
      timer = i > 0
        ? setTimeout(() => del(i - 1), 160)
        : setTimeout(() => { if (!cancelled) onCycle(); }, 600);
    };
    setText("");
    timer = setTimeout(() => type(1), 250);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [word, reduce, onCycle]);

  return (
    // The untyped remainder is rendered invisibly so the box always reserves the
    // full word's width — the centered headline never jitters as it types.
    <span className="font-serif italic">
      <span className="text-gold [text-shadow:0_2px_28px_rgba(196,163,90,0.35)]">{text}</span>
      {!reduce && (
        <span
          aria-hidden
          className="mx-[2px] inline-block h-[0.78em] w-[3px] animate-pulse rounded-full bg-gold align-baseline"
        />
      )}
      <span aria-hidden className="invisible">{word.slice(text.length)}</span>
    </span>
  );
}

function HarnessLine({ word, onCycle }: { word: string; onCycle: () => void }) {
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

  return (
    <h1 className="text-center font-semibold tracking-[-0.02em] leading-[1.08] text-[clamp(1.6rem,6.2vw,5rem)]">
      <span className="flex flex-nowrap items-baseline justify-center gap-x-3 whitespace-nowrap sm:gap-x-4">
        <span className="font-serif italic">
          <span className="text-ai">AI</span>{" "}
          <span className="text-gold">harness</span>
        </span>
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
        <DomainTyper word={word} onCycle={onCycle} />
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
  // Shared highlighted domain — the headline typewriter and the radial both read
  // it, so the word being typed always matches the lit-up node on the right. The
  // typewriter drives the advance (after it finishes deleting a word).
  const [activeDomain, setActiveDomain] = useState(0);
  const cycleDomain = useCallback(() => {
    setActiveDomain((cur) => {
      let n = cur;
      while (n === cur) n = Math.floor(Math.random() * LIFE_DOMAINS.length);
      return n;
    });
  }, []);
  // Primary download follows the detected OS; the other platforms + CLI are
  // quiet text links under the button. CLI copies the one-line installer.
  const [copied, setCopied] = useState(false);
  const copyCli = async () => {
    try {
      await navigator.clipboard.writeText("curl -fsSL prevail.sh/install | bash");
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };
  return (
    <section className="relative isolate overflow-hidden pt-8 pb-10 grain lg:flex lg:min-h-screen lg:flex-col lg:justify-start lg:pt-[3vh] lg:pb-8">
      <div className="glow-gold absolute inset-0 -z-10" />
      <HeroAuroras />
      {/* You at the center — the life-domains radial is the centerpiece, with
          the message as a halo of text above and the CTA below. */}
      <div className="mx-auto flex max-w-7xl flex-col items-center px-6 text-center">
        <FadeIn delay={0.05}>
          <HarnessLine word={LIFE_DOMAINS[activeDomain].label} onCycle={cycleDomain} />
        </FadeIn>

        <FadeIn delay={0.1}>
          <p className="mt-4 text-base leading-relaxed text-text-soft md:text-lg">
            Everyone's racing to automate their <span className="font-bold text-gold">job</span>.{" "}
            <span className="text-text">We built the AI for everything else in{" "}
            <span className="font-bold text-ai">life</span>.</span>
          </p>
        </FadeIn>

        <FadeIn delay={0.15} y={20}>
          <div className="mt-5 w-[clamp(342px,46.5vh,475px)] max-w-[74vw]">
            <HeroSlider active={activeDomain} />
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          {/* Download CTA and social proof, side by side */}
          <div className="mt-5 flex flex-col items-center justify-center gap-x-10 gap-y-5 sm:flex-row sm:items-center">
            <div className="flex flex-col items-center">
              <a
                href={isWindows ? exe.url : dmg.url}
                download={isWindows ? exe.name : dmg.name}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-8 py-3 font-medium text-bg transition-all hover:bg-gold-bright hover:-translate-y-0.5"
                style={{ boxShadow: "0 6px 32px rgba(196, 163, 90, 0.3)" }}
              >
                <Download className="h-4 w-4" />
                Download for {isWindows ? "Windows" : "macOS"}
              </a>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-text-soft">
                <a
                  href={isWindows ? dmg.url : exe.url}
                  download={isWindows ? dmg.name : exe.name}
                  className="underline-offset-2 transition-colors hover:text-text hover:underline"
                >
                  {isWindows ? "macOS" : "Windows"}
                </a>
                <span aria-hidden className="text-text-mute">·</span>
                <button onClick={copyCli} className="underline-offset-2 transition-colors hover:text-text hover:underline">
                  {copied ? "Copied ✓" : "CLI"}
                </button>
                <span aria-hidden className="text-text-mute">·</span>
                <a href="#install" className="underline-offset-2 transition-colors hover:text-text hover:underline">all builds</a>
              </div>
            </div>
            <div aria-hidden className="hidden h-12 w-px bg-border-soft sm:block" />
            <SocialProof showMeta={false} />
          </div>
        </FadeIn>

        <FadeIn delay={0.26}>
          <div className="mt-10 flex flex-col items-center gap-4">
            <div className="flex max-w-full flex-nowrap items-center gap-x-4 overflow-hidden whitespace-nowrap text-text-mute">
              <span className="shrink-0 text-[11px] uppercase tracking-[0.18em]">Works with</span>
              {WORKS_WITH.map((w) => (
                <div
                  key={w.name}
                  title={w.name}
                  className="group flex shrink-0 items-center gap-1.5 text-text-soft transition-colors hover:text-text"
                >
                  <span style={{ color: w.color }} className="inline-flex">
                    {w.render("h-[1.65rem] w-[1.65rem]")}
                  </span>
                  <span className="text-xs">{w.name}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// Hero visual — the life-domains radial. Every domain orbits "You" and feeds
// the center; a highlighted domain cycles. (Moved here from its own section.)
function HeroSlider({ active }: { active: number }) {
  const reduce = useReducedMotion();
  const N = LIFE_DOMAINS.length;
  const R = 40;
  const nodes = LIFE_DOMAINS.map((d, i) => {
    const ang = ((-90 + i * (360 / N)) * Math.PI) / 180;
    return { ...d, x: 50 + R * Math.cos(ang), y: 50 + R * Math.sin(ang) };
  });
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[680px]">
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
        {!reduce &&
          nodes.map((n, i) => (
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
            className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 ${
              n.y < 50 ? "flex-col-reverse" : "flex-col"
            }`}
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border bg-surface-0 transition-all duration-500 md:h-11 md:w-11 ${
                on ? "border-gold-border text-gold shadow-[0_0_18px_rgba(196,163,90,0.35)]" : "border-border-soft text-text-soft"
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <span className={`font-mono text-[9px] uppercase tracking-[0.14em] transition-colors duration-500 md:text-[10px] ${on ? "text-gold" : "text-text-mute"}`}>
              {n.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

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
          <h2 className="mx-auto mt-4 text-center text-4xl font-semibold tracking-[-0.02em] md:text-5xl text-balance">
            Three ideas. <span className="font-serif italic text-text-soft">That's the whole app.</span>
          </h2>
        </FadeIn>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Layers,
              title: "For life's biggest decisions",
              text: "Wealth, health, career, tax, estate, and more. Prevail is built for the high-stakes parts of your life, each a plain folder you own. No database, no cloud.",
              color: "#6ee787",
              visual: (
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Wealth", Icon: TrendingUp },
                    { label: "Health", Icon: Heart },
                    { label: "Career", Icon: Briefcase },
                    { label: "Tax", Icon: Receipt },
                    { label: "Family", Icon: Users },
                    { label: "Home", Icon: Home },
                  ].map((d) => {
                    const DIcon = d.Icon;
                    return (
                      <div
                        key={d.label}
                        className="flex flex-col items-center gap-1.5 rounded-lg border border-border-soft bg-bg/50 py-3 text-text-soft"
                      >
                        <DIcon className="h-4 w-4 text-[#6ee787]" />
                        <span className="text-[10px] font-medium uppercase tracking-wider text-text-mute">{d.label}</span>
                      </div>
                    );
                  })}
                </div>
              ),
            },
            {
              icon: Scale,
              title: "A council, not just one model",
              text: "Ask every AI model at once, not just one. A chair reads all the answers, writes a single verdict, and flags where they disagree.",
              color: "#c4a35a",
              visual: (
                <div className="flex flex-col items-center">
                  {/* Round table: named models seated around Prevail; one is the chair */}
                  <div className="relative mx-auto h-52 w-52">
                    {/* table ring */}
                    <div className="absolute inset-7 rounded-full border border-dashed border-border-soft" aria-hidden />
                    {/* center — Prevail */}
                    <div
                      className="absolute left-1/2 top-1/2 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-border bg-surface-0"
                      title="Prevail"
                      style={{ boxShadow: "0 0 30px rgba(196, 163, 90, 0.25)" }}
                    >
                      <Logo size={26} />
                    </div>
                    {/* seats — model + name, one marked as chair */}
                    {[
                      { name: "Claude", chair: true, pos: "left-1/2 top-0 -translate-x-1/2", bg: "#cc785c", fg: "#ffffff", render: (c: string) => <SimpleIcon icon={siClaude} className={c} /> },
                      { name: "Gemini", pos: "right-0 top-1/2 -translate-y-1/2", bg: "#4285F4", fg: "#ffffff", render: (c: string) => <SimpleIcon icon={siGooglegemini} className={c} /> },
                      { name: "Codex", pos: "left-1/2 bottom-0 -translate-x-1/2", bg: "#0d0d0d", fg: "#ffffff", render: (c: string) => <OpenAIMark className={c} /> },
                      { name: "Ollama", pos: "left-0 top-1/2 -translate-y-1/2", bg: "#ededed", fg: "#181818", render: (c: string) => <SimpleIcon icon={siOllama} className={c} /> },
                    ].map((m) => (
                      <div key={m.name} className={`absolute ${m.pos} z-10 flex flex-col items-center gap-1`}>
                        <span
                          title={m.name}
                          aria-label={m.chair ? `${m.name} (chair)` : m.name}
                          className={`relative flex h-10 w-10 items-center justify-center rounded-full ${
                            m.chair ? "ring-2 ring-gold" : "ring-2 ring-surface-0"
                          }`}
                          style={{ background: m.bg, color: m.fg }}
                        >
                          {m.render("h-4 w-4")}
                          {m.chair && (
                            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-bg">
                              <Crown className="h-2.5 w-2.5" />
                            </span>
                          )}
                        </span>
                        <span className={`text-[10px] font-medium ${m.chair ? "text-gold" : "text-text-mute"}`}>
                          {m.name}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-text-mute">
                    any model can chair · one verdict
                  </div>
                </div>
              ),
            },
            {
              icon: Sparkles,
              title: "It learns and adapts",
              text: "Every question and verdict stays in your vault, so Prevail learns your life and adapts as things change, working for you, not just answering.",
              color: "#5fbfff",
              visual: (
                <div className="flex flex-col items-center">
                  {/* A mind that keeps thinking: ripples radiate out, memories accrete */}
                  <div className="relative mx-auto flex h-28 w-full items-center justify-center">
                    <span className="absolute h-24 w-24 rounded-full border border-[#5fbfff]/15" aria-hidden />
                    <span className="absolute h-16 w-16 rounded-full border border-[#5fbfff]/30" aria-hidden />
                    <motion.span
                      className="absolute h-12 w-12 rounded-full border border-[#5fbfff]/50"
                      animate={{ scale: [1, 2.1], opacity: [0.5, 0] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
                      aria-hidden
                    />
                    <span
                      className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-[#5fbfff]/50 bg-surface-0 text-[#5fbfff]"
                      style={{ boxShadow: "0 0 26px rgba(95,191,255,0.4)" }}
                    >
                      <Sparkles className="h-5 w-5" />
                    </span>
                    {/* memories accumulating around the mind */}
                    <span className="absolute h-2 w-2 rounded-full bg-[#5fbfff]" style={{ left: "78%", top: "24%" }} aria-hidden />
                    <span className="absolute h-1.5 w-1.5 rounded-full bg-[#5fbfff]/70" style={{ left: "20%", top: "64%" }} aria-hidden />
                    <span className="absolute h-1.5 w-1.5 rounded-full bg-[#5fbfff]/60" style={{ left: "70%", top: "76%" }} aria-hidden />
                    <span className="absolute h-1 w-1 rounded-full bg-[#5fbfff]/50" style={{ left: "28%", top: "26%" }} aria-hidden />
                  </div>
                  <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-text-mute">learns a little more each time</div>
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
// INSTALL STUDIO — one terminal-style card with icon-forward tabs that covers
// every way to get Prevail: the native macOS and Windows apps, the curl one-line
// CLI installer, and a paste-into-Claude prompt that points an agent at
// llms.txt. App tabs show a download CTA; command tabs show a copyable line.

const INSTALL_TABS = [
  {
    key: "mac",
    label: "macOS",
    kind: "app",
    icon: (c: string) => <SimpleIcon icon={siApple} className={c} />,
  },
  {
    key: "win",
    label: "Windows",
    kind: "app",
    icon: (c: string) => <WindowsMark className={c} />,
  },
  {
    key: "curl",
    label: "curl",
    kind: "cmd",
    prompt: false,
    command: "curl -fsSL prevail.sh/install | bash",
    caption: "macOS, Linux & Windows (WSL). The desktop app already bundles this engine.",
    icon: (c: string) => <Terminal className={c} />,
  },
  {
    key: "claude",
    label: "Claude",
    kind: "cmd",
    prompt: true,
    command: "Please install prevail\nhttps://prevail.sh/llms.txt",
    caption: "Paste into Claude or any coding agent — it reads llms.txt and installs Prevail.",
    icon: (c: string) => <SimpleIcon icon={siClaude} className={c} />,
  },
] as const;

function AppPane({ platform }: { platform: "mac" | "win" }) {
  const version = useLatestVersion();
  const dmg = useDmgDownload();
  const exe = useExeDownload();
  const isMac = platform === "mac";
  const build = isMac ? dmg : exe;
  return (
    <div className="flex flex-col items-center text-center sm:flex-row sm:gap-7 sm:text-left">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-gold-border bg-surface-1 text-gold">
        {isMac ? (
          <SimpleIcon icon={siApple} className="h-9 w-9" />
        ) : (
          <WindowsMark className="h-9 w-9" />
        )}
      </div>
      <div className="mt-5 min-w-0 flex-1 sm:mt-0">
        <div className="text-xs font-medium uppercase tracking-[0.2em] text-gold">
          {isMac ? "Desktop · macOS arm64" : "Desktop · Windows x64"}
        </div>
        <h3 className="mt-2 text-2xl font-bold tracking-tight">
          {isMac ? "Prevail.app" : "Prevail for Windows"}
        </h3>
        <p className="mt-1.5 text-sm text-text-mute">
          v{version} · {isMac ? "Apple Silicon · macOS 13+" : "Windows 10/11 · x64"} ·
          self-contained, no terminal
        </p>
        <a
          href={build.url}
          download={build.name}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-gold py-3 font-medium text-bg transition-all hover:bg-gold-bright hover:-translate-y-0.5 sm:w-auto sm:px-9"
          style={{ boxShadow: "0 6px 32px rgba(196, 163, 90, 0.3)" }}
        >
          <Download className="h-4 w-4" />
          {isMac ? "Download .dmg" : "Download installer"}
        </a>
      </div>
    </div>
  );
}

function CmdPane({
  command,
  prompt,
  caption,
}: {
  command: string;
  prompt: boolean;
  caption: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };
  return (
    <div>
      <div className="flex items-start justify-between gap-4 rounded-lg border border-border-soft bg-surface-0 px-5 py-5">
        <pre className="min-w-0 flex-1 overflow-x-auto whitespace-pre-wrap font-mono text-sm leading-relaxed text-text">
          {prompt ? (
            command
          ) : (
            <>
              <span className="text-gold">$ </span>
              {command}
            </>
          )}
        </pre>
        <button
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy to clipboard"}
          className="shrink-0 rounded-md p-1.5 text-text-mute transition-colors hover:bg-surface-1 hover:text-text"
        >
          {copied ? <Check className="h-4 w-4 text-gold" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <p className="mt-4 text-center text-xs text-text-mute">{caption}</p>
    </div>
  );
}

function InstallStudio() {
  const isWindows = useIsWindows();
  const [tab, setTab] = useState<(typeof INSTALL_TABS)[number]["key"]>(
    isWindows ? "win" : "mac",
  );
  const active = INSTALL_TABS.find((t) => t.key === tab)!;
  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-border bg-[#0c0c0e] shadow-2xl">
      {/* title bar: traffic lights + icon-forward tab strip */}
      <div className="flex items-center justify-between gap-3 border-b border-border-soft px-4 py-3">
        <div className="hidden gap-1.5 sm:flex">
          <span className="h-3 w-3 rounded-full bg-[#3a3a3e]" />
          <span className="h-3 w-3 rounded-full bg-[#3a3a3e]" />
          <span className="h-3 w-3 rounded-full bg-[#3a3a3e]" />
        </div>
        <div className="flex w-full items-center justify-between gap-1 rounded-lg bg-surface-0 p-1 sm:w-auto sm:justify-end">
          {INSTALL_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              aria-pressed={tab === t.key}
              title={t.label}
              className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors sm:flex-none ${
                tab === t.key
                  ? "bg-surface-1 text-text ring-1 ring-border-strong"
                  : "text-text-mute hover:text-text-soft"
              }`}
            >
              {t.icon("h-4 w-4")}
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>
      {/* body */}
      <div className="p-6 sm:p-8">
        {active.kind === "app" ? (
          <AppPane platform={active.key as "mac" | "win"} />
        ) : (
          <CmdPane command={active.command} prompt={active.prompt} caption={active.caption} />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DOWNLOAD / INSTALL section — one tabbed card for every platform & method

function DownloadSection() {
  return (
    <section id="install" className="border-t border-border-soft py-24 md:py-32 grain">
      <div className="glow-gold absolute inset-0 -z-10 opacity-50" />
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn>
          <p className="text-center text-xs uppercase tracking-[0.2em] text-gold">
            Ask a council. Prevail.
          </p>
          <h2 className="mx-auto mt-4 text-center text-4xl font-semibold tracking-[-0.02em] md:text-5xl text-balance">
            Get it <span className="font-serif italic text-text-soft">in a click.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-center text-lg text-text-soft">
            Mac, Windows, terminal, or your agent — pick a tab and go.
          </p>
        </FadeIn>

        <FadeIn delay={0.08}>
          <div id="desktop" className="mt-14 scroll-mt-24">
            <InstallStudio />
          </div>
        </FadeIn>
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
    q: "Do you collect any analytics or telemetry?",
    a: "Off by default. Prevail sends nothing unless you explicitly turn it on in Settings. If you opt in, it's anonymous (a random local ID, never your name, email, files, or chats), limited to a small fixed list of events, and you can see exactly what's sent and switch it off anytime.",
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
  return (
    <footer className="border-t border-border-soft bg-surface-0">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div>
          <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-text-mute">
            Part of a family of private, local-first tools
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                name: "Memosa",
                tagline: "Private meeting memory for Mac",
                href: "https://memosa.dev/",
                tile: <img src="/memosa-logo.png" alt="Memosa" className="h-full w-full object-cover" />,
                tileClass: "overflow-hidden bg-[#0c0c0e]",
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
                tile: <img src="/aireadyu-logo.svg" alt="AI Ready U" className="h-full w-full" />,
                tileClass: "overflow-hidden",
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
        {/* One minimal closing section — brand, tagline, the two links that
            matter, copyright. Everything else lives in the downloads above. */}
        <div className="mt-16 flex flex-col items-center gap-6 border-t border-border-soft pt-12 text-center">
          <div className="flex items-center gap-2">
            <Logo size={22} />
            <Brand className="text-lg font-semibold" />
          </div>
          <p className="font-serif text-2xl italic text-text-soft md:text-3xl text-balance">
            AI for your <span className="not-italic text-gold">life</span>, not your job.
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-text-soft">
            <a href="/tos" className="hover:text-text">Terms of Service</a>
            <a href="/privacy" className="hover:text-text">Privacy Policy</a>
          </nav>
          <GitHubStarButton size="lg" />
          <p className="text-xs text-text-mute">© 2026 Prevail.sh · built local, shipped open</p>
          <p className="text-[11px] text-text-mute/70">Star &amp; share on GitHub. Ratings and user counts shown on this site are illustrative.</p>
        </div>
      </div>
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
// Demo carousel — widescreen product videos. The active clip autoplays muted
// and, when it ends, advances to the next (looping the set). Users can also jump
// with the arrows or dots. Caption updates per slide.
const DEMO_SLIDES = [
  {
    src: "/prevail-demo2.mp4",
    poster: "/prevail-demo2-poster.jpg",
    title: "Convene a council",
    blurb: "One question, every model deliberating, and a single verdict saved as markdown you own.",
  },
  {
    src: "/prevail-benchmark.mp4",
    poster: "/prevail-benchmark-poster.jpg",
    title: "Benchmark against your life",
    blurb: "Grade every model per domain on your real questions, not generic tests.",
  },
  {
    src: "/prevail-connectivity.mp4",
    poster: "/prevail-connectivity-poster.jpg",
    title: "Connect every model you have",
    blurb: "Prevail auto-detects the AI CLIs you're already logged into and convenes them.",
  },
];

function DemoVideo() {
  const [idx, setIdx] = useState(0);
  const n = DEMO_SLIDES.length;
  const go = (d: number) => setIdx((i) => (i + d + n) % n);
  const slide = DEMO_SLIDES[idx];
  return (
    <section id="demo" className="border-t border-border-soft py-20 md:py-28 grain">
      <div className="relative mx-auto max-w-[1700px] px-4 sm:px-6">
        <div className="glow-gold absolute inset-0 -z-10 opacity-40" />
        <FadeIn>
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">
              See it in action
            </p>
            <h2 className="mx-auto mt-4 text-4xl font-semibold tracking-[-0.02em] md:text-5xl text-balance">
              Watch it <span className="font-serif italic text-text-soft">work.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-full overflow-x-auto whitespace-nowrap text-sm text-text-soft md:text-base">
              <span className="font-medium text-text">{slide.title}.</span> {slide.blurb}
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={0.15}>
          <div className="group relative mt-8">
            <div className="overflow-hidden rounded-2xl border border-gold-border bg-black shadow-2xl">
              <video
                key={slide.src}
                src={slide.src}
                poster={slide.poster}
                autoPlay
                muted
                playsInline
                preload="metadata"
                controls
                onEnded={() => go(1)}
                className="block aspect-video w-full bg-black"
              />
            </div>

            {/* Prev / next arrows */}
            <button
              onClick={() => go(-1)}
              aria-label="Previous demo"
              className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-border-soft bg-bg/70 p-2 text-text-soft opacity-0 backdrop-blur transition hover:bg-bg hover:text-text focus:opacity-100 group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next demo"
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-border-soft bg-bg/70 p-2 text-text-soft opacity-0 backdrop-blur transition hover:bg-bg hover:text-text focus:opacity-100 group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </FadeIn>

        {/* Numbered indicators */}
        <div className="mt-6 flex items-center justify-center gap-2.5">
          {DEMO_SLIDES.map((s, i) => (
            <button
              key={s.src}
              onClick={() => setIdx(i)}
              aria-label={`Show demo ${i + 1}: ${s.title}`}
              aria-current={i === idx}
              className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-all ${
                i === idx
                  ? "border-gold-border bg-gold text-bg"
                  : "border-border-soft text-text-mute hover:border-border-strong hover:text-text"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
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

// Illustrated avatars (DiceBear "personas") — modern, friendly, younger-looking
// flat portraits. Broad skin-tone + hair-color palettes and reduced glasses make
// the set visibly diverse. Illustrative — labelled as such.
const PROOF_FACES = ["Maya", "Leo", "Zara", "Theo", "Iris", "Kai", "Nora", "Eli"].map(
  (seed) =>
    `https://api.dicebear.com/9.x/personas/svg?seed=${seed}` +
    `&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf,c1f4d1` +
    `&skinColor=623d36,92594b,a47c63,b16a5b,cb9e6e,e5a07e,eeb4a4` +
    `&hairColor=1b1b1b,3a2a1d,6c4a32,a55728,b9a05f,cb6820,e0ddff,ffffff` +
    `&glassesProbability=35`,
);

function SocialProof({ center = true, showMeta = true }: { center?: boolean; showMeta?: boolean }) {
  return (
    <FadeIn>
      <div className={`flex max-w-xl flex-col gap-2.5 ${center ? "mx-auto items-center" : "items-start"}`}>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-gold text-gold" />
            ))}
          </div>
          <span className="text-sm font-semibold">{ILLUSTRATIVE.rating}</span>
          <span className="text-sm text-text-soft">· Loved by {ILLUSTRATIVE.users} early users</span>
        </div>
        <div className="flex -space-x-2.5">
          {PROOF_FACES.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              loading="lazy"
              className="h-9 w-9 rounded-full bg-surface-2 object-cover ring-2 ring-bg"
            />
          ))}
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
  { label: "Family", Icon: Users },
  { label: "Learning", Icon: GraduationCap },
];

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
          <h2 className="mx-auto mt-4 text-center text-4xl font-semibold tracking-[-0.02em] md:text-5xl text-balance">
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

// ─────────────────────────────────────────────────────────────────────────────
// LEGAL — combined Terms of Service & Privacy Policy, served at /tos (aliases
// /terms, /privacy, /legal). Structure mirrors our sibling site paperclip.ing,
// rewritten for Prevail's reality: GPL-3.0, local-first, no accounts, no hosted
// backend, telemetry off by default. A `body` entry that is a string renders as
// a paragraph; an array renders as a bullet list; `caps` marks all-caps
// disclaimer blocks; `part`/`anchor` mark the two top-level dividers.

const LEGAL_EFFECTIVE = "June 17, 2026";

type LegalBlock = string | string[];
type LegalSection = {
  title: string;
  part?: boolean;
  anchor?: string;
  caps?: boolean;
  body?: LegalBlock[];
};

const LEGAL_SECTIONS: LegalSection[] = [
  {
    title: "Part I — Terms of Service",
    part: true,
  },
  {
    title: "1. Definitions",
    body: [
      [
        '"Prevail" refers to the open-source software available under the GNU General Public License v3.0 at github.com/fru-dev3/prevail-desktop and github.com/fru-dev3/prevail-cli.',
        '"fru.dev" (also "we," "us," or "our") refers to fru.dev (@fru), the maker that develops Prevail and operates the prevail.sh website.',
        '"Services" refers to the prevail.sh website, the install script served from it, the documentation, and any optional telemetry endpoint operated by fru.dev. Prevail itself runs entirely on your own machine and is not a hosted service.',
        '"User," "you," or "your" refers to any individual or entity using Prevail or the Services.',
        '"Content" refers to your vault and any data, files, prompts, or output you create with Prevail. Your Content lives on your machine; we do not receive it.',
      ],
    ],
  },
  {
    title: "2. Acceptance of Terms",
    body: [
      "By downloading, installing, or using Prevail, or by accessing the Services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you are using Prevail on behalf of an organization, you represent that you have the authority to bind that organization to these terms.",
      "If you do not agree to these terms, you must discontinue use of Prevail and the Services. Your continued use constitutes ongoing acceptance of these terms as they may be amended from time to time.",
    ],
  },
  {
    title: "3. Open-Source Software",
    body: [
      "Prevail is licensed under the GNU General Public License v3.0 (GPL-3.0). Nothing in these Terms of Service restricts, modifies, or supersedes the rights granted to you under that license with respect to the source code itself — including the rights to use, study, modify, and redistribute the software under the terms of the GPL-3.0.",
      "These Terms of Service govern the Services (the website, install script, and any optional telemetry endpoint) and your use of the Prevail name and branding, which are separate from the rights granted under the GPL-3.0.",
    ],
  },
  {
    title: "4. Acceptable Use",
    body: [
      "You agree to use Prevail and the Services only for lawful purposes and in compliance with all applicable laws and regulations. You shall not:",
      [
        "Use Prevail or the Services to engage in any activity that is illegal, harmful, or fraudulent;",
        "Attempt to gain unauthorized access to the prevail.sh website, its infrastructure, or any system operated by fru.dev;",
        "Interfere with or disrupt the integrity, security, or performance of the Services;",
        "Use the Services to transmit viruses, malware, or other harmful code;",
        "Misrepresent the Prevail name or branding, or distribute modified builds in a way that implies official endorsement by fru.dev;",
        "Resell or sublicense access to the Services without prior written authorization (this does not affect your rights to the source code under the GPL-3.0).",
      ],
    ],
  },
  {
    title: "5. No Accounts",
    body: [
      "Prevail requires no account, sign-up, or login. There are no credentials for us to store and no profile for us to maintain. You are responsible for the security of your own machine and the vault stored on it.",
    ],
  },
  {
    title: "6. Your Content and Intellectual Property",
    body: [
      "You own your vault and everything in it. Prevail is local-first: your Content stays in plain files on your machine and never leaves it except where you explicitly direct it — for example, when you use Cloud Mode, which sends your prompts and the context you select to the AI providers you choose.",
      "We claim no license to, and no ownership of, your Content. Because we do not receive it, we cannot use, reproduce, or distribute it.",
      "fru.dev retains all rights, title, and interest in the Prevail name, logo, and branding, and in the prevail.sh website. The source code remains available to you under the GPL-3.0.",
    ],
  },
  {
    title: "7. Third-Party AI Providers and Tools",
    body: [
      "Prevail orchestrates third-party AI command-line tools and models that you have installed or are logged into — for example Claude, Codex, Gemini, and local models via Ollama. Prevail does not provide these models; it convenes the ones already available on your machine.",
      "When you use Cloud Mode, your prompts and the context you select are sent to the third-party providers you choose, under their own terms of service and privacy policies. In Bunker Mode, processing stays on-device with local models. You are responsible for reviewing and complying with the terms of each provider you enable.",
    ],
  },
  {
    title: "8. Telemetry and Analytics",
    body: [
      "Prevail collects no telemetry by default. It sends nothing unless you explicitly opt in within Settings. If you opt in, telemetry is anonymous — a random local identifier, never your name, email, files, or chats — limited to a small fixed list of events, and you can see exactly what is sent and turn it off at any time.",
      "The prevail.sh marketing website uses Google Analytics to understand aggregate traffic. Ratings, user counts, and similar figures shown on the website are illustrative.",
    ],
  },
  {
    title: "9. Disclaimers",
    caps: true,
    body: [
      'PREVAIL AND THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE. FRU.DEV SPECIFICALLY DISCLAIMS ALL IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.',
      "PREVAIL IS EARLY, EXPERIMENTAL SOFTWARE. IT ORCHESTRATES THIRD-PARTY AI TOOLS THAT CAN PRODUCE INACCURATE OR INCOMPLETE OUTPUT. NOTHING PRODUCED BY PREVAIL IS LEGAL, FINANCIAL, TAX, MEDICAL, OR OTHER PROFESSIONAL ADVICE. ALWAYS REVIEW ANYTHING IMPORTANT YOURSELF AND CONSULT A QUALIFIED PROFESSIONAL.",
      "FRU.DEV DOES NOT WARRANT THAT PREVAIL OR THE SERVICES WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE. YOU USE THEM AT YOUR OWN RISK.",
    ],
  },
  {
    title: "10. Limitation of Liability",
    caps: true,
    body: [
      "TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL FRU.DEV BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATING TO YOUR USE OF OR INABILITY TO USE PREVAIL OR THE SERVICES.",
      "TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, FRU.DEV'S TOTAL AGGREGATE LIABILITY ARISING OUT OF OR RELATING TO THESE TERMS, PREVAIL, OR THE SERVICES SHALL NOT EXCEED ONE HUNDRED U.S. DOLLARS ($100). PREVAIL IS FREE AND OPEN-SOURCE SOFTWARE.",
    ],
  },
  {
    title: "11. Indemnification",
    body: [
      "You agree to indemnify, defend, and hold harmless fru.dev from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of or relating to: (a) your use of Prevail or the Services; (b) your violation of these terms; (c) your violation of any third-party right, including any intellectual property or privacy right, or the terms of any third-party AI provider; or (d) any Content you process using Prevail.",
    ],
  },
  {
    title: "12. Modifications to These Terms",
    body: [
      "fru.dev may modify these terms at any time. Changes are effective upon posting to this page with an updated effective date. Your continued use of Prevail or the Services after a change constitutes acceptance of the revised terms. It is your responsibility to review these terms periodically.",
    ],
  },
  {
    title: "13. Termination",
    body: [
      "You may stop using Prevail and the Services at any time. Because Prevail runs locally and requires no account, fru.dev does not control your local use and cannot revoke a copy you already have, subject to the GPL-3.0. fru.dev may suspend or discontinue the Services (such as the website or install script) at any time, with or without notice.",
      "Sections that by their nature should survive termination — including Sections 6, 8, 9, 10, and 11 — shall survive.",
    ],
  },
  {
    title: "14. Governing Law",
    body: [
      "These terms are governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict-of-laws principles. Any dispute arising out of or relating to these terms, Prevail, or the Services shall be subject to the exclusive jurisdiction of the state and federal courts located in California.",
    ],
  },
  {
    title: "15. General Provisions",
    body: [
      [
        "Entire Agreement: These terms constitute the entire agreement between you and fru.dev regarding the Services and supersede all prior agreements and understandings.",
        "Severability: If any provision is found unenforceable, the remaining provisions continue in full force and effect.",
        "Waiver: A failure to enforce any right or provision is not a waiver of that right or provision.",
        "Assignment: You may not assign these terms without our prior written consent; fru.dev may assign them without restriction.",
        "Force Majeure: fru.dev is not liable for any failure or delay in performance resulting from causes beyond its reasonable control.",
      ],
    ],
  },
  {
    title: "Part II — Privacy Policy",
    part: true,
    anchor: "privacy",
  },
  {
    title: "1. Our Approach to Privacy",
    body: [
      "Prevail is built local-first. The software runs on your machine, stores your vault in plain files you own, and sends us nothing by default. This Privacy Policy describes the limited data collected through the Services (the prevail.sh website and any optional, opt-in telemetry) — not data from Prevail itself, which we do not receive.",
      "This policy does not apply to third-party services or AI providers you use alongside Prevail. We encourage you to review their privacy policies.",
    ],
  },
  {
    title: "2. Data We Collect",
    body: [
      "We collect very little, and nothing about your vault:",
      [
        "From Prevail: nothing, by default. We do not operate accounts and do not receive your vault, files, prompts, or AI output.",
        "Website analytics: when you visit prevail.sh, Google Analytics records standard web data such as pages viewed, browser and device type, approximate location derived from IP address, and referral source.",
        "Optional telemetry (opt-in only): if you enable it in Settings, Prevail sends a random local identifier and a small fixed set of anonymous usage events. It never includes your name, email, files, or chats.",
        "Communications: if you email us or open a GitHub issue, we receive the content of that message.",
      ],
    ],
  },
  {
    title: "3. How We Use Data",
    body: [
      "We use the limited data we collect to:",
      [
        "Operate, maintain, and improve Prevail and the website;",
        "Understand aggregate usage and performance;",
        "Respond to support requests, feedback, and bug reports;",
        "Detect, prevent, and address security or technical issues;",
        "Comply with legal obligations.",
      ],
      "We do not sell your data. We do not use your vault or Content to train machine-learning models — we do not have it.",
    ],
  },
  {
    title: "4. Data Sharing and Disclosure",
    body: [
      "We do not sell personal data. We may share the limited data we hold in these circumstances:",
      [
        "Service providers: with the vendors that run our infrastructure — for example Netlify (website hosting), Google Analytics, and GitHub (source, releases, and issues) — subject to their own terms.",
        "Legal requirements: when required by law, regulation, legal process, or governmental request.",
        "Protection of rights: to protect the rights, property, or safety of fru.dev, our users, or the public.",
      ],
      "Separately, when you choose Cloud Mode, Prevail sends your prompts directly to the third-party AI providers you select. That exchange is governed by each provider's own privacy policy; the data does not pass through fru.dev.",
    ],
  },
  {
    title: "5. Data Retention",
    body: [
      "We retain the limited data we collect only as long as reasonably necessary for the purposes described in this policy or as required by law. Aggregated or anonymized analytics that cannot identify you may be retained indefinitely. Your vault is retained by you, on your machine, for as long as you keep it.",
    ],
  },
  {
    title: "6. Data Security",
    body: [
      "We apply commercially reasonable measures to protect the data we hold. Because Prevail is local-first, the security of your vault is largely in your hands: it lives on your machine, and you choose how to back it up or sync it (for example git, iCloud, or Tailscale). No method of transmission or storage is completely secure, and we cannot guarantee absolute security.",
    ],
  },
  {
    title: "7. Your Rights",
    body: [
      "Depending on your jurisdiction, you may have rights to access, correct, delete, port, or restrict the processing of personal data we hold, and to withdraw consent where processing is based on consent. Because we hold little or no personal data about you, there is often little for us to return or delete. To exercise any of these rights, contact us using the details below.",
    ],
  },
  {
    title: "8. International Data Transfers",
    body: [
      "The Services are operated from, and the limited data they collect may be processed in, the United States and other countries. By using the Services, you consent to the transfer of that data to jurisdictions that may have different data-protection laws than your own.",
    ],
  },
  {
    title: "9. Children's Privacy",
    body: [
      "The Services are not directed to children under the age of 13 (or the applicable age of digital consent in your jurisdiction), and we do not knowingly collect personal data from children. If you believe a child has provided us data, please contact us and we will delete it promptly.",
    ],
  },
  {
    title: "10. Changes to This Policy",
    body: [
      "We may update this Privacy Policy from time to time. Changes are posted to this page with a revised effective date. Your continued use of the Services after changes are posted constitutes acceptance of the revised policy.",
    ],
  },
  {
    title: "Contact",
    body: [
      "If you have questions about these Terms of Service or this Privacy Policy, please reach out:",
      [
        "Maker: fru.dev (@fru)",
        "GitHub: github.com/fru-dev3/prevail-desktop/issues",
      ],
    ],
  },
];

function LegalPage() {
  useEffect(() => {
    const path =
      typeof window !== "undefined"
        ? window.location.pathname.replace(/\/+$/, "")
        : "";
    if (path === "/privacy") {
      const el = document.getElementById("privacy");
      if (el) el.scrollIntoView();
    }
  }, []);

  return (
    <main className="pt-14">
      <section className="relative overflow-hidden py-20 md:py-28 grain">
        <div className="glow-gold absolute inset-0 -z-10 opacity-25" />
        <div className="mx-auto max-w-3xl px-6">
          <FadeIn>
            <p className="text-xs uppercase tracking-[0.2em] text-gold">Legal</p>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.02em] md:text-5xl">
              Terms of Service{" "}
              <span className="font-serif italic text-text-soft">&amp;</span>{" "}
              Privacy Policy
            </h1>
            <p className="mt-5 text-sm text-text-mute">
              Effective date: {LEGAL_EFFECTIVE}
            </p>
            <p className="mt-6 text-lg leading-relaxed text-text-soft">
              This document sets out the Terms of Service and Privacy Policy
              governing your use of Prevail (the open-source software) and the
              prevail.sh website and related services operated by fru.dev
              (&ldquo;Prevail,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or
              &ldquo;our&rdquo;). By using Prevail or these services, you agree to
              be bound by these terms.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="border-t border-border-soft py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-6">
          {LEGAL_SECTIONS.map((s) =>
            s.part ? (
              <h2
                key={s.title}
                id={s.anchor}
                className="mt-14 scroll-mt-24 border-b border-border-soft pb-4 text-xs font-medium uppercase tracking-[0.2em] text-gold first:mt-0"
              >
                {s.title}
              </h2>
            ) : (
              <div key={s.title} className="mt-10">
                <h3 className="text-lg font-semibold tracking-[-0.01em] md:text-xl">
                  {s.title}
                </h3>
                {s.body?.map((block, bi) =>
                  Array.isArray(block) ? (
                    <ul
                      key={bi}
                      className="mt-3 space-y-2 pl-5 text-text-soft [list-style:disc]"
                    >
                      {block.map((li, li2) => (
                        <li key={li2} className="leading-relaxed">
                          {li}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p
                      key={bi}
                      className={`mt-3 leading-relaxed text-text-soft ${
                        s.caps ? "text-xs uppercase tracking-wide text-text-mute" : ""
                      }`}
                    >
                      {block}
                    </p>
                  )
                )}
              </div>
            )
          )}

          <div className="mt-16 border-t border-border-soft pt-8">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-text-soft hover:text-text"
            >
              <ArrowRight className="h-3.5 w-3.5 rotate-180" /> Back to home
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

function LandingMain() {
  return (
    <main className="pt-14">
      <Hero />
      <DemoVideo />
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
  const isLegal =
    path === "/tos" ||
    path === "/terms" ||
    path === "/privacy" ||
    path === "/legal";

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
      {isThesis ? <ThesisPage /> : isLegal ? <LegalPage /> : <LandingMain />}
      <Footer />
    </div>
  );
}
