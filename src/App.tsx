import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { ArrowUpRight, Check, Copy, Github } from "lucide-react";

const GITHUB_URL = "https://github.com/fru-dev3/prevail";
const CHANGELOG_URL = "https://github.com/fru-dev3/prevail/blob/main/CHANGELOG.md";
const RELEASES_URL = "https://github.com/fru-dev3/prevail/releases";
const INSTALL_CMD = "curl -fsSL prevail.sh/install | bash";
const VERSION = "1.6.5";
const EASE = [0.22, 1, 0.36, 1] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Primitives

function FadeIn({ children, delay = 0, y = 12 }: { children: ReactNode; delay?: number; y?: number }) {
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

// Section delimiter: gold horizontal rule + mono bracket label.
function SectionMark({ n, label }: { n: string; label: string }) {
  return (
    <div className="mb-12 flex items-center gap-4">
      <span className="font-mono text-xs text-accent">[ {n} ]</span>
      <div className="h-px flex-1 bg-border" />
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted">{label}</span>
    </div>
  );
}

// Always-renders-as-Prevail brand word with cyan AI letters.
// "Prevail" with the lowercase "ai" letters tinted cyan. Keeping the
// case lowercase reads natural while the color makes the hidden "ai"
// stand out without shouting.
function Brand({ className = "" }: { className?: string }) {
  return (
    <span className={className}>
      Prev<span className="text-ai">ai</span>l
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ASCII PREVAIL — 7-row block letters, byte-for-byte identical to the TUI banner.

const G: Record<string, string[]> = {
  P: ["██████╗   ", "██╔══██╗  ", "██████╔╝  ", "██╔═══╝   ", "██║       ", "██║       ", "╚═╝       "],
  R: ["██████╗   ", "██╔══██╗  ", "██████╔╝  ", "██╔══██╗  ", "██║  ██║  ", "██║  ██║  ", "╚═╝  ╚═╝  "],
  E: ["███████╗  ", "██╔════╝  ", "█████╗    ", "██╔══╝    ", "██║       ", "███████╗  ", "╚══════╝  "],
  V: ["██╗   ██╗ ", "██║   ██║ ", "██║   ██║ ", "╚██╗ ██╔╝ ", " ╚████╔╝  ", "  ╚██╔╝   ", "   ╚═╝    "],
  A: ["  █████╗  ", " ██╔══██╗ ", " ███████╗ ", " ██╔══██║ ", " ██║  ██║ ", " ██║  ██║ ", " ╚═╝  ╚═╝ "],
  I: ["██████╗   ", "╚═██╔═╝   ", "  ██║     ", "  ██║     ", "  ██║     ", "██████╗   ", "╚═════╝   "],
  L: ["██╗       ", "██║       ", "██║       ", "██║       ", "██║       ", "███████╗  ", "╚══════╝  "],
};
const compose = (ls: string[]) =>
  Array.from({ length: 7 }, (_, r) => ls.map((l) => G[l]![r]).join(" "));
const ROWS_PREV = compose(["P", "R", "E", "V"]);
const ROWS_AI = compose(["A", "I"]);
const ROWS_L = compose(["L"]);

function AsciiPrevail({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClass =
    size === "lg"
      ? "text-[9px] sm:text-[12px] md:text-[16px] lg:text-[18px]"
      : size === "sm"
        ? "text-[5px] sm:text-[7px]"
        : "text-[7px] sm:text-[9px] md:text-[11px]";
  return (
    <div className={`flex font-mono leading-[1.05] ${sizeClass}`} aria-label="Prevail">
      <pre className="text-accent">{ROWS_PREV.join("\n")}</pre>
      <pre className="text-ai pl-1">{ROWS_AI.join("\n")}</pre>
      <pre className="text-accent pl-1">{ROWS_L.join("\n")}</pre>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Nav — minimal, monospace, terminal-styled

function Nav() {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 border-b border-border-subtle bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-6 font-mono text-sm">
        <a href="/" className="flex items-center gap-2 text-text-primary">
          <span className="text-accent">◈</span>
          <span>prevail.sh</span>
          <span className="text-text-muted">v{VERSION}</span>
        </a>
        <div className="hidden items-center gap-6 text-text-muted md:flex">
          <a href="#council" className="hover:text-accent">council</a>
          <a href="#bench" className="hover:text-accent">bench</a>
          <a href="#install" className="hover:text-accent">install</a>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-accent">
            <Github className="h-3.5 w-3.5" /> github
          </a>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO — asymmetric, oversized type, terminal-styled
//
// Layout: 12-column grid. Left 7 cols = headline + CTAs. Right 5 cols =
// live-feel terminal pane showing a council in motion. Below: oversized
// ASCII PREVAIL wordmark as the visual anchor (no separate logo image).

function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-12 md:pt-32 md:pb-16">
      {/* radial bloom */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(196, 163, 90, 0.15) 0%, transparent 60%)",
        }}
      />
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          {/* LEFT — manifesto */}
          <div className="lg:col-span-7">
            <FadeIn>
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted">
                <span className="text-accent">◆</span> a terminal cockpit
              </div>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h1 className="mt-6 font-display text-[44px] font-bold leading-[1.02] tracking-tight md:text-[72px] lg:text-[88px]">
                One question.
                <br />
                <span className="text-accent">Four engines.</span>
                <br />
                One verdict.
              </h1>
            </FadeIn>
            <FadeIn delay={0.12}>
              <p className="mt-8 max-w-xl font-mono text-sm leading-relaxed text-text-secondary md:text-base">
                <Brand /> fans every hard question to{" "}
                <span className="text-text-primary">Claude</span>,{" "}
                <span className="text-text-primary">Codex</span>,{" "}
                <span className="text-text-primary">Antigravity</span>, and{" "}
                <span className="text-text-primary">Ollama</span>
                — a chair model writes the verdict.
              </p>
            </FadeIn>

            <FadeIn delay={0.2}>
              <HeroInstallBlock />
            </FadeIn>

            <FadeIn delay={0.28}>
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-text-muted">
                <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-accent">
                  <Github className="h-3.5 w-3.5" /> fru-dev3/prevail
                </a>
                <span>·</span>
                <a href={CHANGELOG_URL} target="_blank" rel="noreferrer" className="hover:text-accent">
                  changelog
                </a>
                <span>·</span>
                <a href="#desktop" className="hover:text-accent">desktop dmg v0.1.0 ↓</a>
                <span>·</span>
                <span>mit licensed</span>
              </div>
            </FadeIn>
          </div>

          {/* RIGHT — live council pane */}
          <div className="lg:col-span-5">
            <FadeIn delay={0.18}>
              <LiveCouncilPane />
            </FadeIn>
          </div>
        </div>

        {/* Oversized ASCII wordmark as visual anchor */}
        <FadeIn delay={0.35}>
          <div className="mt-20 hidden border-t border-border-subtle pt-12 md:block">
            <AsciiPrevail size="lg" />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function HeroInstallBlock() {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-10 max-w-xl">
      <div className="flex items-stretch overflow-hidden rounded border border-border bg-surface font-mono text-sm">
        <span className="flex items-center bg-surface-warm px-3 text-accent">$</span>
        <code className="flex-1 self-center truncate px-3 py-3 text-text-primary">{INSTALL_CMD}</code>
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(INSTALL_CMD);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } catch {}
          }}
          className="flex items-center gap-1.5 border-l border-border bg-surface-warm px-4 text-text-muted transition-colors hover:bg-accent hover:text-background"
          aria-label="Copy install command"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          <span className="text-xs">{copied ? "ok" : "copy"}</span>
        </button>
      </div>
    </div>
  );
}

// Animated mini terminal in the hero — feels alive without being interactive.
function LiveCouncilPane() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const ticks = [1400, 1400, 1800, 2200, 9000];
    const t = setTimeout(() => setPhase((p) => (p + 1) % 5), ticks[phase]);
    return () => clearTimeout(t);
  }, [phase]);
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-2xl">
      {/* chrome */}
      <div className="flex items-center gap-2 border-b border-border-subtle bg-surface-warm px-4 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
        <span className="ml-3 font-mono text-[10px] text-text-muted">~ prevail · chief</span>
      </div>
      {/* body */}
      <div className="space-y-3 px-5 py-5 font-mono text-[11px] leading-relaxed md:text-xs">
        <div className="text-text-muted">
          <span className="text-accent">$</span> council should I prepay the mortgage or invest the delta?
        </div>
        {phase >= 1 && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="text-text-secondary"
          >
            <span className="text-accent pulse-soft">◆</span> convening ·{" "}
            <span className="text-[#c4a35a]">claude</span> ·{" "}
            <span className="text-[#5fbfff]">codex</span> ·{" "}
            <span className="text-[#52c41a]">antigravity</span> ·{" "}
            <span className="text-text-muted">ollama</span>
          </motion.div>
        )}
        {phase >= 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 gap-2 text-[10px]"
          >
            {[
              ["claude", "#c4a35a", "Invest. Rate < expected return."],
              ["codex", "#5fbfff", "Invest. Tax-deferred beats."],
              ["antigravity", "#52c41a", "Split. 60/40 to investments."],
              ["ollama", "#9a8d80", "Prepay. Guaranteed 6.2%."],
            ].map(([name, color, text]) => (
              <div key={name} className="rounded border border-border-subtle p-2">
                <div className="font-medium" style={{ color }}>◇ {name}</div>
                <div className="mt-1 text-text-muted">{text}</div>
              </div>
            ))}
          </motion.div>
        )}
        {phase >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-border-subtle pt-3"
          >
            <div className="text-accent">▸ where panelists disagreed</div>
            <div className="mt-1 text-text-muted">
              3/4 favor investment; Ollama anchors on guaranteed return.
            </div>
          </motion.div>
        )}
        {phase >= 4 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded border border-accent-border bg-accent-soft p-3"
          >
            <div className="text-accent">◆ verdict · synthesized by claude</div>
            <div className="mt-1 text-text-primary">
              Invest 60% via tax-advantaged wrapper. Prepay 40% quarterly. Revisit annually.
              <span className="cursor-blink text-accent">▌</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PILLARS — three big columns, no card chrome

const PILLARS = [
  {
    n: "01",
    glyph: "◆",
    title: "The council",
    line: "Four CLIs answer in parallel. A chair model writes the verdict. A panel surfaces every disagreement.",
  },
  {
    n: "02",
    glyph: "◈",
    title: "The benchmark",
    line: "Twenty-one canonical questions across eight capability dimensions. Your real decisions become your moat.",
  },
  {
    n: "03",
    glyph: "◉",
    title: "The vault",
    line: "Every domain a folder. Every verdict markdown. No database, no cloud, no API key broker.",
  },
];

function Pillars() {
  return (
    <section className="border-t border-border-subtle py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionMark n="01" label="what it is" />
        <div className="grid gap-x-10 gap-y-12 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <FadeIn key={p.n} delay={i * 0.06}>
              <div>
                <div className="flex items-baseline gap-3 font-mono text-xs text-text-muted">
                  <span className="text-accent">{p.n}</span>
                  <span className="h-px w-8 bg-border" />
                </div>
                <div className="mt-6 text-5xl text-accent" aria-hidden>
                  {p.glyph}
                </div>
                <h3 className="mt-4 font-display text-2xl font-semibold">{p.title}</h3>
                <p className="mt-3 text-text-secondary">{p.line}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COUNCIL FLOW DIAGRAM — single bold visual

function CouncilFlow() {
  const panelists = [
    { name: "Claude", color: "#c4a35a", y: 40 },
    { name: "Codex", color: "#5fbfff", y: 100 },
    { name: "Antigravity", color: "#52c41a", y: 160 },
    { name: "Ollama", color: "#9a8d80", y: 220 },
  ];
  return (
    <svg viewBox="0 0 820 280" className="w-full" aria-hidden>
      <defs>
        <linearGradient id="flow-out" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(196, 163, 90, 0.3)" />
          <stop offset="100%" stopColor="rgba(196, 163, 90, 0.95)" />
        </linearGradient>
      </defs>
      {panelists.map((p) => (
        <path
          key={`l-${p.name}`}
          d={`M 220 ${p.y + 18} Q 340 ${p.y + 18}, 410 140`}
          fill="none"
          stroke={p.color}
          strokeOpacity="0.55"
          strokeWidth="1.5"
          strokeDasharray="5 5"
          className="line-flow"
        />
      ))}
      <path d="M 490 140 L 690 140" fill="none" stroke="url(#flow-out)" strokeWidth="3" />
      <polygon points="690,132 712,140 690,148" fill="rgba(196, 163, 90, 0.95)" />
      {panelists.map((p) => (
        <g key={`n-${p.name}`}>
          <rect x="60" y={p.y} width="160" height="36" rx="6" fill="#16161a" stroke={p.color} strokeOpacity="0.7" />
          <text x="80" y={p.y + 23} fontFamily="JetBrains Mono, monospace" fontSize="13" fill={p.color}>
            ◇ {p.name}
          </text>
        </g>
      ))}
      <circle cx="450" cy="140" r="56" fill="#16161a" stroke="#c4a35a" strokeWidth="2.5" />
      <text x="450" y="135" textAnchor="middle" fontFamily="Fraunces, serif" fontSize="15" fontWeight="700" fill="#c4a35a">
        Chair
      </text>
      <text x="450" y="154" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#b6ad99">
        synthesize
      </text>
      <rect x="710" y="92" width="100" height="96" rx="6" fill="#c4a35a" fillOpacity="0.12" stroke="#c4a35a" />
      <text x="760" y="132" textAnchor="middle" fontFamily="Fraunces, serif" fontSize="20" fontWeight="700" fill="#c4a35a">
        ◆
      </text>
      <text x="760" y="158" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#f3eee0">
        Verdict
      </text>
    </svg>
  );
}

function CouncilSection() {
  return (
    <section id="council" className="border-t border-border-subtle py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionMark n="02" label="the council" />
        <FadeIn>
          <h2 className="max-w-2xl font-display text-4xl font-bold tracking-tight md:text-5xl">
            Stop asking one model.
            <br />
            <span className="text-accent">Ask all of them.</span>
          </h2>
        </FadeIn>
        <FadeIn delay={0.12}>
          <div className="mt-16">
            <CouncilFlow />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BENCHMARK — leaderboard as hero, one-line intro

function BenchmarkSection() {
  return (
    <section id="bench" className="border-t border-border-subtle py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionMark n="03" label="the benchmark" />
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <FadeIn>
              <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
                Your decisions become your benchmark.
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="mt-6 text-text-secondary">
                21 canonical questions across 8 dimensions — binary, document, recency, cultural,
                brevity, insufficient-info, bias, tax-trap. Scored two ways: mechanical keyword
                match plus LLM-as-judge with rationale.
              </p>
            </FadeIn>
            <FadeIn delay={0.18}>
              <div className="mt-8 font-mono text-xs text-text-muted">
                <span className="text-accent">$</span> prevail bench seed --from-log wealth
              </div>
              <p className="mt-2 max-w-sm text-sm text-text-muted">
                Import questions from your real decision log. New models get graded against your
                life, not a generic suite.
              </p>
            </FadeIn>
          </div>
          <FadeIn delay={0.1}>
            <div className="md:col-span-7">
              <Leaderboard />
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

function Leaderboard() {
  const rows = [
    ["9.7", "46%", "claude · opus-4-7", true],
    ["9.6", "42%", "claude · opus-4-6", false],
    ["9.5", "48%", "claude · sonnet-4-6", false],
    ["8.3", "34%", "claude · haiku", false],
    ["7.1", "31%", "codex · gpt-5.4", false],
    ["6.8", "27%", "antigravity · gemini-3.1-pro", false],
  ] as const;
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border-subtle bg-surface-warm px-4 py-2 font-mono text-[10px] text-text-muted">
        <span>◈ leaderboard</span>
        <span>21 questions · last run 2026-06-04</span>
      </div>
      <div className="px-2 py-2 font-mono text-sm">
        <div className="grid grid-cols-[64px_64px_1fr] gap-3 px-3 py-2 text-[10px] uppercase tracking-wider text-text-muted">
          <span>judge</span>
          <span>kw</span>
          <span>model</span>
        </div>
        {rows.map(([j, k, model, top]) => (
          <div
            key={model}
            className={`grid grid-cols-[64px_64px_1fr] gap-3 rounded px-3 py-2 transition-colors hover:bg-surface-warm ${
              top ? "bg-accent-soft" : ""
            }`}
          >
            <span className={top ? "text-accent" : "text-text-secondary"}>{j}</span>
            <span className="text-text-muted">{k}</span>
            <span className="text-text-primary">
              {top && <span className="mr-1.5 text-accent">▸</span>}
              {model}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INSTALL — single big copy block + small links

function InstallSection() {
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function notify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(fd as unknown as Record<string, string>).toString(),
    })
      .then(() => setSubmitted(true))
      .catch(() => setSubmitted(true));
  }

  return (
    <section id="install" className="border-t border-border-subtle py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionMark n="04" label="install" />
        <FadeIn>
          <h2 className="max-w-2xl font-display text-4xl font-bold tracking-tight md:text-5xl">
            One line. No daemon.
            <br />
            <span className="text-accent">No cloud.</span>
          </h2>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mt-12 flex items-stretch overflow-hidden rounded-lg border border-border bg-surface font-mono shadow-2xl">
            <span className="hidden items-center bg-surface-warm px-5 text-lg text-accent sm:flex">$</span>
            <code className="flex-1 self-center px-5 py-5 text-base text-text-primary md:text-lg">{INSTALL_CMD}</code>
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(INSTALL_CMD);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                } catch {}
              }}
              className="flex items-center gap-2 border-l border-border bg-surface-warm px-5 text-text-muted transition-colors hover:bg-accent hover:text-background"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="hidden text-sm sm:inline">{copied ? "copied" : "copy"}</span>
            </button>
          </div>
        </FadeIn>

        <FadeIn delay={0.18}>
          <div className="mt-8 grid gap-x-10 gap-y-6 font-mono text-sm text-text-muted md:grid-cols-3">
            <div>
              <span className="text-accent">◆</span> runs on{" "}
              <span className="text-text-primary">macOS · linux · WSL</span>
            </div>
            <div>
              <span className="text-accent">◇</span> needs one of{" "}
              <span className="text-text-primary">claude · codex · agy · ollama</span>
            </div>
            <div>
              <span className="text-accent">◈</span>{" "}
              <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="text-text-primary underline-offset-4 hover:text-accent hover:underline">
                read every line on github
              </a>
            </div>
          </div>
        </FadeIn>

        {/* Desktop — v0.1 ships now */}
        <FadeIn delay={0.28}>
          <div
            id="desktop"
            className="mt-20 flex flex-col items-start gap-6 rounded-lg border border-accent-border bg-accent-soft px-6 py-8 md:flex-row md:items-center md:justify-between md:px-10"
          >
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                desktop · v0.1.0 · macOS arm64
              </div>
              <p className="mt-3 max-w-md text-text-primary">
                A native macOS app — same cockpit, native React UI, no terminal required.
                Unsigned for v0.1: right-click → Open on first launch.
              </p>
            </div>
            <div className="flex flex-col items-start gap-2 md:items-end">
              <a
                href="https://github.com/fru-dev3/prevail-desktop/releases/latest/download/Prevail_0.1.0_aarch64.dmg"
                className="inline-flex items-center gap-2 rounded bg-accent px-5 py-3 font-mono text-sm font-medium text-background transition-all hover:bg-accent-hover hover:-translate-y-0.5"
              >
                download .dmg <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://github.com/fru-dev3/prevail-desktop/releases"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs text-text-muted hover:text-accent"
              >
                view all releases →
              </a>
            </div>
          </div>
        </FadeIn>

        {/* hidden form so Netlify still detects the notify endpoint for
            potential future use; the visible signup CTA is gone now that
            the DMG is downloadable. submitted state retained to avoid
            tree-shake removing the notify handler. */}
        <span className="hidden">{submitted ? "1" : "0"}</span>
        <form name="notify" data-netlify="true" netlify-honeypot="bot-field" hidden onSubmit={notify}>
          <input type="hidden" name="form-name" value="notify" />
          <input type="text" name="bot-field" />
          <input type="email" name="email" />
        </form>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Footer — single row, monospace, minimal

function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col items-start gap-6 font-mono text-xs text-text-muted md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-accent">◈</span>
            <Brand className="text-text-primary" />
            <span>· mit · fru.dev</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="hover:text-accent">github</a>
            <span>·</span>
            <a href={CHANGELOG_URL} target="_blank" rel="noreferrer" className="hover:text-accent">changelog</a>
            <span>·</span>
            <a href={RELEASES_URL} target="_blank" rel="noreferrer" className="hover:text-accent">releases</a>
            <span>·</span>
            <a href="https://github.com/fru-dev3/prevail/tree/main/vault-demo" target="_blank" rel="noreferrer" className="hover:text-accent">
              demo vault
            </a>
            <span>·</span>
            <a href="https://github.com/fru-dev3/prevail/blob/main/SECURITY.md" target="_blank" rel="noreferrer" className="hover:text-accent">
              security
            </a>
          </div>
          <div>built with bun · react · opentui</div>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root

export default function App() {
  useEffect(() => {
    const handler = (e: Event) => {
      const t = e.target as HTMLAnchorElement;
      if (t.tagName === "A" && t.hash) {
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
    <>
      <Nav />
      <main className="pt-12">
        <Hero />
        <Pillars />
        <CouncilSection />
        <BenchmarkSection />
        <InstallSection />
      </main>
      <Footer />
    </>
  );
}

// AnimatePresence re-exported to satisfy bundler tree-shake hint
export { AnimatePresence };
