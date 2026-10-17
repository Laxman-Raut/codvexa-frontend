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

// Setup Monaco languages, compiler options, and rich IntelliSense autocomplete suggestions
const setupMonacoLanguageProviders = (monaco) => {
  if (typeof window === "undefined" || window.__codvexaMonacoConfigured) return;
  window.__codvexaMonacoConfigured = true;

  try {
    // 1. TypeScript & JavaScript Compiler Options for complete IntelliSense & JSX
    if (monaco.languages.typescript) {
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
      });

      monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ESNext,
        allowNonTextExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        noEmit: true,
        esModuleInterop: true,
        jsx: monaco.languages.typescript.JsxEmit.React,
        reactNamespace: "React",
        allowJs: true,
        checkJs: false,
      });

      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ESNext,
        allowNonTextExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        noEmit: true,
        esModuleInterop: true,
        jsx: monaco.languages.typescript.JsxEmit.React,
        reactNamespace: "React",
        allowJs: true,
      });
    }

    // 2. HTML language options
    if (monaco.languages.html) {
      monaco.languages.html.htmlDefaults.setOptions({
        suggest: { html5: true },
        format: { tabSize: 2, insertSpaces: true },
      });
    }

    // 3. CSS language options
    if (monaco.languages.css) {
      monaco.languages.css.cssDefaults.setOptions({
        validate: true,
        lint: { validProperties: [] },
      });
    }

    // 4. Register rich HTML tag and attribute completions
    monaco.languages.registerCompletionItemProvider("html", {
      triggerCharacters: ["<", " ", ":", "/", ">", "."],
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const htmlTags = [
          { label: "div", snippet: '<div class="$1">$0</div>', doc: "Generic container block" },
          { label: "span", snippet: '<span class="$1">$0</span>', doc: "Inline text container" },
          { label: "p", snippet: '<p>$0</p>', doc: "Paragraph element" },
          { label: "h1", snippet: '<h1>$0</h1>', doc: "Top-level heading" },
          { label: "h2", snippet: '<h2>$0</h2>', doc: "Heading level 2" },
          { label: "h3", snippet: '<h3>$0</h3>', doc: "Heading level 3" },
          { label: "h4", snippet: '<h4>$0</h4>', doc: "Heading level 4" },
          { label: "button", snippet: '<button type="button" class="$1">$0</button>', doc: "Clickable button" },
          { label: "input", snippet: '<input type="${1:text}" placeholder="$2" class="$3" />', doc: "Input field" },
          { label: "form", snippet: '<form action="$1" method="${2:POST}">\n  $0\n</form>', doc: "Form element" },
          { label: "a", snippet: '<a href="$1" target="_blank">$0</a>', doc: "Hyperlink anchor" },
          { label: "img", snippet: '<img src="$1" alt="$2" class="$3" />', doc: "Image element" },
          { label: "ul", snippet: '<ul>\n  <li>$0</li>\n</ul>', doc: "Unordered list" },
          { label: "ol", snippet: '<ol>\n  <li>$0</li>\n</ol>', doc: "Ordered list" },
          { label: "li", snippet: '<li>$0</li>', doc: "List item" },
          { label: "section", snippet: '<section class="$1">\n  $0\n</section>', doc: "Thematic section" },
          { label: "header", snippet: '<header class="$1">\n  $0\n</header>', doc: "Page or section header" },
          { label: "footer", snippet: '<footer class="$1">\n  $0\n</footer>', doc: "Page or section footer" },
          { label: "nav", snippet: '<nav class="$1">\n  $0\n</nav>', doc: "Navigation links container" },
          { label: "main", snippet: '<main class="$1">\n  $0\n</main>', doc: "Dominant content section" },
          { label: "script", snippet: '<script src="$1"></script>', doc: "External script" },
          { label: "script:inline", snippet: '<script>\n  $0\n</script>', doc: "Inline script" },
          { label: "style", snippet: '<style>\n  $0\n</style>', doc: "Internal CSS style sheet" },
          { label: "link:css", snippet: '<link rel="stylesheet" href="${1:style.css}">', doc: "CSS stylesheet link" },
          { label: "meta:viewport", snippet: '<meta name="viewport" content="width=device-width, initial-scale=1.0">', doc: "Viewport meta tag" },
          { label: "table", snippet: '<table class="$1">\n  <thead>\n    <tr>\n      <th>$2</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>$0</td>\n    </tr>\n  </tbody>\n</table>', doc: "HTML Table" },
          { label: "html:5", snippet: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${1:Document}</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  $0\n  <script src="script.js"></script>\n</body>\n</html>', doc: "HTML5 Boilerplate template" },
        ];

        const htmlAttrs = [
          { label: "class", snippet: 'class="$1"', doc: "CSS class names" },
          { label: "id", snippet: 'id="$1"', doc: "Element unique ID" },
          { label: "style", snippet: 'style="$1"', doc: "Inline CSS styles" },
          { label: "src", snippet: 'src="$1"', doc: "Source URL" },
          { label: "href", snippet: 'href="$1"', doc: "Destination hyperlink" },
          { label: "alt", snippet: 'alt="$1"', doc: "Alternative text description" },
          { label: "type", snippet: 'type="${1:text}"', doc: "Input or button type" },
          { label: "placeholder", snippet: 'placeholder="$1"', doc: "Placeholder text" },
          { label: "value", snippet: 'value="$1"', doc: "Input element value" },
          { label: "name", snippet: 'name="$1"', doc: "Form field name" },
          { label: "target", snippet: 'target="_blank"', doc: "Link target" },
          { label: "rel", snippet: 'rel="noopener noreferrer"', doc: "Link relationship" },
          { label: "onclick", snippet: 'onclick="$1"', doc: "Click event handler" },
          { label: "disabled", snippet: 'disabled', doc: "Disabled attribute" },
          { label: "required", snippet: 'required', doc: "Required field attribute" },
        ];

        const suggestions = [];

        htmlTags.forEach((tag) => {
          suggestions.push({
            label: tag.label,
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: tag.snippet,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: "HTML Element",
            documentation: tag.doc,
            range,
          });
        });

        htmlAttrs.forEach((attr) => {
          suggestions.push({
            label: attr.label,
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: attr.snippet,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: "HTML Attribute",
            documentation: attr.doc,
            range,
          });
        });

        return { suggestions };
      },
    });

    // 5. Register rich CSS property and value completions
    monaco.languages.registerCompletionItemProvider("css", {
      triggerCharacters: [":", " ", "-", "!", ";"],
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const cssSnippets = [
          { label: "display: flex", snippet: "display: flex;\njustify-content: ${1:center};\nalign-items: ${2:center};$0", doc: "Flexbox layout" },
          { label: "display: grid", snippet: "display: grid;\ngrid-template-columns: repeat(${1:3}, 1fr);\ngap: ${2:1rem};$0", doc: "Grid layout" },
          { label: "margin: auto", snippet: "margin: 0 auto;$0", doc: "Horizontal auto centering" },
          { label: "box-sizing: border-box", snippet: "box-sizing: border-box;$0", doc: "Border-box sizing" },
          { label: "transition: all", snippet: "transition: all ${1:0.2s} ease;$0", doc: "Smooth CSS transition" },
          { label: "transform: translate", snippet: "transform: translate(${1:-50%}, ${2:-50%});$0", doc: "CSS transform translate" },
          { label: "border-radius", snippet: "border-radius: ${1:8px};$0", doc: "Border radius" },
          { label: "box-shadow", snippet: "box-shadow: 0 ${1:4px} ${2:12px} rgba(0, 0, 0, ${3:0.1});$0", doc: "Drop shadow" },
        ];

        return {
          suggestions: cssSnippets.map((s) => ({
            label: s.label,
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: s.snippet,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: "CSS Snippet",
            documentation: s.doc,
            range,
          })),
        };
      },
    });

    // 6. Register rich JavaScript / JSX snippets
    monaco.languages.registerCompletionItemProvider("javascript", {
      triggerCharacters: [".", " ", "(", "{", "=", ">"],
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const jsSnippets = [
          { label: "console.log", snippet: "console.log($1);$0", doc: "Log message to console" },
          { label: "console.error", snippet: "console.error($1);$0", doc: "Log error to console" },
          { label: "document.querySelector", snippet: "document.querySelector('${1:selector}');$0", doc: "Find first DOM element" },
          { label: "document.querySelectorAll", snippet: "document.querySelectorAll('${1:selector}');$0", doc: "Find all DOM elements" },
          { label: "document.getElementById", snippet: "document.getElementById('${1:id}');$0", doc: "Find element by ID" },
          { label: "addEventListener", snippet: "addEventListener('${1:click}', (${2:e}) => {\n  $0\n});", doc: "Attach event listener" },
          { label: "fetch", snippet: "fetch('${1:/api}')\n  .then(res => res.json())\n  .then(data => {\n    $0\n  })\n  .catch(err => console.error(err));", doc: "Fetch HTTP API" },
          { label: "async function", snippet: "async function ${1:name}($2) {\n  $0\n}", doc: "Asynchronous function declaration" },
          { label: "arrow function", snippet: "const ${1:name} = ($2) => {\n  $0\n};", doc: "Arrow function expression" },
          { label: "setTimeout", snippet: "setTimeout(() => {\n  $0\n}, ${1:1000});", doc: "Execute callback after delay" },
          { label: "setInterval", snippet: "setInterval(() => {\n  $0\n}, ${1:1000});", doc: "Execute callback repeatedly" },
          { label: "import React", snippet: "import React, { useState, useEffect } from 'react';$0", doc: "Import React hooks" },
          { label: "useState", snippet: "const [${1:state}, set${1/(.*)/${1:/capitalize}/}] = useState(${2:initialState});$0", doc: "React useState hook" },
          { label: "useEffect", snippet: "useEffect(() => {\n  $0\n}, [${1}]);", doc: "React useEffect hook" },
        ];

        return {
          suggestions: jsSnippets.map((s) => ({
            label: s.label,
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: s.snippet,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: "JavaScript / React",
            documentation: s.doc,
            range,
          })),
        };
      },
    });
  } catch (err) {
    console.error("Monaco language setup error:", err);
  }
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

    // Initialize Monaco language defaults & IntelliSense providers
    setupMonacoLanguageProviders(monaco);

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
          path={activeTab?.name || "untitled"}
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
              other: "on",
              comments: "on",
              strings: "on",
            },
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: "on",
            acceptSuggestionOnCommitCharacter: true,
            tabCompletion: "on",
            wordBasedSuggestions: "allDocuments",
            snippetSuggestions: "top",
            suggest: {
              showWords: true,
              showSnippets: true,
              showClasses: true,
              showFunctions: true,
              showVariables: true,
              showConstants: true,
              showMethods: true,
              showProperties: true,
              showFields: true,
              showEvents: true,
              showOperators: true,
              showUnits: true,
              showValues: true,
              showKeywords: true,
              showColors: true,
              showFiles: true,
              showReferences: true,
              showFolders: true,
              showTypeParameters: true,
              showModules: true,
              snippetsPreventQuickSuggestions: false,
              localityBonus: true,
              shareSuggestSelections: true,
              preview: true,
              previewMode: "prefix",
              showIcons: true,
            },
            parameterHints: { enabled: true },
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
              <Loader2 size={24} className="animate-spin text-zinc-400" />
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
              <span className="ml-1 text-zinc-300">
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
        <div className="pointer-events-none absolute -top-24 h-96 w-96 rounded-full bg-white/[0.02] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 h-96 w-96 rounded-full bg-white/[0.02] blur-3xl" />

        <div className="relative z-10 flex flex-col items-center px-6 text-center">
          <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.02] shadow-xl backdrop-blur-xl">
            <FileCode size={30} className="text-zinc-500" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-2xl border border-white/10"
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
            <span className="flex items-center gap-1 rounded-md border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-zinc-400">
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