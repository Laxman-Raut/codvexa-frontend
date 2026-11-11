import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { io } from "socket.io-client";
import { AlertCircle, RefreshCw, Terminal as TerminalIcon } from "lucide-react";

import "@xterm/xterm/css/xterm.css";

const TERMINAL_THEME = {
  background: "#0c0c0e",
  foreground: "#e4e4e7",
  cursor: "#38bdf8",
  cursorAccent: "#0c0c0e",
  selectionBackground: "rgba(56, 189, 248, 0.3)",
  selectionForeground: "#ffffff",
  black: "#18181b",
  red: "#f87171",
  green: "#4ade80",
  yellow: "#facc15",
  blue: "#60a5fa",
  magenta: "#c084fc",
  cyan: "#38bdf8",
  white: "#f4f4f5",
  brightBlack: "#52525b",
  brightRed: "#ef4444",
  brightGreen: "#22c55e",
  brightYellow: "#eab308",
  brightBlue: "#3b82f6",
  brightMagenta: "#a855f7",
  brightCyan: "#06b6d4",
  brightWhite: "#ffffff",
};

const TERMINAL_SERVICE_URL =
  import.meta.env.VITE_TERMINAL_URL || "http://localhost:8005";

const TerminalInstance = forwardRef(function TerminalInstance(
  { projectId, userId, isActive, onStatusChange, onFilesChanged },
  ref
) {
  const containerRef = useRef(null);
  const termRef = useRef(null);
  const fitAddonRef = useRef(null);
  const socketRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const initializedRef = useRef(false);

  // Always points at the latest callback, so the socket listener never goes stale
  const onFilesChangedRef = useRef(onFilesChanged);
  onFilesChangedRef.current = onFilesChanged;
  const onStatusChangeRef = useRef(onStatusChange);
  onStatusChangeRef.current = onStatusChange;

  const [status, setStatus] = useState("connecting");
  const [errorMessage, setErrorMessage] = useState("");

  const updateStatus = useCallback((newStatus, msg = "") => {
    setStatus(newStatus);
    setErrorMessage(msg);
    onStatusChangeRef.current?.(newStatus, msg);
  }, []);

  const clear = () => {
    termRef.current?.clear();
  };

  const focus = () => {
    termRef.current?.focus();
  };

  const connectTerminal = useCallback(() => {
    if (!projectId || !userId) {
      updateStatus(
        "error",
        "Project ID and User ID are required to start the terminal session."
      );
      return;
    }

    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    updateStatus("connecting");

    const socket = io(TERMINAL_SERVICE_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1500,
      timeout: 10000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      updateStatus("syncing", "Syncing workspace files...");

      let cols = 80;
      let rows = 24;

      if (fitAddonRef.current && termRef.current) {
        try {
          fitAddonRef.current.fit();
          cols = termRef.current.cols || 80;
          rows = termRef.current.rows || 24;
        } catch {
          // Ignored
        }
      }

      socket.emit("terminal:init", projectId, userId, cols, rows);
    });

    socket.on("terminal:ready", ({ cols, rows } = {}) => {
      updateStatus("connected");
      if (fitAddonRef.current && termRef.current) {
        try {
          fitAddonRef.current.fit();
          const currentCols = termRef.current.cols;
          const currentRows = termRef.current.rows;
          if (
            Number.isFinite(currentCols) &&
            Number.isFinite(currentRows) &&
            (currentCols !== cols || currentRows !== rows)
          ) {
            socket.emit("terminal:resize", {
              cols: currentCols,
              rows: currentRows,
            });
          }
        } catch {
          // Ignored
        }
        termRef.current.focus();
      }
    });

    socket.on("terminal:error", ({ message } = {}) => {
      updateStatus("error", message || "The terminal could not be initialized.");
    });

    socket.on("terminal:data", (data) => {
      if (termRef.current) {
        termRef.current.write(data);
      }
    });

    // The terminal created, changed or deleted files: tell the page to reload the explorer
    socket.on("terminal:files-changed", (payload) => {
      onFilesChangedRef.current?.(payload);
    });

    socket.on("connect_error", (error) => {
      console.warn("Terminal socket connect error:", error.message);
      const message =
        error.message === "unauthorized"
          ? "Please sign in again to use the terminal."
          : error.message === "authentication service unavailable"
          ? "The authentication service is unavailable. Try again shortly."
          : `Cannot reach terminal service at ${TERMINAL_SERVICE_URL}. Make sure it is running.`;
      updateStatus(
        "error",
        message
      );
    });

    socket.on("disconnect", (reason) => {
      if (reason === "io client disconnect") return;
      updateStatus("disconnected", `Disconnected: ${reason}`);
    });
  }, [projectId, userId, updateStatus]);

  const reconnect = useCallback(() => {
    connectTerminal();
  }, [connectTerminal]);

  useImperativeHandle(
    ref,
    () => ({
      clear,
      focus,
      reconnect,
      fit: () => {
        try {
          fitAddonRef.current?.fit();
        } catch {
          // Ignored
        }
      },
    }),
    [reconnect]
  );

  useEffect(() => {
    if (!containerRef.current || initializedRef.current) return;
    initializedRef.current = true;

    const term = new Terminal({
      theme: TERMINAL_THEME,
      fontFamily:
        "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, Menlo, Monaco, monospace",
      fontSize: 13,
      lineHeight: 1.25,
      cursorBlink: true,
      cursorStyle: "bar",
      scrollback: 5000,
      convertEol: true,
      allowTransparency: true,
      rightClickSelectsWord: true,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);

    term.open(containerRef.current);

    termRef.current = term;
    fitAddonRef.current = fitAddon;

    const dataDisposable = term.onData((data) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("terminal:write", data);
      }
    });

    let resizeTimer = null;
    const observer = new ResizeObserver(() => {
      if (resizeTimer) cancelAnimationFrame(resizeTimer);
      resizeTimer = requestAnimationFrame(() => {
        if (!containerRef.current || !fitAddonRef.current || !termRef.current)
          return;
        try {
          fitAddonRef.current.fit();
          const cols = termRef.current.cols;
          const rows = termRef.current.rows;
          if (
            socketRef.current?.connected &&
            Number.isFinite(cols) &&
            Number.isFinite(rows)
          ) {
            socketRef.current.emit("terminal:resize", { cols, rows });
          }
        } catch {
          // Ignored
        }
      });
    });

    observer.observe(containerRef.current);
    resizeObserverRef.current = observer;

    return () => {
      if (resizeTimer) cancelAnimationFrame(resizeTimer);
      dataDisposable.dispose();
      observer.disconnect();
      term.dispose();
      initializedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!projectId || !userId) return;
    connectTerminal();

    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [projectId, userId, connectTerminal]);

  useEffect(() => {
    if (!isActive) return;

    const timer = setTimeout(() => {
      try {
        fitAddonRef.current?.fit();
        termRef.current?.focus();
        if (
          socketRef.current?.connected &&
          termRef.current?.cols &&
          termRef.current?.rows
        ) {
          socketRef.current.emit("terminal:resize", {
            cols: termRef.current.cols,
            rows: termRef.current.rows,
          });
        }
      } catch {
        // Ignored
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [isActive]);

  return (
    <div
      className={`relative h-full w-full flex-1 overflow-hidden bg-[#0c0c0e] ${
        isActive ? "block" : "hidden"
      }`}
      onClick={focus}
    >
      <div
        ref={containerRef}
        className="h-full w-full p-2 pl-3 select-text font-mono text-xs"
      />

      {status !== "connected" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#0c0c0e]/85 backdrop-blur-[2px]">
          <div className="pointer-events-auto flex max-w-md flex-col items-center gap-3 rounded-xl border border-white/[0.08] bg-[#141417] p-5 text-center shadow-2xl">
            {status === "connecting" && (
              <>
                <RefreshCw
                  size={24}
                  className="animate-spin text-sky-400"
                />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-zinc-200">
                    Connecting to Terminal Service
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Establishing WebSocket connection to {TERMINAL_SERVICE_URL}...
                  </p>
                </div>
              </>
            )}

            {status === "syncing" && (
              <>
                <TerminalIcon
                  size={24}
                  className="animate-pulse text-emerald-400"
                />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-zinc-200">
                    Initializing Workspace Shell
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Syncing project files and starting PTY session...
                  </p>
                </div>
              </>
            )}

            {status === "disconnected" && (
              <>
                <AlertCircle size={24} className="text-amber-400" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-zinc-200">
                    Terminal Disconnected
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    {errorMessage || "The terminal session has ended."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={reconnect}
                  className="mt-1 flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <RefreshCw size={13} />
                  Restart Terminal
                </button>
              </>
            )}

            {status === "error" && (
              <>
                <AlertCircle size={24} className="text-red-400" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-red-300">
                    Terminal Connection Error
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    {errorMessage ||
                      "Failed to establish connection with the terminal backend."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={reconnect}
                  className="mt-1 flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-500/20 transition-colors"
                >
                  <RefreshCw size={13} />
                  Retry Connection
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default TerminalInstance;
