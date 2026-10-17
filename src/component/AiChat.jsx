import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  Send,
  Trash2,
  Copy,
  Check,
  Square,
  RotateCcw,
} from "lucide-react";

// ------------------------------------------------------------------
// BACKEND HOOK: replace the body of this function when your API is ready.
// Must return the assistant reply as a string. Throw an Error on failure.
// ------------------------------------------------------------------
const askAI = async ({ messages, projectId, signal }) => {
  await new Promise((resolve, reject) => {
    const t = setTimeout(resolve, 1200);
    signal?.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

  const last = messages[messages.length - 1]?.text || "";
  return `This is a placeholder reply. You asked:\n\n"${last}"\n\nHere's a sample code block:\n\n\`\`\`js\nconsole.log("Hello from Codvexa AI");\n\`\`\`\n\nThe real answer will appear here once the backend is connected.`;
};

const SUGGESTIONS = [
  "Create a React login page",
  "Add an Express route for users",
  "Explain this project structure",
];

let idCounter = 0;
const newId = () => `${Date.now()}-${idCounter++}`;

// ------------------------------------------------------------------
// Codvexa logo mark (inline SVG, transparent, animatable)
// ------------------------------------------------------------------
function LogoMark({ width = 120, gradId = "cvx-grad", animated = true }) {
  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    show: (i) => ({
      pathLength: 1,
      opacity: 1,
      transition: { duration: 1, delay: i * 0.15, ease: "easeInOut" },
    }),
  };
  const fade = {
    hidden: { opacity: 0 },
    show: (i) => ({
      opacity: 1,
      transition: { duration: 0.6, delay: 0.5 + i * 0.15 },
    }),
  };

  const motionProps = (variants, i) =>
    animated
      ? { variants, custom: i, initial: "hidden", animate: "show" }
      : {};

  return (
    <svg
      viewBox="0 0 600 400"
      width={width}
      height={(width * 400) / 600}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#7dd3fc" />
        </linearGradient>
      </defs>

      {/* "<" and ">" brackets */}
      <motion.polyline
        points="140,68 32,198 140,330"
        stroke={`url(#${gradId})`}
        strokeWidth="30"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...motionProps(draw, 0)}
      />
      <motion.polyline
        points="465,68 573,198 465,330"
        stroke={`url(#${gradId})`}
        strokeWidth="30"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...motionProps(draw, 1)}
      />

      {/* Slash / X shapes */}
      <motion.polygon
        points="418,8 475,8 187,390 131,390"
        fill={`url(#${gradId})`}
        {...motionProps(fade, 0)}
      />
      <motion.polygon
        points="131,8 188,8 286,140 258,178"
        fill={`url(#${gradId})`}
        {...motionProps(fade, 1)}
      />
      <motion.polygon
        points="346,220 468,390 418,390 320,260"
        fill={`url(#${gradId})`}
        {...motionProps(fade, 2)}
      />
    </svg>
  );
}

// ------------------------------------------------------------------
// Animated background
// ------------------------------------------------------------------
const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: `${(i * 37) % 100}%`,
  size: 2 + (i % 3),
  duration: 8 + (i % 5) * 2,
  delay: (i % 7) * 0.8,
  drift: (i % 2 ? 1 : -1) * (10 + (i % 4) * 6),
}));

