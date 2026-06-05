import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Check,
  Copy,
  Folder,
  Layers,
  MessageSquare,
  Moon,
  Scale,
  Sparkles,
  Star,
  Sun,
  Terminal,
} from "lucide-react";
import {
  siClaude,
  siDeepseek,
  siGooglegemini,
  siMeta,
  siMistralai,
  siOllama,
  siTelegram,
} from "simple-icons";

const GITHUB_CLI = "https://github.com/fru-dev3/prevail";
const GITHUB_DESKTOP = "https://github.com/fru-dev3/prevail-desktop";
const CHANGELOG_CLI = "https://github.com/fru-dev3/prevail/blob/main/CHANGELOG.md";
const DMG_URL =
  "https://github.com/fru-dev3/prevail-desktop/releases/latest/download/Prevail_0.1.0_aarch64.dmg";
const INSTALL_CMD = "curl -fsSL prevail.sh/install | bash";
const VERSION_CLI = "1.6.5";
const VERSION_DESKTOP = "0.1.0";
const EASE = [0.22, 1, 0.36, 1] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Primitives

function FadeIn({
  children,
  delay = 0,
  y = 16,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
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

// Persistent theme toggle. Defaults to dark; honors system preference on
// first visit only. Survives reload via localStorage.
type Theme = "dark" | "light";
const LS_THEME = "prevail.site.theme";

function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    const saved = localStorage.getItem(LS_THEME) as Theme | null;
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia?.("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
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

// Custom MCP server logo — Model Context Protocol uses a stylized
// 'M' or hexagon-grid mark. The official protocol mark isn't on
// simple-icons yet, so we render a small stylized version that reads
// as "connected nodes" — the spirit of MCP.
function McpIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="5" r="2" />
      <circle cx="5" cy="18" r="2" />
      <circle cx="19" cy="18" r="2" />
      <path d="M12 7v3M10.5 11.5L7 16M13.5 11.5L17 16" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

// Paperclip AI brand mark — stylized double-clip suggesting 30 agents
// attached to one knowledge layer. No public SVG exists for the user's
// internal Paperclip product, so this is a custom stylized mark.
function PaperclipBrand({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 7v9.5a4.5 4.5 0 0 1-9 0V6.5a3 3 0 0 1 6 0V15a1.5 1.5 0 0 1-3 0V8" />
      <circle cx="5" cy="5" r="1" fill="currentColor" stroke="none" />
      <circle cx="19" cy="5" r="1" fill="currentColor" stroke="none" />
      <circle cx="5" cy="19" r="1" fill="currentColor" stroke="none" />
      <circle cx="19" cy="19" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Hermes brand mark — winged messenger ('H' with wings). References
// the greek messenger god the user's Hermes agent is named after.
function HermesBrand({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* Wings — angled lines on each side */}
      <path d="M3 7l3 1M3 10l3 0M3 13l3-1" />
      <path d="M21 7l-3 1M21 10l-3 0M21 13l-3-1" />
      {/* H letterform — center stem */}
      <path d="M9 6v13M15 6v13M9 12h6" strokeWidth="2.2" />
      {/* Helm dot at top */}
      <circle cx="12" cy="4" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Multica brand mark — two stacked M's suggesting multi-machine. Two
// overlapping displays.
function MulticaBrand({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* Back machine */}
      <rect x="3" y="3" width="14" height="10" rx="1.5" />
      <path d="M6 16h8M10 13v3" />
      {/* Front machine (offset) */}
      <rect x="7" y="9" width="14" height="10" rx="1.5" fill="var(--color-surface-0)" />
      <path d="M10 22h8M14 19v3" />
    </svg>
  );
}

// Reusable model-logo row — actual brand logos in their official colors.
// Used to anchor "the best reasoning models" claims visually.
const COUNCIL_MODELS = [
  { name: "Claude", icon: siClaude, color: "#cc785c" },
  { name: "Gemini", icon: siGooglegemini, color: "#4285F4" },
  { name: "OpenAI", custom: "openai" as const, color: "#10a37f" },
  { name: "Llama", icon: siMeta, color: "#0866FF" },
  { name: "Ollama", icon: siOllama, color: "#a3a3a3" },
  { name: "Mistral", icon: siMistralai, color: "#FF7000" },
  { name: "DeepSeek", icon: siDeepseek, color: "#4D6BFE" },
];

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

function ModelLogoRow({ size = "md" }: { size?: "sm" | "md" }) {
  const dim = size === "sm" ? "h-6 w-6" : "h-8 w-8";
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
      {COUNCIL_MODELS.map((m) => (
        <div
          key={m.name}
          title={m.name}
          className="flex flex-col items-center gap-1.5 text-text-mute transition-colors hover:text-text"
        >
          <div className={dim} style={{ color: m.color }}>
            {m.custom === "openai" ? (
              <OpenAIMark className="h-full w-full" />
            ) : m.icon ? (
              <SimpleIcon icon={m.icon} className="h-full w-full" />
            ) : null}
          </div>
          <span className="text-[10px] uppercase tracking-wider">{m.name}</span>
        </div>
      ))}
    </div>
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
    fetch("https://api.github.com/repos/fru-dev3/prevail")
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
      href={GITHUB_CLI}
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
        {stars !== null ? formatStars(stars) : "—"}
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
          <a href="#council" className="hover:text-text">Council</a>
          <a href="#benchmark" className="hover:text-text">Benchmark</a>
          <a href="#lenses" className="hover:text-text">Lenses</a>
          <a href="#ecosystem" className="hover:text-text">Ecosystem</a>
          <a href="#install" className="hover:text-text">Install</a>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border-soft text-text-soft hover:bg-surface-1 hover:text-text"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <GitHubStarButton />
          <a
            href={DMG_URL}
            className="inline-flex items-center gap-1.5 rounded-md bg-gold px-4 py-1.5 text-sm font-medium text-bg transition-all hover:bg-gold-bright hover:-translate-y-0.5"
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

// Brand monogram — gold ◈ with cyan dot in the center
function Logo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path
        d="M16 2 L30 16 L16 30 L2 16 Z"
        stroke="#c4a35a"
        strokeWidth="2"
        fill="rgba(196, 163, 90, 0.06)"
      />
      <circle cx="16" cy="16" r="3.5" fill="#5fbfff" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO

function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-12 md:pt-24 md:pb-16 grain">
      <div className="glow-gold absolute inset-0 -z-10" />
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-12 xl:gap-16">
          {/* LEFT — text */}
          <div>
            <FadeIn>
              <a
                href={GITHUB_DESKTOP}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 rounded-full border border-border bg-surface-0 py-1 pl-1 pr-4 text-xs"
              >
                <span className="rounded-full bg-gold px-2 py-0.5 font-medium text-bg">
                  New
                </span>
                <span className="text-text-soft">
                  Desktop v{VERSION_DESKTOP} & CLI v{VERSION_CLI} both available
                </span>
                <ArrowRight className="h-3 w-3 text-text-mute transition-transform group-hover:translate-x-0.5" />
              </a>
            </FadeIn>

            <FadeIn delay={0.05}>
              <h1 className="mt-6 text-4xl font-semibold tracking-[-0.02em] md:text-5xl lg:text-6xl xl:text-[68px] xl:leading-[1.05]">
                A{" "}
                <span className="font-serif italic text-gold">
                  Council of <span className="text-ai">AI</span>
                </span>
                <br />
                for your hard questions.
              </h1>
            </FadeIn>

            <FadeIn delay={0.12}>
              <p className="mt-6 max-w-xl text-base text-text-soft md:text-lg">
                <Brand /> sends every hard question to{" "}
                <span className="text-text">Claude</span>,{" "}
                <span className="text-text">Codex</span>,{" "}
                <span className="text-text">Antigravity</span>, and{" "}
                <span className="text-text">Ollama</span> at once. A chair
                model reads all their answers and writes one clear verdict.
              </p>
            </FadeIn>

            <FadeIn delay={0.18}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href={DMG_URL}
                  className="inline-flex items-center gap-2 rounded-md bg-gold px-5 py-2.5 text-sm font-medium text-bg transition-all hover:bg-gold-bright hover:-translate-y-0.5"
                  style={{ boxShadow: "0 6px 32px rgba(196, 163, 90, 0.3)" }}
                >
                  <Folder className="h-4 w-4" />
                  Download for Mac
                </a>
                <a
                  href="#install"
                  className="inline-flex items-center gap-2 rounded-md border border-border-strong bg-surface-1 px-5 py-2.5 text-sm font-medium hover:bg-surface-2"
                >
                  <Terminal className="h-4 w-4" />
                  Install CLI
                </a>
                <GitHubStarButton size="lg" />
              </div>
            </FadeIn>

            {/* small trust row */}
            <FadeIn delay={0.24}>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-text-mute">
                <span><span className="text-gold">✓</span> Free, MIT</span>
                <span><span className="text-gold">✓</span> Local-first</span>
                <span><span className="text-gold">✓</span> Works with Claude, Codex, Gemini, Ollama</span>
              </div>
            </FadeIn>
          </div>

          {/* RIGHT — slider */}
          <FadeIn delay={0.28} y={20}>
            <HeroSlider />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// Slider that toggles between the Desktop app mockup and the CLI mockup.
// Auto-rotates every 7s; clicking a tab pauses rotation.
function HeroSlider() {
  const [active, setActive] = useState<"desktop" | "cli">("desktop");
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => {
      setActive((a) => (a === "desktop" ? "cli" : "desktop"));
    }, 7000);
    return () => clearTimeout(t);
  }, [active, paused]);

  return (
    <div>
      {/* Tab pill */}
      <div className="mb-5 flex items-center justify-center">
        <div className="flex items-center gap-1 rounded-full border border-border-soft bg-surface-0 p-1 text-sm">
          {(["desktop", "cli"] as const).map((id) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                onClick={() => {
                  setActive(id);
                  setPaused(true);
                }}
                className={`relative inline-flex items-center gap-2 rounded-full px-5 py-1.5 font-medium transition-colors ${
                  isActive ? "text-bg" : "text-text-soft hover:text-text"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="slider-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-gold"
                    transition={{ type: "spring", stiffness: 360, damping: 32 }}
                  />
                )}
                {id === "desktop" ? (
                  <Folder className="h-3.5 w-3.5" />
                ) : (
                  <Terminal className="h-3.5 w-3.5" />
                )}
                {id === "desktop" ? "Desktop app" : "Terminal CLI"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Swap content with crossfade. Container is height-locked so the
          hero never jumps when the user (or the auto-rotate) toggles
          tabs — both Desktop and CLI mocks share the same canvas size. */}
      <div className="relative h-[480px] sm:h-[520px] md:h-[560px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="absolute inset-0"
          >
            {active === "desktop" ? <DesktopAppMock /> : <CliMock />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="mt-5 flex items-center justify-center gap-2">
        {(["desktop", "cli"] as const).map((id) => (
          <button
            key={id}
            onClick={() => {
              setActive(id);
              setPaused(true);
            }}
            aria-label={`Show ${id}`}
            className={`h-1.5 rounded-full transition-all ${
              active === id ? "w-6 bg-gold" : "w-1.5 bg-border-strong hover:bg-text-mute"
            }`}
          />
        ))}
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

        {/* main pane */}
        <div className="flex flex-col bg-bg">
          {/* tab bar */}
          <div className="flex items-center gap-1 border-b border-border-soft px-4">
            <button className="relative -mb-px flex items-center gap-2 px-3 py-2.5 text-xs text-gold">
              <MessageSquare className="h-3 w-3" /> Chat
              <span className="absolute bottom-0 left-0 right-0 h-px bg-gold" />
            </button>
            <button className="flex items-center gap-2 px-3 py-2.5 text-xs text-text-mute">
              <Scale className="h-3 w-3" /> Council
            </button>
            <button className="flex items-center gap-2 px-3 py-2.5 text-xs text-text-mute">
              <Sparkles className="h-3 w-3" /> Benchmark
            </button>
          </div>

          {/* messages */}
          <div className="space-y-4 px-5 py-5 text-[12px]">
            {/* User message */}
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-lg border border-border bg-surface-1 px-3 py-2">
                Should I prepay the mortgage or invest the delta?
              </div>
            </div>

            {/* Assistant block */}
            <div>
              <div className="mb-1.5 flex items-center gap-2 font-mono text-[10px] text-text-mute">
                <span className="text-gold">◇</span>
                <span className="text-gold">claude</span>
                <span className="text-ok">✓ done</span>
              </div>
              <div className="leading-relaxed text-text">
                At a 6.2% APR and a 22-year horizon, investing the delta in low-cost
                index funds dominates after-tax. Three caveats: keep an emergency
                fund first, then split 60/40 toward investment, and revisit the math
                each annual review.
                <span className="blink text-gold">▌</span>
              </div>
            </div>
          </div>

          {/* composer */}
          <div className="mt-auto border-t border-border-soft p-4">
            <div className="flex items-center gap-2 rounded-md border border-border bg-surface-0 p-2.5 text-[11px] text-text-mute">
              <span>ask anything · cmd+enter to send</span>
              <div className="ml-auto flex items-center gap-1.5 rounded bg-gold px-2 py-0.5 text-bg">
                <span>send</span>
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
// Full 7-row ASCII PREVAIL wordmark — byte-for-byte identical to the TUI's
// banner in src/branding.tsx. PREV + L in gold, AI in cyan.

const G: Record<string, string[]> = {
  P: ["██████╗   ", "██╔══██╗  ", "██████╔╝  ", "██╔═══╝   ", "██║       ", "██║       ", "╚═╝       "],
  R: ["██████╗   ", "██╔══██╗  ", "██████╔╝  ", "██╔══██╗  ", "██║  ██║  ", "██║  ██║  ", "╚═╝  ╚═╝  "],
  E: ["███████╗  ", "██╔════╝  ", "█████╗    ", "██╔══╝    ", "██║       ", "███████╗  ", "╚══════╝  "],
  V: ["██╗   ██╗ ", "██║   ██║ ", "██║   ██║ ", "╚██╗ ██╔╝ ", " ╚████╔╝  ", "  ╚██╔╝   ", "   ╚═╝    "],
  A: ["  █████╗  ", " ██╔══██╗ ", " ███████╗ ", " ██╔══██║ ", " ██║  ██║ ", " ██║  ██║ ", " ╚═╝  ╚═╝ "],
  I: ["██████╗   ", "╚═██╔═╝   ", "  ██║     ", "  ██║     ", "  ██║     ", "██████╗   ", "╚═════╝   "],
  L: ["██╗       ", "██║       ", "██║       ", "██║       ", "██║       ", "███████╗  ", "╚══════╝  "],
};
const compose = (letters: string[]) =>
  Array.from({ length: 7 }, (_, r) => letters.map((l) => G[l]![r]).join(" "));
const PREVAIL_PREV = compose(["P", "R", "E", "V"]);
const PREVAIL_AI = compose(["A", "I"]);
const PREVAIL_L = compose(["L"]);

function AsciiPrevail({ size = "sm" }: { size?: "xs" | "sm" | "md" }) {
  const fontSize = size === "xs" ? 5 : size === "sm" ? 6 : 8;
  return (
    <div
      className="flex font-mono"
      aria-label="Prevail"
      style={{ fontSize: `${fontSize}px`, lineHeight: 1.05 }}
    >
      <pre className="text-gold">{PREVAIL_PREV.join("\n")}</pre>
      <pre className="text-ai pl-[2px]">{PREVAIL_AI.join("\n")}</pre>
      <pre className="text-gold pl-[2px]">{PREVAIL_L.join("\n")}</pre>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CLI / TUI mockup — shown when the user toggles the slider to "Terminal CLI"
// Replicates the actual TUI cockpit: full banner, sidebar, workspace tabs,
// chat with mid-council streaming, status footer.

function CliMock() {
  return (
    <WindowChrome title="iTerm — prevail" fillParent>
      <div className="flex h-full flex-col overflow-hidden bg-bg p-3 font-mono text-[9px] leading-[1.35] md:p-4 md:text-[10px]">
        {/* === BANNER === tight 5-row replica */}
        <div className="shrink-0 border-b border-gold/40 pb-2">
          <div className="flex items-start gap-3">
            <div className="hidden shrink-0 md:block">
              <AsciiPrevail size="xs" />
            </div>
            <div className="hidden h-[44px] w-px shrink-0 bg-border md:block" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gold">
                  THU, JUN 5 · 2026
                </span>
                <span className="text-text-mute">
                  <span className="text-text">20</span>d ·{" "}
                  <span className="text-text">19</span>a ·{" "}
                  <span className="text-warn">65</span>o
                </span>
              </div>
              <div className="mt-0.5 truncate text-text-mute">
                07:48 · prevail v{VERSION_CLI}
              </div>
              <div className="mt-0.5">
                <span className="text-gold">⚖ Council:</span>
                <span className="text-text">ON</span>{" "}
                <span className="text-gold">◆ F:</span>
                <span className="text-text">BLUF</span>{" "}
                <span className="text-gold">◇ L:</span>
                <span className="text-text">FIRST</span>
              </div>
              <div className="mt-0.5">
                <span className="text-text-mute">cli</span>{" "}
                <span style={{ color: "#6ee787" }}>✓ Claude</span>{" "}
                <span style={{ color: "#6ee787" }}>✓ Codex</span>{" "}
                <span style={{ color: "#6ee787" }}>✓ Agy</span>{" "}
                <span style={{ color: "#f0c674" }}>! Ollama</span>
              </div>
            </div>
          </div>
        </div>

        {/* === BODY === sidebar + workspace — fills remaining height */}
        <div className="mt-2 grid min-h-0 flex-1 grid-cols-[88px_1fr] gap-3 md:grid-cols-[110px_1fr]">
          {/* SIDEBAR — trimmed to 7 visible domains */}
          <div className="min-h-0 overflow-hidden">
            <div className="text-[8px] font-medium text-gold">
              DOMAINS · 20 ●
            </div>
            <div className="mt-1.5 space-y-[1px]">
              {[
                { d: "chief", g: "◆", active: true },
                { d: "vision", g: "★" },
                { d: "wealth", g: "¤" },
                { d: "health", g: "♥" },
                { d: "tax", g: "§" },
                { d: "career", g: "▲" },
                { d: "business", g: "◈" },
              ].map((row) => (
                <div
                  key={row.d}
                  className={row.active ? "text-text" : "text-text-mute"}
                >
                  <span className={row.active ? "text-gold" : ""}>
                    {row.active ? "›" : " "}
                  </span>{" "}
                  <span className={row.active ? "text-gold" : ""}>{row.g}</span>{" "}
                  {row.d}
                </div>
              ))}
            </div>
          </div>

          {/* WORKSPACE PANE */}
          <div className="flex min-h-0 flex-col overflow-hidden rounded border border-border-soft p-2.5">
            <div className="text-gold">chief</div>
            <div className="mt-1 text-text-mute">
              <span className="rounded border border-gold-border bg-gold-soft px-1 py-0.5 text-gold">
                [chat]
              </span>
              {" "}· state · prompts · skills
            </div>

            <div className="mt-2.5">
              <span className="text-gold">▸</span>{" "}
              <span className="text-text">
                /council should I prepay the mortgage?
              </span>
            </div>
            <div className="mt-1 text-text-soft">
              <span className="pulse-soft text-gold">◆</span> convening ·{" "}
              <span style={{ color: "#c4a35a" }}>claude</span> ·{" "}
              <span style={{ color: "#5fbfff" }}>codex</span> ·{" "}
              <span style={{ color: "#6ee787" }}>agy</span> ·{" "}
              <span style={{ color: "#c4a8ff" }}>ollama</span>
            </div>

            <div className="mt-2 rounded border-l-2 border-gold pl-2">
              <div className="text-[8px] uppercase tracking-wider text-gold">
                ▸ Disagreement
              </div>
              <div className="mt-0.5 text-text-soft">
                3/4 favor invest; Ollama anchors on guaranteed return.
              </div>
            </div>

            <div className="mt-2 rounded border border-gold-border bg-gold-soft p-2">
              <div className="text-[8px] uppercase tracking-wider text-gold">
                ◆ Verdict · by Claude
              </div>
              <div className="mt-0.5 text-text">
                Invest 60% in tax-advantaged index funds. Prepay 40%
                quarterly. Revisit annually.
                <span className="blink text-gold">▌</span>
              </div>
            </div>

            <div className="mt-auto pt-2">
              <div className="rounded border border-border bg-bg p-1.5">
                <span className="text-gold">›</span>{" "}
                <span className="text-text-mute">
                  ask anything · enter sends
                </span>
                <span className="blink ml-1 text-gold">▌</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 shrink-0 border-t border-border-soft pt-1.5 text-text-mute">
          <span className="text-gold">[n]</span> new ·{" "}
          <span className="text-gold">[c]</span> chat ·{" "}
          <span className="text-gold">[e]</span> edit ·{" "}
          <span className="text-gold">[r]</span> refresh ·{" "}
          <span className="text-gold">[q]</span> quit
        </div>
      </div>
    </WindowChrome>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HARD QUESTIONS — the "why this matters" section
// One agent isn't enough. Generic benchmarks don't grade your life.

const HARD_QUESTIONS = [
  {
    domain: "Wealth",
    glyph: "¤",
    color: "#c4a35a",
    q: "Should I prepay the mortgage or invest the delta?",
    edge: "Tax-bracket sensitivity. Horizon math. The wrong default kills six figures.",
  },
  {
    domain: "Career",
    glyph: "▲",
    color: "#5fbfff",
    q: "Take the Series B offer or stay where I am?",
    edge: "Equity dilution model + comp ladder + 5-year founder bet, weighed against vested RSUs.",
  },
  {
    domain: "Health",
    glyph: "♥",
    color: "#6ee787",
    q: "Lab panel just landed. What do I act on first?",
    edge: "Signal vs noise across 47 markers. Most important: which yellow flags are downstream of one upstream cause.",
  },
  {
    domain: "Tax",
    glyph: "§",
    color: "#f0c674",
    q: "Roth conversion this year — does the IRMAA cliff bite?",
    edge: "Sub-clause traps most general advice misses. The math says yes, the policy edge says wait.",
  },
  {
    domain: "Family",
    glyph: "♥",
    color: "#ffb38a",
    q: "Sister's wedding back home — contribute $40k?",
    edge: "Western individualist advice flattens this. Real answer respects obligation and protects you.",
  },
  {
    domain: "Estate",
    glyph: "⌂",
    color: "#c4a8ff",
    q: "Term life vs whole life for my situation?",
    edge: "The product pitch is wrong 80% of the time. The right answer depends on your dependents and runway.",
  },
];

function HardQuestionsSection() {
  return (
    <section className="relative border-t border-border-soft py-24 md:py-32 grain">
      <div className="glow-ai absolute inset-0 -z-10 opacity-30" />
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-ai">
              Why one model isn't enough
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.02em] md:text-5xl">
              Your life doesn't fit{" "}
              <span className="font-serif italic text-text-soft">a benchmark.</span>
            </h2>
            <p className="mt-6 text-lg text-text-soft">
              MMLU. HumanEval. GSM8K. Useful — for someone else. None of them
              grade the questions you actually wrestle with. Real decisions are
              tax-coded, family-coded, body-coded, time-coded. One model gives
              you one frame. You need four — and a chair to call it.
            </p>
          </div>
        </FadeIn>

        {/* Three-column reasoning */}
        <FadeIn delay={0.1}>
          <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "One model is one frame",
                d: "Even the best frontier model has blind spots. You only see them when a second model disagrees.",
              },
              {
                n: "02",
                t: "Generic benchmarks miss you",
                d: "MMLU doesn't know your tax bracket. HumanEval doesn't know your dependents. Your benchmark must be yours.",
              },
              {
                n: "03",
                t: "Decisions compound",
                d: "Get the mortgage call right, the tax call right, the career call right — and 20 years compound.",
              },
            ].map((c) => (
              <div key={c.n} className="rounded-xl border border-border-soft bg-surface-0 p-6">
                <div className="font-mono text-xs text-gold">{c.n}</div>
                <div className="mt-3 font-semibold">{c.t}</div>
                <p className="mt-2 text-sm text-text-soft">{c.d}</p>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Hard question list */}
        <FadeIn delay={0.2}>
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="mb-6 text-center text-xs uppercase tracking-[0.2em] text-text-mute">
              <span className="text-gold">◇</span> Questions <Brand /> was built for
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {HARD_QUESTIONS.map((q, i) => (
                <FadeIn key={q.q} delay={0.05 * i}>
                  <div className="group relative h-full overflow-hidden rounded-xl border border-border-soft bg-surface-0 p-5 transition-all hover:border-border hover:bg-surface-1">
                    <div className="flex items-start gap-4">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-base"
                        style={{ backgroundColor: `${q.color}18`, color: q.color }}
                      >
                        {q.glyph}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-mute">
                          {q.domain}
                        </div>
                        <div className="mt-1.5 font-medium text-text">{q.q}</div>
                        <div className="mt-2 text-xs text-text-soft">
                          <span className="text-gold">▸</span> {q.edge}
                        </div>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Closing pitch */}
        <FadeIn delay={0.4}>
          <div className="mx-auto mt-16 max-w-4xl rounded-2xl border border-gold-border bg-gradient-to-br from-gold-soft to-transparent p-8 text-center md:p-12">
            {/* Real model logos — the "best reasoning models" */}
            <ModelLogoRow />

            <p className="mt-10 text-xl font-medium leading-relaxed md:text-2xl">
              Imagine the best reasoning models on the planet,{" "}
              <span className="text-gold">around one table</span>, working{" "}
              <span className="text-gold">your hardest question</span> together.
            </p>
            <p className="mt-4 text-text-soft">
              That's what <Brand /> is. A council of AI for the rest of your life.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#install"
                className="inline-flex items-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-medium text-bg transition-all hover:bg-gold-bright hover:-translate-y-0.5"
                style={{ boxShadow: "0 6px 32px rgba(196, 163, 90, 0.3)" }}
              >
                Convene the council
                <ArrowRight className="h-4 w-4" />
              </a>
              <GitHubStarButton size="lg" />
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGO BAR — gentle social proof / "what you use it with"

function LogoBar() {
  const items = [
    { label: "Claude", color: "#c4a35a" },
    { label: "Codex", color: "#5fbfff" },
    { label: "Antigravity", color: "#6ee787" },
    { label: "Ollama", color: "#c4a8ff" },
    { label: "MCP", color: "#f0c674" },
    { label: "Tailscale", color: "#88d0ff" },
  ];
  return (
    <section className="border-y border-border-soft bg-surface-0/30 py-10">
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-6 text-center text-xs uppercase tracking-[0.2em] text-text-mute">
          Plays with the tools you already use
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-text-soft">
          {items.map((it) => (
            <div key={it.label} className="flex items-center gap-2 text-sm font-medium">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: it.color }}
              />
              {it.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE SECTION — reusable, alternating layout

function FeatureSection({
  eyebrow,
  title,
  description,
  bullets,
  mockup,
  reverse = false,
  glow = "gold",
  id,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  bullets?: string[];
  mockup: ReactNode;
  reverse?: boolean;
  glow?: "gold" | "ai" | "none";
  id?: string;
}) {
  return (
    <section id={id} className="relative border-t border-border-soft py-24 md:py-32">
      {glow === "gold" && (
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="glow-gold absolute inset-0 opacity-40" />
        </div>
      )}
      {glow === "ai" && (
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="glow-ai absolute inset-0 opacity-40" />
        </div>
      )}
      <div className="mx-auto max-w-6xl px-6">
        <div
          className={`grid gap-16 md:gap-20 lg:grid-cols-2 lg:items-center ${
            reverse ? "" : ""
          }`}
        >
          <FadeIn>
            <div className={reverse ? "lg:order-2" : ""}>
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-gold">
                {eyebrow}
              </div>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.02em] md:text-5xl">
                {title}
              </h2>
              <p className="mt-6 text-lg text-text-soft">{description}</p>
              {bullets && (
                <ul className="mt-8 space-y-3">
                  {bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-text-soft">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </FadeIn>
          <FadeIn delay={0.1} y={30}>
            <div className={reverse ? "lg:order-1" : ""}>{mockup}</div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COUNCIL MOCK — fan-out + verdict, 4 panelist replies streaming

function CouncilMock() {
  return (
    <WindowChrome title="Prevail · /council">
      <div className="space-y-3 bg-surface-0 p-5">
        <div className="rounded-md bg-surface-1 px-3 py-2 font-mono text-[11px] text-text-soft">
          <span className="text-gold">$</span> council should I prepay the mortgage?
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {[
            { name: "claude", color: "#c4a35a", text: "Invest. Rate < return.", done: true },
            { name: "codex", color: "#5fbfff", text: "Invest. Tax-deferred wins.", done: true },
            { name: "agy", color: "#6ee787", text: "Split. 60 / 40.", done: true },
            { name: "ollama", color: "#c4a8ff", text: "Prepay. Guaranteed 6.2%.", done: false },
          ].map((p) => (
            <div
              key={p.name}
              className="overflow-hidden rounded-lg border border-border bg-surface-1"
            >
              <div className="flex items-center justify-between border-b border-border-soft bg-surface-2 px-3 py-1.5 font-mono text-[10px]">
                <span style={{ color: p.color }}>◇ {p.name}</span>
                {p.done ? (
                  <span className="text-ok">✓</span>
                ) : (
                  <span className="pulse-soft text-gold">stream</span>
                )}
              </div>
              <div className="px-3 py-2 text-[11px] text-text-soft">{p.text}</div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-gold-border bg-gold-soft p-4">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em] text-gold">
            <span>◆</span> Verdict · synthesized by claude
          </div>
          <div className="mt-2 text-[11px] text-text">
            Invest 60% in tax-advantaged index funds. Prepay 40% quarterly. Revisit
            annually.
          </div>
        </div>
      </div>
    </WindowChrome>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BENCHMARK MOCK — leaderboard

function BenchmarkMock() {
  const rows = [
    ["9.7", "46%", "opus-4-7", true],
    ["9.6", "42%", "opus-4-6", false],
    ["9.5", "48%", "sonnet-4-6", false],
    ["8.3", "34%", "haiku", false],
    ["7.1", "31%", "gpt-5.4", false],
    ["6.8", "27%", "gemini-3.1", false],
  ] as const;
  return (
    <WindowChrome title="Prevail · benchmark">
      <div className="bg-surface-0 p-5">
        <div className="mb-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.15em] text-text-mute">
          <span>
            <span className="text-gold">◈</span> Leaderboard
          </span>
          <span>21 questions · 8 dimensions</span>
        </div>
        <div className="grid grid-cols-[60px_60px_1fr] gap-3 px-2 pb-2 font-mono text-[9px] uppercase tracking-wider text-text-mute">
          <span>judge</span>
          <span>kw</span>
          <span>model</span>
        </div>
        <div className="space-y-0.5">
          {rows.map(([j, k, m, top]) => (
            <div
              key={m}
              className={`grid grid-cols-[60px_60px_1fr] gap-3 rounded px-2 py-2 font-mono text-[11px] ${
                top ? "bg-gold-soft" : ""
              }`}
            >
              <span className={top ? "text-gold" : "text-text-soft"}>{j}</span>
              <span className="text-text-mute">{k}</span>
              <span className="text-text">
                {top && <span className="mr-1.5 text-gold">▸</span>}
                {m}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-md border border-border bg-surface-1 px-3 py-2.5 font-mono text-[10px] text-text-soft">
          <span className="text-gold">$</span> prevail bench seed --from-log wealth
        </div>
      </div>
    </WindowChrome>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VAULT MOCK — folder tree

function VaultMock() {
  const tree = [
    { d: 0, n: "vault/", g: "◆" },
    { d: 1, n: "chief/", g: "◆" },
    { d: 2, n: "state.md", g: "·" },
    { d: 2, n: "_log/", g: "·" },
    { d: 1, n: "wealth/", g: "◆" },
    { d: 2, n: "state.md", g: "·" },
    { d: 2, n: "decisions.md", g: "·" },
    { d: 2, n: "_log/2026-06-04.md", g: "·" },
    { d: 1, n: "health/", g: "◆" },
    { d: 1, n: "tax/", g: "◆" },
    { d: 1, n: "benchmark/", g: "◈" },
    { d: 2, n: "questions/", g: "·" },
    { d: 2, n: "runs/", g: "·" },
  ];
  return (
    <WindowChrome title="~/Documents/prevail/vault-demo">
      <div className="bg-surface-0 p-5">
        <div className="space-y-0.5 font-mono text-[12px]">
          {tree.map((t, i) => (
            <div
              key={i}
              className="flex items-center gap-2"
              style={{ paddingLeft: `${t.d * 16}px` }}
            >
              <span
                className={
                  t.g === "◆"
                    ? "text-gold"
                    : t.g === "◈"
                      ? "text-ai"
                      : "text-text-mute"
                }
              >
                {t.g}
              </span>
              <span
                className={
                  t.n.endsWith("/") ? "text-text-soft" : "text-text-mute"
                }
              >
                {t.n}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-border-soft pt-4 text-[11px] text-text-soft">
          Every domain is a folder. Every verdict is markdown. Sync with git,
          iCloud, Tailscale — your call.
        </div>
      </div>
    </WindowChrome>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PILLARS — three small cards

function Pillars() {
  return (
    <section className="border-t border-border-soft py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn>
          <p className="text-center text-xs uppercase tracking-[0.2em] text-gold">
            Why <Brand />
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl text-center text-4xl font-semibold tracking-[-0.02em] md:text-5xl">
            The cockpit, <span className="font-serif italic text-text-soft">not the chatbot.</span>
          </h2>
        </FadeIn>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Scale,
              title: "Multi-model by default",
              text: "Stop A/B testing one model at a time. Run them in parallel, see who's right at a glance.",
              color: "#c4a35a",
            },
            {
              icon: Sparkles,
              title: "Graded against your life",
              text: "21 canonical questions ship with the app. Add your own. New models get graded against decisions you've already made.",
              color: "#5fbfff",
            },
            {
              icon: Layers,
              title: "Local-first, forever",
              text: "Your vault is markdown. No database. No cloud. No subscription. Sync however you want.",
              color: "#6ee787",
            },
          ].map((p, i) => {
            const Icon = p.icon;
            return (
              <FadeIn key={p.title} delay={i * 0.06}>
                <div className="group h-full rounded-xl border border-border-soft bg-surface-0 p-7 transition-all hover:border-border hover:bg-surface-1">
                  <div
                    className="inline-flex h-11 w-11 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${p.color}15`, color: p.color }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold">{p.title}</h3>
                  <p className="mt-2 text-text-soft">{p.text}</p>
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

const FRAMEWORKS = [
  { id: "bluf", label: "BLUF", desc: "Lead with the bottom line. Detail after." },
  { id: "win", label: "WIN", desc: "What's Important Now — name the one next move." },
  { id: "scqa", label: "SCQA", desc: "Situation → Complication → Question → Answer." },
  { id: "sbar", label: "SBAR", desc: "Situation, Background, Assessment, Recommendation." },
  { id: "ooda", label: "OODA", desc: "Observe → Orient → Decide → Act." },
  { id: "proscons", label: "PROS/CONS", desc: "Structured trade-off with weight." },
  { id: "steelman", label: "STEELMAN", desc: "Strongest version of the other side first." },
];

function FrameworksSection() {
  const [active, setActive] = useState("bluf");
  return (
    <section className="relative border-t border-border-soft py-24 md:py-32">
      <div className="glow-gold absolute inset-0 -z-10 opacity-30" />
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20 lg:items-center">
          <FadeIn>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">
                Frameworks
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.02em] md:text-5xl">
                Shape every answer{" "}
                <span className="text-text-soft">on purpose.</span>
              </h2>
              <p className="mt-6 text-lg text-text-soft">
                Seven response frameworks change <em>how</em> the model
                structures its reply — without changing the question. Pick one
                globally, or per question. The active framework is prepended
                to every CLI call as a short directive.
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                {FRAMEWORKS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActive(f.id)}
                    className={`rounded-md border px-3 py-1.5 font-mono text-xs font-medium transition-all ${
                      active === f.id
                        ? "border-gold-border bg-gold text-bg"
                        : "border-border-soft bg-surface-0 text-text-soft hover:border-border hover:text-text"
                    }`}
                  >
                    ◆ {f.label}
                  </button>
                ))}
              </div>
              <p className="mt-6 text-sm text-text-soft">
                <span className="text-gold">▸</span>{" "}
                {FRAMEWORKS.find((f) => f.id === active)?.desc}
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <WindowChrome title={`prevail — /framework ${active}`}>
              <div className="space-y-3 bg-surface-0 p-5 font-mono text-[11px]">
                <div className="text-text-mute">
                  <span className="text-gold">$</span> Should I prepay or invest the delta?
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.25 }}
                  >
                    <FrameworkReply id={active} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </WindowChrome>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

function FrameworkReply({ id }: { id: string }) {
  const sample: Record<string, ReactNode> = {
    bluf: (
      <div className="space-y-2 text-text">
        <p className="font-medium text-gold">
          ◆ Invest. Compounding wins at your horizon.
        </p>
        <p className="text-text-soft">
          At 6.2% APR over 22 years, tax-advantaged equities outpace the
          mortgage by ~$160k after-tax. Keep the emergency fund first.
        </p>
      </div>
    ),
    win: (
      <div className="space-y-2 text-text">
        <p className="font-medium text-gold">
          ◆ Move $X into the index fund this month.
        </p>
        <p className="text-text-soft">
          That's the only step that matters this quarter. Defer the
          prepay decision until you re-run this in January.
        </p>
      </div>
    ),
    scqa: (
      <div className="space-y-1.5 text-text">
        <p><span className="text-gold">S:</span> $2k/mo of optional cash.</p>
        <p><span className="text-gold">C:</span> Mortgage at 6.2%, market noisy.</p>
        <p><span className="text-gold">Q:</span> Prepay or invest?</p>
        <p><span className="text-gold">A:</span> Invest. The math at 22yr horizon dominates.</p>
      </div>
    ),
    sbar: (
      <div className="space-y-1.5 text-text">
        <p><span className="text-gold">S:</span> Mortgage rate 6.2%, 22yr left.</p>
        <p><span className="text-gold">B:</span> $2k/mo surplus, no high-interest debt.</p>
        <p><span className="text-gold">A:</span> Compounding beats prepay after-tax.</p>
        <p><span className="text-gold">R:</span> Invest 60%, prepay 40%.</p>
      </div>
    ),
    ooda: (
      <div className="space-y-1.5 text-text">
        <p><span className="text-gold">O</span>bserve · mortgage 6.2%, 22y</p>
        <p><span className="text-gold">O</span>rient · long horizon favors equities</p>
        <p><span className="text-gold">D</span>ecide · 60/40 split</p>
        <p><span className="text-gold">A</span>ct · auto-debit this Friday</p>
      </div>
    ),
    proscons: (
      <div className="grid grid-cols-2 gap-3 text-text">
        <div>
          <div className="text-ok">+ INVEST</div>
          <div className="mt-1 text-[10px] text-text-soft">
            • compounds longer<br />• tax wrapper<br />• liquid
          </div>
        </div>
        <div>
          <div className="text-warn">− PREPAY</div>
          <div className="mt-1 text-[10px] text-text-soft">
            • guaranteed 6.2%<br />• psych anchor<br />• illiquid
          </div>
        </div>
      </div>
    ),
    steelman: (
      <div className="space-y-2 text-text">
        <p className="text-text-soft">
          <span className="text-gold">Strongest case for prepayment:</span>{" "}
          guaranteed 6.2% return, psychological discipline, and no need to
          look at the market for two decades.
        </p>
        <p>
          <span className="text-gold">Yet:</span> compounding in a tax wrapper
          still wins at your horizon. Steelman noted; invest anyway.
        </p>
      </div>
    ),
  };
  return <>{sample[id]}</>;
}

// ─────────────────────────────────────────────────────────────────────────────
// LENSES — different angles of attack. With lens=ALL, every panelist runs
// every lens, then the chair synthesizes across all of them.

const LENSES = [
  { id: "first-principles", label: "FIRST PRINCIPLES", glyph: "◇", color: "#c4a35a" },
  { id: "outsider", label: "OUTSIDER", glyph: "◈", color: "#5fbfff" },
  { id: "contrarian", label: "CONTRARIAN", glyph: "◆", color: "#f0c674" },
  { id: "expansionist", label: "EXPANSIONIST", glyph: "✦", color: "#6ee787" },
  { id: "executor", label: "EXECUTOR", glyph: "▸", color: "#c4a8ff" },
  { id: "alien", label: "ALIEN", glyph: "◉", color: "#88d0ff" },
  { id: "mom", label: "MOM", glyph: "♥", color: "#ffb38a" },
  { id: "dad", label: "DAD", glyph: "▲", color: "#d4b675" },
];

function LensesSection() {
  return (
    <section
      id="lenses"
      className="relative border-t border-border-soft py-24 md:py-32"
    >
      <div className="glow-ai absolute inset-0 -z-10 opacity-40" />
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn>
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-ai">
              Lenses
            </p>
            <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.02em] md:text-5xl">
              Eight angles on{" "}
              <span className="text-text-soft">the same question.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-text-soft">
              A lens forces the model to attack the problem from a specific
              angle — first principles, contrarian, executor, even your mom.
              Switch to <span className="font-mono text-ai">lens = ALL</span> and
              every panelist runs every lens. 4 CLIs × 8 lenses × 1 chair pass.
              Surface the divergence; let the chair synthesize across it.
            </p>
          </div>
        </FadeIn>

        <div className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {LENSES.map((l, i) => (
            <FadeIn key={l.id} delay={i * 0.04}>
              <div
                className="group h-full rounded-xl border border-border-soft bg-surface-0 p-5 transition-all hover:bg-surface-1"
                style={{ borderColor: `${l.color}22` }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-lg"
                    style={{ backgroundColor: `${l.color}18`, color: l.color }}
                  >
                    {l.glyph}
                  </span>
                  <div className="font-mono text-sm font-semibold tracking-wider">
                    {l.label}
                  </div>
                </div>
                <p className="mt-3 text-sm text-text-soft">
                  {lensBlurb(l.id)}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* ALL fan-out highlight */}
        <FadeIn delay={0.3}>
          <div className="mt-12 overflow-hidden rounded-2xl border border-ai/30 bg-gradient-to-br from-surface-0 to-surface-1 p-6 md:p-8">
            <div className="grid gap-8 md:grid-cols-[1fr_1.2fr] md:items-center">
              <div>
                <div className="text-xs font-medium uppercase tracking-[0.2em] text-ai">
                  Fan-out · lens = ALL
                </div>
                <h3 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
                  The full council, every angle.
                </h3>
                <p className="mt-4 text-text-soft">
                  4 CLIs × 8 lenses = 32 panelist calls. One chair pass on top.
                  Expensive — and worth it when the question is load-bearing.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-surface-0 p-4 font-mono text-[11px]">
                <div className="text-text-mute">
                  <span className="text-ai">$</span> /lens all
                </div>
                <div className="mt-2 grid grid-cols-4 gap-1.5 text-[9px]">
                  {["claude", "codex", "agy", "ollama"].map((c, ci) => (
                    <div key={c} className="space-y-0.5">
                      <div
                        className="border-b pb-0.5 text-center font-medium"
                        style={{
                          color: ["#c4a35a", "#5fbfff", "#6ee787", "#c4a8ff"][ci],
                          borderColor: ["#c4a35a", "#5fbfff", "#6ee787", "#c4a8ff"][ci],
                        }}
                      >
                        {c}
                      </div>
                      {LENSES.map((l) => (
                        <div key={l.id} className="text-center text-text-mute">
                          {l.glyph}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="mt-3 border-t border-border-soft pt-2 text-center text-ai">
                  ↓
                </div>
                <div className="mt-2 rounded border border-gold-border bg-gold-soft py-1.5 text-center text-gold">
                  ◆ chair synthesizes
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function lensBlurb(id: string) {
  switch (id) {
    case "first-principles":
      return "Strip the problem to fundamentals. No appeal to precedent.";
    case "outsider":
      return "Challenge the thinking. Ignore prior knowledge.";
    case "contrarian":
      return "Argue the strongest case against the obvious answer.";
    case "expansionist":
      return "What's the bigger version of this question?";
    case "executor":
      return "Skip the framing. What's the literal next step today?";
    case "alien":
      return "An outsider would notice what's obvious to you.";
    case "mom":
      return "Plain English. What would she actually do?";
    case "dad":
      return "Hard-nosed. What's the trap you're not seeing?";
    default:
      return "";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SELF-LEARNING / ECOSYSTEM — combined section
//
// Self-learning: every council verdict logs to the vault. Over time, your
// vault BECOMES the benchmark — new models get graded against you.
// Ecosystem: MCP server, Telegram bridge, OpenClaw, Paperclip, Hermes,
// Multica all share the ~/.ai/ knowledge layer.

function EcosystemSection() {
  // Each item carries either a Lucide component or a custom render.
  // The custom render lets us drop in brand SVGs (Telegram from
  // simple-icons, our custom MCP mark) without forcing them to share
  // Lucide's prop shape.
  const items: Array<{
    title: string;
    desc: string;
    color: string;
    render: (cls: string) => ReactNode;
  }> = [
    {
      title: "Self-learning",
      desc: "Every council verdict, every chat, every distill writes to your vault. Over time, your vault becomes the canonical benchmark — new models get graded against you, not a generic test.",
      color: "#c4a35a",
      render: (cls) => <Brain className={cls} />,
    },
    {
      title: "MCP server built in",
      desc: "Expose your vault to Claude Desktop or any MCP client. Token-auth, parent-process verified, chmod 0600 by default.",
      color: "#5fbfff",
      render: (cls) => <McpIcon className={cls} />,
    },
    {
      title: "Telegram bridge",
      desc: "Chat with your council from any device via OpenClaw. Same vault, same verdicts — just from the lock screen.",
      color: "#229ED9",
      render: (cls) => <SimpleIcon icon={siTelegram} className={cls} />,
    },
    {
      title: "Paperclip · 30 agents",
      desc: "Every domain has a specialist agent that distills, summarizes, and stays current. Daily briefs already wait in your inbox.",
      color: "#a78bfa",
      render: (cls) => <PaperclipBrand className={cls} />,
    },
    {
      title: "Multica · multi-machine",
      desc: "Mac Mini source of truth, MacBook over Tailscale, both writing the same files. Zero sync code.",
      color: "#f0c674",
      render: (cls) => <MulticaBrand className={cls} />,
    },
    {
      title: "Hermes-compatible",
      desc: "Plug Hermes — or any agent that reads ~/.ai/ — into the same knowledge layer. Open by design.",
      color: "#88d0ff",
      render: (cls) => <HermesBrand className={cls} />,
    },
  ];
  return (
    <section
      id="ecosystem"
      className="relative border-t border-border-soft py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn>
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">
              Ecosystem
            </p>
            <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.02em] md:text-5xl">
              Built to live with the rest of{" "}
              <span className="text-text-soft">your agent stack.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-text-soft">
              Prevail is the cockpit; <code className="text-text">~/.ai/</code> is the
              shared knowledge layer. Paperclip, OpenClaw, Multica, Hermes —
              they all read and write the same files. Add yours next.
            </p>
          </div>
        </FadeIn>

        <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <FadeIn key={it.title} delay={i * 0.06}>
              <div className="group relative h-full overflow-hidden rounded-xl border border-border-soft bg-surface-0 p-6 transition-all hover:border-border">
                <div
                  className="absolute inset-x-0 top-0 h-px opacity-0 transition-opacity group-hover:opacity-100"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${it.color}, transparent)`,
                  }}
                />
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${it.color}18`, color: it.color }}
                >
                  {it.render("h-5 w-5")}
                </div>
                <h3 className="mt-5 text-lg font-semibold">{it.title}</h3>
                <p className="mt-2 text-sm text-text-soft">{it.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Shared filesystem hint */}
        <FadeIn delay={0.4}>
          <div className="mt-12 rounded-2xl border border-border-soft bg-surface-0 p-6 font-mono text-xs md:p-8 md:text-sm">
            <div className="mb-3 text-text-mute">
              <span className="text-gold">~/.ai/</span> · the shared knowledge layer
            </div>
            <div className="space-y-0.5 text-text-soft">
              <div>
                <span className="text-gold">├──</span> agents/{" "}
                <span className="text-text-mute"># paperclip writes here</span>
              </div>
              <div>
                <span className="text-gold">├──</span> gateways/openclaw/{" "}
                <span className="text-text-mute"># telegram bridge</span>
              </div>
              <div>
                <span className="text-gold">├──</span> skills/{" "}
                <span className="text-text-mute"># shared by all agents</span>
              </div>
              <div>
                <span className="text-gold">├──</span> mcp/{" "}
                <span className="text-text-mute"># MCP server config</span>
              </div>
              <div>
                <span className="text-gold">├──</span> memory/{" "}
                <span className="text-text-mute"># cross-session state</span>
              </div>
              <div>
                <span className="text-gold">└──</span> context/OMEGA.md{" "}
                <span className="text-text-mute"># everyone reads + writes</span>
              </div>
            </div>
            <div className="mt-4 border-t border-border-soft pt-3 text-text-mute">
              Prevail, Paperclip, OpenClaw, Multica, Hermes — all share these
              files. Bring your own agent next.
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DOWNLOAD / INSTALL section — desktop on left, CLI on right

function DownloadSection() {
  const [copied, setCopied] = useState(false);
  return (
    <section id="install" className="border-t border-border-soft py-24 md:py-32 grain">
      <div className="glow-gold absolute inset-0 -z-10 opacity-50" />
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn>
          <p className="text-center text-xs uppercase tracking-[0.2em] text-gold">
            Get it
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl text-center text-4xl font-semibold tracking-[-0.02em] md:text-5xl">
            Two ways <span className="font-serif italic text-text-soft">to run it.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-center text-lg text-text-soft">
            Native Mac app, or the original terminal cockpit. Same vault, same
            council, same benchmark.
          </p>
        </FadeIn>

        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          {/* Desktop card */}
          <FadeIn delay={0.05}>
            <div
              id="desktop"
              className="group relative h-full overflow-hidden rounded-2xl border border-gold-border bg-gradient-to-br from-surface-1 to-surface-0 p-8"
            >
              <div className="shimmer absolute inset-x-0 top-0 h-px" />
              <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-gold">
                <Folder className="h-4 w-4" />
                Desktop · macOS arm64
              </div>
              <h3 className="mt-5 text-3xl font-bold tracking-tight">
                Prevail.app
              </h3>
              <p className="mt-3 text-text-soft">
                Native Mac app. v{VERSION_DESKTOP}. No terminal required.
                Unsigned for v0.1 — right-click → Open on first launch.
              </p>

              <a
                href={DMG_URL}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-md bg-gold py-3 font-medium text-bg transition-all hover:bg-gold-bright hover:-translate-y-0.5"
                style={{ boxShadow: "0 6px 32px rgba(196, 163, 90, 0.3)" }}
              >
                Download .dmg
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>

              <div className="mt-6 flex items-center justify-between text-xs text-text-mute">
                <span>4.2 MB · Apple Silicon</span>
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

          {/* CLI card */}
          <FadeIn delay={0.12}>
            <div className="h-full overflow-hidden rounded-2xl border border-border bg-surface-0 p-8">
              <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-ai">
                <Terminal className="h-4 w-4" />
                CLI · macOS · linux · WSL
              </div>
              <h3 className="mt-5 text-3xl font-bold tracking-tight">
                <span className="text-ai">$</span> prevail
              </h3>
              <p className="mt-3 text-text-soft">
                The original. Terminal cockpit. v{VERSION_CLI}. Bun + React +
                OpenTUI. Single binary.
              </p>

              <div className="mt-8 flex items-center gap-2 rounded-md border border-border bg-bg p-3 font-mono text-sm">
                <span className="text-ai">$</span>
                <code className="flex-1 truncate text-text">{INSTALL_CMD}</code>
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(INSTALL_CMD);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    } catch {}
                  }}
                  className="rounded border border-border px-2 py-1 text-xs text-text-mute hover:border-ai hover:text-ai"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>

              <div className="mt-6 flex items-center justify-between text-xs text-text-mute">
                <span>Single binary · Bun</span>
                <a
                  href={GITHUB_CLI}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-ai"
                >
                  GitHub →
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
    a: "Every available CLI is asked the same question at once. A chair model reads all the answers and writes a single verdict — plus a panel that surfaces where the panelists disagreed.",
  },
  {
    q: "Does my data leave my Mac?",
    a: "Your vault stays on your machine. Prevail spawns whichever AI CLIs you've already logged into. Want zero network? Set the council to Ollama-only.",
  },
  {
    q: "Which CLIs work?",
    a: "Claude Code, Codex, Antigravity (Google's agy), and Ollama. Auto-detected at startup. Add or remove from any council with one click.",
  },
  {
    q: "Do I have to use the desktop app?",
    a: "No. The CLI works on macOS, Linux, and WSL. Same features, same vault, same benchmark.",
  },
  {
    q: "Is it open source?",
    a: "Yes — MIT. Read every line on GitHub.",
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
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <Logo size={20} />
              <Brand className="text-lg font-semibold" />
            </div>
            <p className="mt-4 max-w-xs text-sm text-text-soft">
              A terminal cockpit and native Mac app for AI council deliberation.
              Local. Open source. MIT.
            </p>
          </div>
          {[
            {
              title: "Product",
              links: [
                ["Desktop (DMG)", DMG_URL],
                ["CLI", GITHUB_CLI],
                ["Changelog", CHANGELOG_CLI],
              ],
            },
            {
              title: "Source",
              links: [
                ["Prevail CLI", GITHUB_CLI],
                ["Prevail desktop", GITHUB_DESKTOP],
                ["Demo vault", "https://github.com/fru-dev3/prevail/tree/main/vault-demo"],
              ],
            },
            {
              title: "Legal",
              links: [
                ["MIT License", "https://github.com/fru-dev3/prevail/blob/main/LICENSE"],
                ["Security", "https://github.com/fru-dev3/prevail/blob/main/SECURITY.md"],
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
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border-soft pt-6 text-xs text-text-mute md:flex-row md:items-center">
          <span>© 2026 fru.dev — built local, shipped open.</span>
          <span>Built with Bun · React · Tauri · OpenTUI</span>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root

export default function App() {
  const [theme, toggleTheme] = useTheme();

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
      <main className="pt-14">
        <Hero />
        <LogoBar />
        <HardQuestionsSection />

        <FeatureSection
          id="council"
          eyebrow="The Council"
          title={
            <>
              Stop asking one model.{" "}
              <span className="text-text-soft">Ask all of them.</span>
            </>
          }
          description="Every hard question fans out to every CLI you have installed. They answer in parallel. A chair model reads all the replies and writes one verdict — with a dedicated panel showing where the panelists disagreed. That's usually where the real decision lives."
          bullets={[
            "Claude, Codex, Antigravity, and Ollama in parallel",
            "Automatic synthesis by the chair model you pick",
            "Disagreement panel surfaces the load-bearing edges",
            "Every verdict logs to dated markdown — searchable forever",
          ]}
          mockup={<CouncilMock />}
        />

        <FeatureSection
          id="benchmark"
          eyebrow="The Benchmark"
          title={
            <>
              Your real decisions.{" "}
              <span className="text-text-soft">Your real benchmark.</span>
            </>
          }
          description="21 canonical questions ship with the app, covering 8 capability dimensions — binary decisions, document analysis, recency, cultural nuance, bias, brevity, complex tax traps, and refusal-to-recommend scenarios. Add your own from real decisions you've already made. New models get graded against your life."
          bullets={[
            "21 starter questions across 8 capability dimensions",
            "Scored two ways: keyword match + LLM-as-judge",
            "Click any leaderboard row to drill into the full reply",
            "Import from your decision log with one command",
          ]}
          mockup={<BenchmarkMock />}
          reverse
          glow="ai"
        />

        <FeatureSection
          eyebrow="The Vault"
          title={
            <>
              No database.{" "}
              <span className="text-text-soft">Just folders.</span>
            </>
          }
          description="Every life domain is a folder. Every verdict is a dated markdown file. Sync with git, iCloud, Tailscale, or nothing. Your data stays where you put it."
          bullets={[
            "Plain markdown — read it without the app",
            "20 starter domains, or bring your own",
            "Works with any sync tool, or none",
            "Version-controllable with git",
          ]}
          mockup={<VaultMock />}
        />

        <FrameworksSection />
        <LensesSection />
        <EcosystemSection />
        <Pillars />
        <DownloadSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
