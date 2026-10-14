import { useState, useMemo, useEffect, useRef } from "react";
import {
  RotateCw,
  ExternalLink,
  Monitor,
  Tablet,
  Smartphone,
  Lock,
  Terminal,
  Trash2,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Code2,
  AlertCircle,
  FileCode,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

function Preview({
  tree,
  openTabs,
  onClose,
  isFullscreen,
  setIsFullscreen,
}) {
  const [deviceMode, setDeviceMode] = useState("desktop"); // "desktop" | "tablet" | "mobile"
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [logs, setLogs] = useState([]);
  const iframeRef = useRef(null);

  // Collect all files recursively from tree + openTabs
  const filesMap = useMemo(() => {
    const map = new Map();

    const walk = (items = []) => {
      if (!Array.isArray(items)) return;
      for (const item of items) {
        if (!item) continue;
        const isFile =
          item.type === "file" ||
          ((!item.children || item.children.length === 0) &&
            Boolean(item.name && item.name.includes(".")));

        if (isFile) {
          map.set(item.name.toLowerCase().trim(), item.content || "");
        }
        if (Array.isArray(item.children) && item.children.length > 0) {
          walk(item.children);
        }
      }
    };

    walk(tree);

    // Overlay openTabs (which contain live user edits)
    if (Array.isArray(openTabs)) {
      for (const tab of openTabs) {
        if (tab?.name) {
          map.set(tab.name.toLowerCase().trim(), tab.content || "");
        }
      }
    }

    return map;
  }, [tree, openTabs]);

  // Build the complete srcDoc bundle
  const srcDoc = useMemo(() => {
    if (!filesMap || filesMap.size === 0) {
      return "";
    }

    // 1. Locate primary HTML file
    let htmlContent = "";
    if (filesMap.has("index.html")) {
      htmlContent = filesMap.get("index.html");
    } else {
      // Find any file ending in .html
      for (const [name, content] of filesMap.entries()) {
        if (name.endsWith(".html") && content.trim()) {
          htmlContent = content;
          break;
        }
      }
    }

    // 2. Locate all CSS files
    const cssSnippets = [];
    for (const [name, content] of filesMap.entries()) {
      if (name.endsWith(".css") && content.trim()) {
        cssSnippets.push(`/* ${name} */\n${content}`);
      }
    }
    const mergedCss = cssSnippets.join("\n\n");

    // 3. Locate all JS / JSX files
    const jsSnippets = [];
    let usesReactOrJsx = false;

    // Prioritize main entry files first
    const entryPriority = ["main.jsx", "index.jsx", "app.jsx", "index.js", "main.js", "app.js", "script.js"];
    const addedFiles = new Set();

    for (const entry of entryPriority) {
      if (filesMap.has(entry)) {
        const c = filesMap.get(entry);
        if (entry.endsWith(".jsx") || c.includes("React") || c.includes("jsx") || c.includes("<")) {
          usesReactOrJsx = true;
        }
        jsSnippets.push(`// ${entry}\n${c}`);
        addedFiles.add(entry);
      }
    }

    for (const [name, content] of filesMap.entries()) {
      if (!addedFiles.has(name) && (name.endsWith(".js") || name.endsWith(".jsx"))) {
        if (name.endsWith(".jsx") || content.includes("React") || content.includes("<")) {
          usesReactOrJsx = true;
        }
        jsSnippets.push(`// ${name}\n${content}`);
      }
    }

    const mergedJs = jsSnippets.join("\n\n");

    // Console message bridge script to communicate with host
    const consoleBridgeScript = `
      <script>
        (function() {
          function sendLog(type, args) {
            try {
              var serialized = Array.from(args).map(function(item) {
                if (typeof item === 'object') {
                  try { return JSON.stringify(item, null, 2); } catch (e) { return String(item); }
                }
                return String(item);
              }).join(' ');
              window.parent.postMessage({
                source: 'codvexa-preview-console',
                type: type,
                message: serialized,
                timestamp: new Date().toLocaleTimeString()
              }, '*');
            } catch (err) {}
          }

          var _log = console.log;
          var _warn = console.warn;
          var _error = console.error;
          var _info = console.info;

          console.log = function() { sendLog('log', arguments); _log.apply(console, arguments); };
          console.warn = function() { sendLog('warn', arguments); _warn.apply(console, arguments); };
          console.error = function() { sendLog('error', arguments); _error.apply(console, arguments); };
          console.info = function() { sendLog('info', arguments); _info.apply(console, arguments); };

          window.onerror = function(msg, url, line, col, error) {
            sendLog('error', [msg + (line ? ' (Line ' + line + ')' : '')]);
            return false;
          };

          window.onunhandledrejection = function(e) {
            sendLog('error', ['Unhandled Promise Rejection: ' + (e.reason ? e.reason.message || e.reason : e)]);
          };
        })();
      </script>
    `;

    // 4. Construct final HTML document
    if (!htmlContent) {
      // Boilerplate if no HTML file was created yet
      return `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Preview</title>
            <script src="https://cdn.tailwindcss.com"></script>
            ${consoleBridgeScript}
            ${usesReactOrJsx ? `
              <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
              <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
              <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
            ` : ""}
            <style>
              ${mergedCss}
            </style>
          </head>
          <body class="bg-white text-zinc-900 dark:bg-[#0c0c0f] dark:text-zinc-100 font-sans p-4">
            <div id="root"></div>
            <div id="app"></div>
            ${
              mergedJs
                ? usesReactOrJsx
                  ? `<script type="text/babel">${mergedJs}</script>`
                  : `<script>${mergedJs}</script>`
                : `<div class="flex flex-col items-center justify-center min-h-[50vh] text-center text-zinc-500">
                    <p class="text-sm font-medium">Ready for preview</p>
                    <p class="text-xs text-zinc-400 mt-1">Add code to your files to view live results</p>
                  </div>`
            }
          </body>
        </html>
      `;
    }

    // Inject styles and scripts into existing HTML
    let injectedHtml = htmlContent;

    // Inject console bridge & tailwind CDN in head
    const headInjections = `
      <script src="https://cdn.tailwindcss.com"></script>
      ${consoleBridgeScript}
      ${usesReactOrJsx ? `
        <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
      ` : ""}
      ${mergedCss ? `<style id="codvexa-injected-styles">${mergedCss}</style>` : ""}
    `;

    if (injectedHtml.includes("</head>")) {
      injectedHtml = injectedHtml.replace("</head>", `${headInjections}</head>`);
    } else {
      injectedHtml = `${headInjections}${injectedHtml}`;
    }

    // Inject scripts before body close
    if (mergedJs) {
      const scriptTag = usesReactOrJsx
        ? `<script type="text/babel" id="codvexa-injected-js">${mergedJs}</script>`
        : `<script id="codvexa-injected-js">${mergedJs}</script>`;

      if (injectedHtml.includes("</body>")) {
        injectedHtml = injectedHtml.replace("</body>", `${scriptTag}</body>`);
      } else {
        injectedHtml = `${injectedHtml}${scriptTag}`;
      }
    }

    return injectedHtml;
  }, [filesMap]);

  // Listen to console messages from the preview iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.source === "codvexa-preview-console") {
        setLogs((prev) => [
          ...prev.slice(-99),
          {
            id: Math.random().toString(36).substring(7),
            type: event.data.type || "log",
            message: event.data.message || "",
            timestamp: event.data.timestamp || new Date().toLocaleTimeString(),
          },
        ]);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Reload iframe
  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Open preview in standalone browser tab
  const handleOpenNewTab = () => {
    try {
      const blob = new Blob([srcDoc], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      console.error("Failed to open standalone preview:", err);
    }
  };

  // Copy local preview address
  const handleCopyUrl = () => {
    navigator.clipboard.writeText("https://codvexa-preview.local/");
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 1500);
  };

  // Viewport widths
  const viewportStyles = {
    desktop: "w-full h-full",
    tablet: "w-[768px] h-full shadow-2xl rounded-lg border border-white/10 my-auto",
    mobile: "w-[375px] h-full shadow-2xl rounded-2xl border border-white/10 my-auto",
  };

  const errorCount = logs.filter((l) => l.type === "error").length;

  return (
    <div
      className={`flex flex-col overflow-hidden bg-[#0a0a0d] ${
        isFullscreen ? "fixed inset-0 z-50 h-screen w-screen" : "h-full w-full"
      }`}
    >
      {/* Top Browser Navigation Bar */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-white/[0.08] bg-[#111114]/95 px-3 backdrop-blur-md">
        {/* Left: Window Controls / Reload */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 pr-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleRefresh}
            title="Reload Preview"
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <RotateCw
              size={13}
              className={isRefreshing ? "animate-spin text-sky-400" : ""}
            />
          </motion.button>
        </div>

        {/* Center: Address Bar */}
        <div className="flex max-w-md flex-1 items-center justify-between rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-1 text-xs text-zinc-400 shadow-inner">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <Lock size={11} className="shrink-0 text-emerald-400/90" />
            <span className="truncate font-mono text-[11px] text-zinc-300">
              https://codvexa-preview.local/
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyUrl}
            title="Copy URL"
            className="ml-2 text-zinc-500 hover:text-zinc-300"
          >
            {copiedUrl ? (
              <Check size={12} className="text-emerald-400" />
            ) : (
              <Copy size={12} />
            )}
          </button>
        </div>

        {/* Right: Device Switchers, Console, Fullscreen, Open In Tab */}
        <div className="flex items-center gap-1.5">
          {/* Responsive Device Switcher */}
          <div className="hidden items-center rounded-lg border border-white/[0.08] bg-white/[0.03] p-0.5 sm:flex">
            <button
              type="button"
              onClick={() => setDeviceMode("desktop")}
              title="Desktop View (100%)"
              className={`rounded p-1 transition-colors ${
                deviceMode === "desktop"
                  ? "bg-white/[0.08] text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Monitor size={13} />
            </button>
            <button
              type="button"
              onClick={() => setDeviceMode("tablet")}
              title="Tablet View (768px)"
              className={`rounded p-1 transition-colors ${
                deviceMode === "tablet"
                  ? "bg-white/[0.08] text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Tablet size={13} />
            </button>
            <button
              type="button"
              onClick={() => setDeviceMode("mobile")}
              title="Mobile View (375px)"
              className={`rounded p-1 transition-colors ${
                deviceMode === "mobile"
                  ? "bg-white/[0.08] text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Smartphone size={13} />
            </button>
          </div>

          {/* Console Drawer Toggle */}
          <button
            type="button"
            onClick={() => setShowConsole(!showConsole)}
            title="Toggle Console"
            className={`relative flex items-center gap-1 rounded-lg border border-white/[0.08] px-2 py-1 text-xs font-medium transition-colors ${
              showConsole
                ? "bg-sky-500/15 text-sky-300 border-sky-500/30"
                : "bg-white/[0.03] text-zinc-400 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <Terminal size={12} />
            <span className="hidden text-[11px] md:inline">Console</span>
            {errorCount > 0 && (
              <span className="rounded-full bg-rose-500/20 px-1 py-0.2 text-[9px] font-bold text-rose-400">
                {errorCount}
              </span>
            )}
          </button>

          {/* Open in Standalone Tab */}
          <button
            type="button"
            onClick={handleOpenNewTab}
            title="Open in New Tab"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <ExternalLink size={13} />
          </button>

          {/* Fullscreen Toggle */}
          {setIsFullscreen && (
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Preview"}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
          )}

          {/* Back to Editor */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              title="Return to Code Editor"
              className="ml-1 flex items-center gap-1 rounded-lg bg-white/[0.06] px-2 py-1 text-xs font-medium text-zinc-300 hover:bg-white/[0.1] hover:text-white"
            >
              <Code2 size={12} />
              <span className="hidden sm:inline">Editor</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Preview Frame Container */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#0d0d10] p-1">
        {srcDoc ? (
          <iframe
            key={refreshKey}
            ref={iframeRef}
            srcDoc={srcDoc}
            title="Codvexa Live Preview"
            sandbox="allow-scripts allow-modals allow-same-origin allow-forms allow-popups"
            className={`transition-all duration-200 bg-white dark:bg-[#0c0c0f] ${viewportStyles[deviceMode]}`}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] mb-3">
              <FileCode size={28} className="text-zinc-500" />
            </div>
            <h4 className="text-sm font-semibold text-zinc-300">
              No Previewable Files Found
            </h4>
            <p className="mt-1 max-w-sm text-xs text-zinc-500">
              Create an <code className="text-sky-400 font-mono">index.html</code>, JavaScript, or CSS file in the explorer to see live preview.
            </p>
          </div>
        )}
      </div>

      {/* Collapsible Console Drawer */}
      <AnimatePresence>
        {showConsole && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 160, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex flex-col border-t border-white/[0.08] bg-[#0c0c0f] text-xs font-mono"
          >
            {/* Console Toolbar */}
            <div className="flex h-7 shrink-0 items-center justify-between border-b border-white/[0.05] bg-[#111114] px-3 text-[11px] text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-300">Console</span>
                <span className="text-[10px] text-zinc-500">
                  ({logs.length} messages)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLogs([])}
                  title="Clear Console"
                  className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300"
                >
                  <Trash2 size={11} />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* Console Output */}
            <div
              className="flex-1 overflow-y-auto p-2 space-y-1"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(255,255,255,0.1) transparent",
              }}
            >
              {logs.length === 0 ? (
                <div className="py-4 text-center text-[11px] italic text-zinc-600">
                  No console messages recorded.
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className={`flex items-start gap-2 rounded px-2 py-0.5 text-[11px] ${
                      log.type === "error"
                        ? "bg-rose-500/10 text-rose-300 border-l-2 border-rose-500"
                        : log.type === "warn"
                        ? "bg-amber-500/10 text-amber-300 border-l-2 border-amber-500"
                        : "text-zinc-300 hover:bg-white/[0.02]"
                    }`}
                  >
                    <span className="shrink-0 text-[10px] text-zinc-600">
                      {log.timestamp}
                    </span>
                    {log.type === "error" && (
                      <AlertCircle size={12} className="shrink-0 text-rose-400 mt-0.5" />
                    )}
                    <span className="break-all whitespace-pre-wrap flex-1">
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Preview;
