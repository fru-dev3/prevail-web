import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Check,
  Copy,
  Folder,
  Github,
  Layers,
  MessageSquare,
  Moon,
  Scale,
  Sparkles,
  Sun,
  Terminal,
} from "lucide-react";

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

// Reusable mock window chrome — used in every product mockup
function WindowChrome({
  title,
  children,
  height,
}: {
  title: string;
  children: ReactNode;
  height?: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface-0 shadow-2xl">
      <div className="frost flex items-center gap-2 border-b border-border-soft px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
        <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
        <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
        <span className="ml-3 font-mono text-xs text-text-mute">{title}</span>
      </div>
      <div className={height ?? "h-auto"}>{children}</div>
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
        <div className="hidden items-center gap-7 text-sm text-text-soft md:flex">
          <a href="#council" className="hover:text-text">Council</a>
          <a href="#benchmark" className="hover:text-text">Benchmark</a>
          <a href="#desktop" className="hover:text-text">Desktop</a>
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
          <a
            href={GITHUB_CLI}
            target="_blank"
            rel="noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border-soft text-text-soft hover:bg-surface-1 hover:text-text"
            aria-label="GitHub"
          >
            <Github className="h-4 w-4" />
          </a>
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
    <section className="relative pt-32 pb-24 md:pt-40 md:pb-28 grain">
      <div className="glow-gold absolute inset-0 -z-10" />
      <div className="mx-auto max-w-6xl px-6">
        {/* Eyebrow chip */}
        <FadeIn>
          <div className="flex justify-center">
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
          </div>
        </FadeIn>

        {/* Headline — "A Council of AI for Your Hard Questions" */}
        <FadeIn delay={0.05}>
          <h1 className="mt-10 text-center text-5xl font-bold tracking-tight md:text-7xl lg:text-[88px] lg:leading-[1.02]">
            A{" "}
            <span className="bg-gradient-to-r from-gold via-gold-bright to-gold bg-clip-text text-transparent">
              Council of <span className="text-ai">AI</span>
            </span>
            <br />
            for your hard questions.
          </h1>
        </FadeIn>

        <FadeIn delay={0.12}>
          <p className="mx-auto mt-8 max-w-2xl text-center text-lg text-text-soft md:text-xl">
            <Brand /> sends every hard question to{" "}
            <span className="text-text">Claude</span>,{" "}
            <span className="text-text">Codex</span>,{" "}
            <span className="text-text">Antigravity</span>, and{" "}
            <span className="text-text">Ollama</span> at once. A chair model reads
            all their answers and writes one clear verdict.
          </p>
        </FadeIn>

        <FadeIn delay={0.18}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href={DMG_URL}
              className="inline-flex items-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-medium text-bg transition-all hover:bg-gold-bright hover:-translate-y-0.5"
              style={{ boxShadow: "0 6px 32px rgba(196, 163, 90, 0.3)" }}
            >
              <Folder className="h-4 w-4" />
              Download for Mac
            </a>
            <a
              href="#install"
              className="inline-flex items-center gap-2 rounded-md border border-border-strong bg-surface-1 px-6 py-3 text-sm font-medium hover:bg-surface-2"
            >
              <Terminal className="h-4 w-4" />
              Install CLI
            </a>
          </div>
        </FadeIn>

        {/* HERO MOCK — slider between Desktop and CLI views */}
        <FadeIn delay={0.28} y={40}>
          <div className="mx-auto mt-16 max-w-5xl">
            <HeroSlider />
          </div>
        </FadeIn>
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

      {/* Swap content with crossfade */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: EASE }}
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
    <WindowChrome title="Prevail">
      <div className="grid grid-cols-[180px_1fr] bg-surface-0">
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
    <WindowChrome title="iTerm — prevail">
      <div className="bg-bg p-4 font-mono text-[10px] leading-[1.4] md:p-5 md:text-[11px]">
        {/* === BANNER === full 9-row replica */}
        <div className="border-b border-gold/40 pb-3">
          <div className="flex items-start gap-5">
            {/* Mascot + ASCII PREVAIL */}
            <div className="hidden flex-col items-center text-gold md:flex">
              <div className="text-[8px] text-gold/60">╲ │ ╱</div>
              <div className="text-[9px] font-bold text-gold">─ ◈ ─</div>
              <div className="text-[8px] text-gold/60">╱ │ ╲</div>
              <div className="mt-1 text-[7px] text-text-mute">EST 2026</div>
            </div>
            <div className="hidden md:block">
              <AsciiPrevail size="sm" />
            </div>
            <div className="hidden h-[60px] w-px bg-border md:block" />
            {/* Status column */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gold">
                  THURSDAY, JUNE 5 <span className="text-text-mute">· 2026</span>
                </span>
                <span className="text-text-mute">
                  <span className="text-text">20</span> dom ·{" "}
                  <span className="text-text">19</span> apps ·{" "}
                  <span className="text-warn">65</span> open
                </span>
              </div>
              <div className="mt-0.5 text-text-mute">
                07:48 · prevail v{VERSION_CLI} · opentui
              </div>
              <div className="mt-0.5">
                <span className="text-text-mute">vault</span>{" "}
                <span className="text-text">~/Documents/prevail/vault-demo</span>
              </div>
              <div className="mt-1">
                <span className="text-text-mute">defaults</span>{" "}
                <span className="text-gold">⚖ Council:</span>
                <span className="text-text">ON</span>{" "}
                <span className="ml-1 text-gold">◆ Framework:</span>
                <span className="text-text">BLUF</span>{" "}
                <span className="ml-1 text-gold">◇ Lens:</span>
                <span className="text-text">FIRST</span>
              </div>
              <div className="mt-0.5">
                <span className="text-text-mute">{"        "}</span>
                <span className="text-gold">⬡ Web:</span>
                <span className="text-text">ON</span>
                <span className="ml-3 text-ai">◇ configure</span>
                <span className="ml-2 text-ai">◈ bench</span>
                <span className="ml-2 text-ai">▸ tools</span>
              </div>
              <div className="mt-0.5">
                <span className="text-text-mute">cli</span>{" "}
                <span style={{ color: "#6ee787" }}>✓ Claude</span>{" "}
                <span style={{ color: "#6ee787" }}>✓ Codex</span>{" "}
                <span style={{ color: "#6ee787" }}>✓ Antigravity</span>{" "}
                <span style={{ color: "#f0c674" }}>! Ollama</span>
              </div>
            </div>
          </div>
        </div>

        {/* === BODY === sidebar + workspace */}
        <div className="mt-3 grid grid-cols-[120px_1fr] gap-4 md:grid-cols-[150px_1fr] md:gap-5">
          {/* SIDEBAR */}
          <div>
            <div className="text-[9px] font-medium text-gold">
              LIFE DOMAINS · 20 ●
            </div>
            <div className="mt-2 space-y-[1px]">
              {[
                { d: "chief", g: "◆", c: "10", active: true },
                { d: "vision", g: "★", c: "10" },
                { d: "wealth", g: "¤", c: "14" },
                { d: "health", g: "♥", c: "14" },
                { d: "tax", g: "§", c: "14" },
                { d: "calendar", g: "▦", c: "11" },
                { d: "career", g: "▲", c: "14" },
                { d: "business", g: "◈", c: "11" },
                { d: "estate", g: "⌂", c: "11" },
                { d: "real-estate", g: "⊓", c: "9" },
                { d: "insurance", g: "+", c: "10" },
                { d: "benefits", g: "✚", c: "11" },
                { d: "brand", g: "※", c: "10" },
                { d: "content", g: "¶", c: "11" },
                { d: "social", g: "◯", c: "9" },
              ].map((row) => (
                <div
                  key={row.d}
                  className={`flex items-center justify-between ${
                    row.active ? "text-text" : "text-text-mute"
                  }`}
                >
                  <span>
                    <span className={row.active ? "text-gold" : ""}>
                      {row.active ? "›" : " "}
                    </span>{" "}
                    <span className={row.active ? "text-gold" : ""}>{row.g}</span>{" "}
                    {row.d}
                  </span>
                  <span className="text-text-mute">{row.c}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 border-t border-border-soft pt-2 text-[9px] text-gold">
              + new domain
            </div>
          </div>

          {/* WORKSPACE PANE */}
          <div className="rounded border border-border-soft p-3">
            {/* Workspace title + tabs */}
            <div className="mb-1.5 text-gold">chief</div>
            <div className="text-text-mute">
              <span className="rounded border border-gold-border bg-gold-soft px-1.5 py-0.5 text-gold">
                [chat]
              </span>{" "}
              · state · quick start · prompts · skills{" "}
              <span className="ml-2" style={{ color: "#6ee787" }}>✓ ▸Claude</span>
              <span className="ml-2" style={{ color: "#6ee787" }}>✓ Codex</span>
              <span className="ml-2" style={{ color: "#6ee787" }}>✓ Antigravity</span>
            </div>

            <div className="mt-3 text-text-mute">
              ready · seeded with the active tab
            </div>

            {/* Council in motion */}
            <div className="mt-3">
              <span className="text-gold">▸</span>{" "}
              <span className="text-text">
                /council should I prepay the mortgage or invest the delta?
              </span>
            </div>
            <div className="mt-1.5 text-text-soft">
              <span className="pulse-soft text-gold">◆</span> convening ·{" "}
              <span style={{ color: "#c4a35a" }}>claude</span> ·{" "}
              <span style={{ color: "#5fbfff" }}>codex</span> ·{" "}
              <span style={{ color: "#6ee787" }}>antigravity</span> ·{" "}
              <span style={{ color: "#c4a8ff" }}>ollama</span>
            </div>

            {/* Disagreement panel */}
            <div className="mt-3 rounded border-l-2 border-gold pl-3">
              <div className="text-[9px] uppercase tracking-wider text-gold">
                ▸ Where panelists disagreed
              </div>
              <div className="mt-1 text-text-soft">
                3/4 favor investment; Ollama anchors on guaranteed return.
                Antigravity's split framing is most actionable.
              </div>
            </div>

            {/* Verdict block */}
            <div className="mt-3 rounded border border-gold-border bg-gold-soft p-2.5">
              <div className="text-[9px] uppercase tracking-wider text-gold">
                ◆ Verdict · synthesized by Claude
              </div>
              <div className="mt-1 text-text">
                Invest 60% in tax-advantaged index funds via your tax-deferred
                wrapper. Prepay 40% toward principal each quarter. Revisit
                annually.
                <span className="blink text-gold">▌</span>
              </div>
            </div>

            {/* Stats line */}
            <div className="mt-3 text-text-mute">
              0 msgs · updated today · 185 past chats · /search ·{" "}
              <span className="text-ai">
                ~/Documents/prevail/vault-demo/chief ↗
              </span>
            </div>

            {/* Input row */}
            <div className="mt-3 border-t border-border-soft pt-2">
              <div className="text-text-mute">
                — chat with chief · Claude · esc to return —
              </div>
              <div className="mt-2 rounded border border-border bg-bg p-2">
                <span className="text-gold">›</span>{" "}
                <span className="text-text-mute">
                  ask anything · / for commands · enter sends · esc back
                </span>
                <span className="blink ml-1 text-gold">▌</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer hint */}
        <div className="mt-3 border-t border-border-soft pt-2 text-text-mute">
          <span className="text-gold">[n new]</span> add a domain ·{" "}
          <span className="text-gold">[c chat]</span> talk to claude ·{" "}
          <span className="text-gold">[e edit]</span> open in $EDITOR ·{" "}
          <span className="text-gold">[r refresh]</span> rescan vault ·{" "}
          <span className="text-gold">[q quit]</span> exit
        </div>
      </div>
    </WindowChrome>
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
              <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
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
          <h2 className="mx-auto mt-4 max-w-2xl text-center text-4xl font-bold tracking-tight md:text-5xl">
            The cockpit, not the chatbot.
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
          <h2 className="mx-auto mt-4 max-w-2xl text-center text-4xl font-bold tracking-tight md:text-5xl">
            Two ways to run it.
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
          <h2 className="mt-4 text-center text-4xl font-bold tracking-tight md:text-5xl">
            Quick answers.
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

        <Pillars />
        <DownloadSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
