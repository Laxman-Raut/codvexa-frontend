import { useState, useEffect, useRef, useCallback } from "react";
import MonacoEditor from "@monaco-editor/react";
import { updateFile } from "../features/file";
import { getFileIcon } from "../utils/Customized.icon";
import { AnimatePresence, motion } from "motion/react";
import {
  Check,
  Loader2,
  Save,
  Folder as FolderIcon,
  FileCode,
  Clock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

// Helper function to map file extension to Monaco language
const getLanguageFromFilename = (filename = "") => {
  if (!filename) return "plaintext";
  const lower = filename.toLowerCase().trim();

  if (lower === "dockerfile") return "dockerfile";
  if (lower === "makefile") return "makefile";
  if (lower.startsWith(".env")) return "ini";

  const ext = lower.includes(".") ? lower.split(".").pop() : "";

  const map = {
    js: "javascript",
    mjs: "javascript",
    cjs: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    json: "json",
    html: "html",
    htm: "html",
    css: "css",
    scss: "scss",
    sass: "scss",
    less: "less",
    py: "python",
    pyw: "python",
    java: "java",
    c: "c",
    cpp: "cpp",
    cc: "cpp",
    cxx: "cpp",
    h: "c",
    hpp: "cpp",
    cs: "csharp",
    go: "go",
    rs: "rust",
    php: "php",
    rb: "ruby",
    sh: "shell",
    bash: "shell",
    zsh: "shell",
    bat: "bat",
    cmd: "bat",
    ps1: "powershell",
    sql: "sql",
    yaml: "yaml",
    yml: "yaml",
    xml: "xml",
    svg: "xml",
    md: "markdown",
    markdown: "markdown",
    graphql: "graphql",
    gql: "graphql",
    ini: "ini",
    toml: "ini",
    dockerfile: "dockerfile",
  };

  return map[ext] || "plaintext";
};

// Component for an active file session (keyed by file ID so state resets cleanly on file switch)
function FileEditorSession({
  activeTab,
  onSaveFile,
}) {
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [code, setCode] = useState(activeTab?.content ?? "");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1, selectionLength: 0 });

  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const autoSaveTimerRef = useRef(null);
  const codeRef = useRef(code);
  const savingRef = useRef(false);

  // Keep ref synchronized
  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  useEffect(() => {
    savingRef.current = saving;
  }, [saving]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  const language = getLanguageFromFilename(activeTab?.name);
  const fileIconData = getFileIcon(activeTab?.name || "");
  const AciveIcon = fileIconData?.Icon || fileIconData?.icon || FileCode;
  const activeColor = fileIconData?.color || "text-zinc-400";

  // Core save execution
  const executeSave = useCallback(
    async (contentToSave) => {
      const fileId = activeTab?._id || activeTab?.id;
      if (!fileId || savingRef.current) return;

      const codeToPersist =
        contentToSave !== undefined ? contentToSave : codeRef.current;

      setSaving(true);
      const success = await onSaveFile(activeTab, codeToPersist);
      setSaving(false);

      if (success) {
        setJustSaved(true);
        setHasUnsavedChanges(false);
        setTimeout(() => {
          setJustSaved(false);
        }, 2200);
      }
    },
    [activeTab, onSaveFile]
  );

  // Manual save trigger
  const handleManualSave = useCallback(async () => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    const currentCode = editorRef.current
      ? editorRef.current.getValue()
      : codeRef.current;
    await executeSave(currentCode);
  }, [executeSave]);

  // Handle code changes from Monaco with 15-second debounced auto-save
  const handleEditorChange = (value) => {
    const nextVal = value ?? "";
    setCode(nextVal);
    setHasUnsavedChanges(true);
    setJustSaved(false);

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      executeSave(nextVal);
    }, 15000);
  };

  // Configure Monaco instance on mount
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Track cursor and selection position for status bar
    editor.onDidChangeCursorPosition((e) => {
      const position = e.position;
      const selection = editor.getSelection();
      let selLen = 0;
      if (selection && !selection.isEmpty()) {
        const selectedText = editor.getModel()?.getValueInRange(selection) || "";
        selLen = selectedText.length;
      }
      setCursorPos({
        line: position.lineNumber,
        col: position.column,
        selectionLength: selLen,
      });
    });

    // Register Ctrl+S / Cmd+S save command inside Monaco
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleManualSave();
    });

    editor.focus();
  };

  const lineCount = code.split("\n").length;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#0c0c0f]">
      {/* Editor Header Bar */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-white/[0.07] bg-[#0e0e12]/95 px-4 backdrop-blur-md">
        {/* Left: Folder context and file title */}
        <div className="flex min-w-0 items-center gap-2">
          {activeTab?.parentName && (
            <div className="flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-xs text-zinc-400">
              <FolderIcon size={12} className="text-amber-400/90" />
              <span className="font-medium text-zinc-300">
                {activeTab.parentName}
              </span>
              <span className="text-zinc-600">/</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <AciveIcon size={15} className={`shrink-0 ${activeColor}`} />
            <span className="truncate text-xs font-semibold text-zinc-100">
              {activeTab.name}
            </span>
            {hasUnsavedChanges && (
              <span
                title="Unsaved changes (auto-saving in 15s)"
                className="h-2 w-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50"
              />
            )}
          </div>
        </div>

        {/* Right: Auto-save status feedback and Manual Save button */}
        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden items-center gap-1.5 text-[11px] text-zinc-500 sm:flex">
            {saving ? (
              <span className="flex items-center gap-1 text-sky-400">
                <Loader2 size={12} className="animate-spin" />
                <span>Saving...</span>
              </span>
            ) : justSaved ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 size={12} />
                <span>Saved</span>
              </span>
            ) : hasUnsavedChanges ? (
              <span className="flex items-center gap-1 text-amber-400/90">
                <Clock size={11} />
                <span>Auto-save in 15s</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-zinc-500">
                <Check size={11} className="text-zinc-600" />
                <span>All saved</span>
              </span>
            )}
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleManualSave}
            disabled={saving}
            title="Save file (Ctrl + S)"
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-b from-sky-500 to-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_2px_8px_rgba(2,132,199,0.25)] transition-all hover:from-sky-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <AnimatePresence initial={false} mode="wait">
              {saving ? (
                <motion.div
                  key="saving"
                  initial={{ opacity: 0, y: -2 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 2 }}
                  transition={{ duration: 0.12 }}
                  className="flex items-center gap-1.5"
                >
                  <Loader2 size={13} className="animate-spin" />
                  <span>Saving...</span>
                </motion.div>
              ) : justSaved ? (
                <motion.div
                  key="justSaved"
                  initial={{ opacity: 0, y: -2 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 2 }}
                  transition={{ duration: 0.12 }}
                  className="flex items-center gap-1.5"
                >
                  <Check size={13} />
                  <span>Saved</span>
                </motion.div>
              ) : (
                <motion.div
                  key="save"
                  initial={{ opacity: 0, y: -2 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 2 }}
                  transition={{ duration: 0.12 }}
                  className="flex items-center gap-1.5"
                >
                  <Save size={13} />
                  <span>Save</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Monaco Editor Canvas */}
      <div className="relative flex-1 overflow-hidden bg-[#1e1e1e]">
        <MonacoEditor
          height="100%"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 13,
            fontFamily: "'Fira Code', 'JetBrains Mono', Menlo, Monaco, Consolas, monospace",
            lineHeight: 22,
            minimap: { enabled: true, maxColumn: 80, scale: 0.8 },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: "on",
            quickSuggestions: {
              other: true,
              comments: true,
              strings: true,
            },
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: "on",
            tabCompletion: "on",
            parameterHints: { enabled: true },
            snippetSuggestions: "inline",
            bracketPairColorization: { enabled: true },
            formatOnPaste: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            renderLineHighlight: "all",
            padding: { top: 8, bottom: 8 },
          }}
          loading={
            <div className="flex h-full w-full items-center justify-center bg-[#1e1e1e] text-zinc-500">
              <Loader2 size={24} className="animate-spin text-sky-400" />
              <span className="ml-2 text-xs text-zinc-400">Loading IntelliSense Editor...</span>
            </div>
          }
        />
      </div>

      {/* Editor Status Bar */}
      <div className="flex h-6 shrink-0 items-center justify-between border-t border-white/[0.06] bg-[#09090c] px-4 text-[11px] text-zinc-500">
        <div className="flex items-center gap-3">
          <span>
            Ln {cursorPos.line}, Col {cursorPos.col}
            {cursorPos.selectionLength > 0 && (
              <span className="ml-1 text-sky-400/90">
                ({cursorPos.selectionLength} selected)
              </span>
            )}
          </span>
          <span className="h-3 w-px bg-white/[0.08]" />
          <span>{lineCount} lines</span>
          <span className="h-3 w-px bg-white/[0.08]" />
          <span>{code.length} chars</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-zinc-400">Spaces: 2</span>
          <span className="h-3 w-px bg-white/[0.08]" />
          <span>UTF-8</span>
          <span className="h-3 w-px bg-white/[0.08]" />
          <span className={`font-semibold uppercase ${activeColor}`}>
            {language}
          </span>
        </div>
      </div>
    </div>
  );
}