function AnimatedBackground() {
  const reduce = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      {/* Drifting glow orbs */}
      <motion.div
        className="absolute -left-10 top-10 h-44 w-44 rounded-full bg-sky-500/10 blur-3xl"
        animate={reduce ? undefined : { x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-10 bottom-24 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl"
        animate={reduce ? undefined : { x: [0, -40, 0], y: [0, -30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Big faint logo watermark */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          animate={
            reduce
              ? { opacity: 0.06 }
              : {
                  y: [0, -10, 0],
                  opacity: [0.04, 0.09, 0.04],
                  filter: [
                    "drop-shadow(0 0 4px rgba(56,189,248,0.1))",
                    "drop-shadow(0 0 22px rgba(56,189,248,0.45))",
                    "drop-shadow(0 0 4px rgba(56,189,248,0.1))",
                  ],
                }
          }
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <LogoMark width={300} gradId="cvx-grad-bg" animated={false} />
        </motion.div>
      </div>

      {/* Floating particles */}
      {!reduce &&
        PARTICLES.map((p) => (
          <motion.span
            key={p.id}
            className="absolute bottom-0 rounded-full bg-sky-300/40"
            style={{ left: p.left, width: p.size, height: p.size }}
            animate={{ y: [0, -520], x: [0, p.drift], opacity: [0, 0.7, 0] }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
    </div>
  );
}

// ---------- Code block with copy button ----------
function CodeBlock({ lang, code }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <div className="my-2 overflow-hidden rounded-md border border-white/[0.08] bg-black/40">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-2.5 py-1">
        <span className="text-[10px] uppercase tracking-wide text-zinc-500">
          {lang || "code"}
        </span>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1 text-[10px] text-zinc-500 transition-colors hover:text-white"
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-2.5 font-mono text-[11px] leading-5 text-zinc-300">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ---------- Splits text on ``` fences ----------
function MessageContent({ text }) {
  const parts = [];
  const regex = /```(\w*)\n?([\s\S]*?)```/g;
  let last = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push({ type: "text", value: text.slice(last, match.index) });
    }
    parts.push({
      type: "code",
      lang: match[1],
      value: match[2].replace(/\n$/, ""),
    });
    last = regex.lastIndex;
  }
  if (last < text.length) parts.push({ type: "text", value: text.slice(last) });

  return parts.map((p, i) =>
    p.type === "code" ? (
      <CodeBlock key={i} lang={p.lang} code={p.value} />
    ) : (
      <p key={i} className="whitespace-pre-wrap break-words">
        {p.value.trim()}
      </p>
    )
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-sky-400/70"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

function AiChat({ projectId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  const abortRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  // Auto-grow textarea (max 120px)
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [input]);

  // Cancel any pending request on unmount
  useEffect(() => () => abortRef.current?.abort(), []);

  const requestReply = async (history) => {
    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoading(true);

    try {
      const reply = await askAI({
        messages: history,
        projectId,
        signal: controller.signal,
      });
      setMessages((prev) => [
        ...prev,
        { id: newId(), role: "assistant", text: reply },
      ]);
    } catch (err) {
      if (err?.name === "AbortError") return;
      console.error("AI request failed:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: "assistant",
          error: true,
          text: err?.message || "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  const handleSend = (override) => {
    const text = (override ?? input).trim();
    if (!text || isLoading) return;

    const userMsg = { id: newId(), role: "user", text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    requestReply(history);
  };

  const handleStop = () => abortRef.current?.abort();

  const handleRetry = () => {
    if (isLoading) return;
    const history = messages.filter((m) => !m.error);
    setMessages(history);
    requestReply(history);
  };

  const handleClear = () => {
    abortRef.current?.abort();
    setMessages([]);
    setIsLoading(false);
  };

  const canSend = input.trim().length > 0 && !isLoading;

  return (
    <div className="relative flex h-full w-80 shrink-0 flex-col overflow-hidden border-l border-white/[0.06] bg-[#0f0f12]">
      <AnimatedBackground />

      {/* Header */}
      <div className="relative z-10 flex h-10 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#111113]/70 px-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <LogoMark width={24} gradId="cvx-grad-header" animated={false} />
          <span className="text-xs font-semibold tracking-wider text-zinc-300">
            Codvexa AI
          </span>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            title="Clear chat"
            onClick={handleClear}
            className="rounded-md p-1 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="relative z-10 flex-1 overflow-y-auto p-3 text-zinc-300"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-5">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              style={{ filter: "drop-shadow(0 0 16px rgba(56,189,248,0.35))" }}
            >
              <LogoMark width={150} gradId="cvx-grad-hero" />
            </motion.div>

            <div className="space-y-1 text-center">
              <p className="text-sm font-medium text-zinc-200">
                Create something cool with me
              </p>
              <p className="text-xs text-zinc-500">
                Ask me to create or modify files
              </p>
            </div>

            <div className="flex w-full flex-col gap-1.5">
              {SUGGESTIONS.map((s, i) => (
                <motion.button
                  key={s}
                  type="button"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  onClick={() => handleSend(s)}
                  className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-left text-xs text-zinc-400 backdrop-blur-sm transition-colors hover:border-sky-400/40 hover:bg-white/[0.06] hover:text-white"
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`flex flex-col ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[90%] rounded-lg px-2.5 py-2 text-xs leading-relaxed backdrop-blur-sm ${
                      msg.role === "user"
                        ? "bg-sky-500/15 text-white"
                        : msg.error
                        ? "border border-red-500/30 bg-red-500/10 text-red-300"
                        : "bg-white/[0.05] text-zinc-300"
                    }`}
                  >
                    <MessageContent text={msg.text} />
                  </div>

                  {msg.error && (
                    <button
                      type="button"
                      onClick={handleRetry}
                      className="mt-1 flex items-center gap-1 text-[11px] text-zinc-500 transition-colors hover:text-white"
                    >
                      <RotateCcw size={11} /> Retry
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <div className="flex items-start">
                <div className="rounded-lg bg-white/[0.05] px-2.5 py-1.5 backdrop-blur-sm">
                  <TypingDots />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="relative z-10 border-t border-white/[0.06] bg-[#111113]/70 p-3 backdrop-blur-md">
        <div className="flex items-end gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] p-2 transition-colors focus-within:border-sky-400/40">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask AI to build something..."
            className="max-h-[120px] flex-1 resize-none bg-transparent text-[13px] text-zinc-200 outline-none placeholder:text-zinc-600"
          />

          {isLoading ? (
            <motion.button
              type="button"
              title="Stop"
              whileTap={{ scale: 0.95 }}
              onClick={handleStop}
              className="rounded p-1 text-red-400 transition-colors hover:text-red-300"
            >
              <Square size={15} fill="currentColor" />
            </motion.button>
          ) : (
            <motion.button
              type="button"
              title="Send"
              disabled={!canSend}
              whileHover={canSend ? { scale: 1.05 } : undefined}
              whileTap={canSend ? { scale: 0.95 } : undefined}
              onClick={() => handleSend()}
              className={`rounded p-1 transition-colors ${
                canSend
                  ? "text-sky-400 hover:text-sky-300"
                  : "cursor-not-allowed text-zinc-700"
              }`}
            >
              <Send size={15} />
            </motion.button>
          )}
        </div>
        <p className="mt-1.5 text-center text-[10px] text-zinc-600">
          Enter to send · Shift+Enter for a new line
        </p>
      </div>
    </div>
  );
}

export default AiChat;