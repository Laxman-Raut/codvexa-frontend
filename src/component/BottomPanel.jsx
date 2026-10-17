import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { TerminalSquare, X, Trash2, GripHorizontal } from "lucide-react";

const MIN_H = 140;
const MAX_H = 600;

const HELP = [
  "Available commands:",
  "  help            show this message",
  "  ls [path]       list files and folders",
  "  cd <path>       change directory (supports .. and /)",
  "  pwd             print current directory",
  "  cat <file>      show file content",
  "  echo <text>     print text",
  "  date            show current date and time",
  "  whoami          show current user",
  "  history         show command history",
  "  clear           clear the terminal (or press Ctrl+L)",
];

function BottomPanel({ onClose, tree = [], projectName = "project", user = "dev" }) {
  const [height, setHeight] = useState(256);
  const [dragging, setDragging] = useState(false);

  const [lines, setLines] = useState([
    { type: "info", text: `${projectName} terminal. Type "help" to see commands.` },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [cwd, setCwd] = useState([]); // array of folder names from root

  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  // Virtual root built from the tree prop (array or single node)
  const root = useMemo(() => {
    const children = Array.isArray(tree) ? tree : tree ? [tree] : [];
    return { name: "", type: "folder", children };
  }, [tree]);

  // ---------- Path helpers ----------
  const getNode = (names) => {
    let node = root;
    for (const n of names) {
      node = node?.children?.find((c) => c.name === n && c.type !== "file")
        ?? node?.children?.find((c) => c.name === n);
      if (!node) return null;
    }
    return node;
  };

  const resolve = (arg = "") => {
    let parts = arg.startsWith("/") || arg.startsWith("~") ? [] : [...cwd];
    for (const seg of arg.replace(/^~/, "").split("/").filter(Boolean)) {
      if (seg === ".") continue;
      if (seg === "..") parts.pop();
      else parts.push(seg);
    }
    return parts;
  };

  const promptPath = cwd.length ? "~/" + cwd.join("/") : "~";

  // ---------- Commands ----------
  const run = (raw) => {
    const [cmd, ...args] = raw.trim().split(/\s+/);
    const arg = args.join(" ");
    const out = (text, type = "output") => ({ type, text });

    switch (cmd) {
      case "help":
        return HELP.map((t) => out(t));

      case "clear":
        return "CLEAR";

      case "pwd":
        return [out("/" + cwd.join("/"))];

      case "whoami":
        return [out(user)];

      case "date":
        return [out(new Date().toString())];

      case "echo":
        return [out(arg)];

      case "history":
        return history.length
          ? history.map((h, i) => out(`${String(i + 1).padStart(3)}  ${h}`))
          : [out("No history yet")];

      case "ls": {
        const target = getNode(resolve(arg));
        if (!target) return [out(`ls: cannot access '${arg}': No such file or directory`, "error")];
        if (target.type === "file") return [out(target.name)];
        const items = target.children || [];
        if (!items.length) return [out("(empty)", "muted")];
        return [
          {
            type: "list",
            items: [...items].sort(
              (a, b) => (a.type === "file") - (b.type === "file") || a.name.localeCompare(b.name)
            ),
          },
        ];
      }

      case "cd": {
        if (!arg) {
          setCwd([]);
          return [];
        }
        const names = resolve(arg);
        const target = getNode(names);
        if (!target) return [out(`cd: no such file or directory: ${arg}`, "error")];
        if (target.type === "file") return [out(`cd: not a directory: ${arg}`, "error")];
        setCwd(names);
        return [];
      }

      case "cat": {
        if (!arg) return [out("cat: missing file name", "error")];
        const target = getNode(resolve(arg));
        if (!target) return [out(`cat: ${arg}: No such file or directory`, "error")];
        if (target.type !== "file") return [out(`cat: ${arg}: Is a directory`, "error")];
        const content = target.content;
        if (!content) return [out("(empty file)", "muted")];
        return content.split("\n").map((t) => out(t));
      }

      default:
        return [out(`${cmd}: command not found. Type "help" for a list of commands.`, "error")];
    }
  };

  const submit = () => {
    const raw = input.trim();
    const echoLine = { type: "input", text: raw, path: promptPath };

    if (!raw) {
      setLines((l) => [...l, echoLine]);
      return;
    }

    setHistory((h) => [...h, raw]);
    setHistIdx(-1);
    setInput("");

    const result = run(raw);
    if (result === "CLEAR") {
      setLines([]);
      return;
    }
    setLines((l) => [...l, echoLine, ...result]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      submit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const next = histIdx === -1 ? history.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(next);
      setInput(history[next]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx === -1) return;
      const next = histIdx + 1;
      if (next >= history.length) {
        setHistIdx(-1);
        setInput("");
      } else {
        setHistIdx(next);
        setInput(history[next]);
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    } else if (e.key === "c" && e.ctrlKey) {
      e.preventDefault();
      setLines((l) => [...l, { type: "input", text: input + "^C", path: promptPath }]);
      setInput("");
      setHistIdx(-1);
    } else if (e.key === "Tab") {
      e.preventDefault();
      autocomplete();
    }
  };

  // Tab completion for the last word
  const autocomplete = () => {
    const words = input.split(" ");
    const last = words.pop() || "";
    const slash = last.lastIndexOf("/");
    const dirPart = slash >= 0 ? last.slice(0, slash + 1) : "";
    const namePart = slash >= 0 ? last.slice(slash + 1) : last;
    const dir = getNode(resolve(dirPart));
    const matches = (dir?.children || []).filter((c) => c.name.startsWith(namePart));
    if (matches.length === 1) {
      const m = matches[0];
      setInput([...words, dirPart + m.name + (m.type !== "file" ? "/" : "")].join(" "));
    }
  };

  // ---------- Resize by dragging the top edge ----------
  const startDrag = (e) => {
    e.preventDefault();
    setDragging(true);
    const startY = e.clientY;
    const startH = height;

    const onMove = (ev) => {
      const next = startH + (startY - ev.clientY);
      setHeight(Math.min(MAX_H, Math.max(MIN_H, next)));
    };
    const onUp = () => {
      setDragging(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  // Auto-scroll to the bottom on new output
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines, input]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height, opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={dragging ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}
      className="relative flex shrink-0 flex-col overflow-hidden border-t border-white/[0.06] bg-[#0d0d0f]"
    >
      {/* Drag handle */}
      <div
        onPointerDown={startDrag}
        className="group absolute inset-x-0 top-0 z-10 flex h-1.5 cursor-row-resize items-center justify-center"
      >
        <div className="h-px w-full bg-transparent transition-colors group-hover:bg-sky-500/60" />
        <GripHorizontal
          size={12}
          className="absolute text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100"
        />
      </div>

      {/* Header */}
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#111113] px-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
          </div>
          <h2 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-white">
            <TerminalSquare size={13} className="text-emerald-400" />
            Terminal
          </h2>
          <span className="text-[11px] text-zinc-600">
            {user}@{projectName}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setLines([])}
            title="Clear terminal"
            className="rounded-md p-1 text-zinc-500 hover:bg-white/10 hover:text-white"
          >
            <Trash2 size={13} />
          </button>
          <button
            onClick={onClose}
            title="Close panel"
            className="rounded-md p-1 text-zinc-500 hover:bg-white/10 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Output + input */}
      <div
        ref={scrollRef}
        onClick={() => inputRef.current?.focus()}
        className="flex-1 cursor-text overflow-y-auto p-3 font-mono text-xs leading-5 text-zinc-300"
      >
        {lines.map((line, i) => {
          if (line.type === "input") {
            return (
              <div key={i} className="flex flex-wrap gap-x-2">
                <span className="text-emerald-400">{user}@{projectName}</span>
                <span className="text-sky-400">{line.path}</span>
                <span className="text-zinc-500">$</span>
                <span className="whitespace-pre-wrap text-white">{line.text}</span>
              </div>
            );
          }
          if (line.type === "list") {
            return (
              <div key={i} className="flex flex-wrap gap-x-4 gap-y-0.5">
                {line.items.map((it) => (
                  <span
                    key={it._id || it.id || it.name}
                    className={it.type === "file" ? "text-zinc-300" : "font-semibold text-sky-400"}
                  >
                    {it.name}
                    {it.type !== "file" ? "/" : ""}
                  </span>
                ))}
              </div>
            );
          }
          const color =
            line.type === "error"
              ? "text-red-400"
              : line.type === "info"
              ? "text-emerald-400/80"
              : line.type === "muted"
              ? "text-zinc-600"
              : "text-zinc-300";
          return (
            <div key={i} className={`whitespace-pre-wrap break-words ${color}`}>
              {line.text}
            </div>
          );
        })}

        {/* Active prompt */}
        <div className="flex flex-wrap items-center gap-x-2">
          <span className="text-emerald-400">{user}@{projectName}</span>
          <span className="text-sky-400">{promptPath}</span>
          <span className="text-zinc-500">$</span>
          <div className="relative min-w-[4px] flex-1">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              className="w-full bg-transparent text-white caret-emerald-400 outline-none"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default BottomPanel;