function Editor({
  file,
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
  setactiveTab: propSetactiveTab,
  setOpenTabs: propSetOpenTabs,
  setOpenTb: propSetOpenTb,
  reloadTree,
}) {
  const activeTab = propActiveTab || file;

  const handleSaveFile = useCallback(
    async (fileObj, newContent) => {
      const fileId = fileObj?._id || fileObj?.id;
      if (!fileId) return false;

      try {
        await updateFile({
          name: fileObj.name,
          content: newContent,
          id: fileId,
        });

        const updateTabFn = propSetactiveTab || propSetActiveTab;
        if (updateTabFn) {
          updateTabFn((prev) =>
            prev ? { ...prev, content: newContent } : { ...fileObj, content: newContent }
          );
        }

        const updateTabsFn = propSetOpenTb || propSetOpenTabs;
        if (updateTabsFn) {
          updateTabsFn((tabs) =>
            tabs.map((t) =>
              (t._id || t.id) === fileId ? { ...t, content: newContent } : t
            )
          );
        }

        if (reloadTree) {
          await reloadTree();
        }

        return true;
      } catch (err) {
        console.error("Save error:", err);
        return false;
      }
    },
    [propSetactiveTab, propSetActiveTab, propSetOpenTb, propSetOpenTabs, reloadTree]
  );

  if (!activeTab) {
    return (
      <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#0d0d11]">
        <div className="pointer-events-none absolute -top-24 h-96 w-96 rounded-full bg-sky-500/[0.04] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 h-96 w-96 rounded-full bg-indigo-500/[0.04] blur-3xl" />

        <div className="relative z-10 flex flex-col items-center px-6 text-center">
          <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.02] shadow-xl backdrop-blur-xl">
            <FileCode size={30} className="text-zinc-500" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-2xl border border-sky-500/20"
            />
          </div>

          <h3 className="text-base font-semibold tracking-tight text-zinc-200">
            No File Selected
          </h3>
          <p className="mt-1.5 max-w-sm text-xs text-zinc-500">
            Choose a file from the explorer on the left or create a new one to begin editing.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[11px] text-zinc-500">
            <span className="flex items-center gap-1 rounded-md border border-white/[0.06] bg-white/[0.03] px-2.5 py-1">
              <kbd className="font-mono text-zinc-400">Ctrl</kbd> + <kbd className="font-mono text-zinc-400">S</kbd> Save
            </span>
            <span className="flex items-center gap-1 rounded-md border border-white/[0.06] bg-white/[0.03] px-2.5 py-1">
              <kbd className="font-mono text-zinc-400">Tab</kbd> Autocomplete
            </span>
            <span className="flex items-center gap-1 rounded-md border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-emerald-400/80">
              <Sparkles size={11} /> Auto-save 15s
            </span>
          </div>
        </div>
      </div>
    );
  }

  const sessionKey = (activeTab._id || activeTab.id || activeTab.name)?.toString();

  return (
    <FileEditorSession
      key={sessionKey}
      activeTab={activeTab}
      onSaveFile={handleSaveFile}
    />
  );
}

export default Editor;