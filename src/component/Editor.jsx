import React, { useState, useEffect, useRef } from "react";
import { updateFile } from "../features/file";
import { getFileIcon } from "../utils/Customized.icon";
import { AnimatePresence, motion } from "motion/react";
import { Check, Loader2, Save, Folder as FolderIcon, FileCode } from "lucide-react";

function Editor({
  file,
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
  setactiveTab: propSetactiveTab,
  openTabs: propOpenTabs,
  setOpenTabs: propSetOpenTabs,
  setOpenTb: propSetOpenTb,
  reloadTree,
}) {
  const activeTab = propActiveTab || file;
  const setactiveTab = propSetactiveTab || propSetActiveTab || (() => {});
  const setOpenTb = propSetOpenTb || propSetOpenTabs || (() => {});

  const [saving, setsaving] = useState(false);
  const [justSaved, setjustSaved] = useState(false);
  const [code, setcode] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (activeTab) {
      setcode(activeTab.content || "");
    } else {
      setcode("");
    }
  }, [activeTab?._id, activeTab?.id, activeTab?.content]);

  const fileIconData = getFileIcon(activeTab?.name || "");
  const AciveIcon = fileIconData?.Icon || fileIconData?.icon || FileCode;
  const activeColor = fileIconData?.color || "text-zinc-400";

  const save = async () => {
    if (!activeTab) return;
    try {
      setsaving(true);
      const fileId = activeTab?._id || activeTab?.id;
      await updateFile({
        name: activeTab?.name,
        content: code,
        id: fileId,
      });

      setactiveTab((prev) =>
        prev ? { ...prev, content: code } : { ...activeTab, content: code }
      );

      setOpenTb((tabs) =>
        tabs.map((t) =>
          (t._id || t.id) === fileId ? { ...t, content: code } : t
        )
      );

      if (reloadTree) {
        await reloadTree();
      }

      setsaving(false);
      setjustSaved(true);

      setTimeout(() => {
        setjustSaved(false);
      }, 1500);
    } catch (error) {
      console.error("Save error:", error);
      setsaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const nextCode = code.substring(0, start) + "  " + code.substring(end);
      setcode(nextCode);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      save();
    }
  };

  const lines = code.split("\n");

  if (!activeTab) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-[#0d0d0f] text-zinc-500">
        <FileCode size={40} className="mb-3 text-zinc-700" />
        <p className="text-sm font-medium text-zinc-400">No file open</p>
        <p className="mt-1 text-xs text-zinc-600">
          Select a file from the explorer to start editing
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#0d0d0f]">
      {/* Editor Header */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#0d0d0f]/90 px-4">
        <div className="flex items-center gap-2 text-zinc-400">
          {activeTab?.parentName && (
            <div className="flex items-center gap-1.5 text-zinc-500">
              <FolderIcon size={13} className="text-amber-400/80" />
              <span className="text-xs font-medium">{activeTab.parentName}</span>
              <span className="text-zinc-600">/</span>
            </div>
          )}

          <AciveIcon size={14} className={activeColor} />

          <span className="text-xs font-medium text-zinc-200">
            {activeTab.name}
          </span>
        </div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={save}
          disabled={saving}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-b from-sky-500 to-sky-600 px-3 py-1.5 text-xs font-medium text-white shadow-[0_1px_0_rgba(255,255,255,0.2)_inset] transition-colors hover:from-sky-400 hover:to-sky-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <AnimatePresence initial={false} mode="wait">
            {saving ? (
              <motion.div
                key="saving"
                initial={{ opacity: 0, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 2 }}
                transition={{ duration: 0.15 }}
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
                transition={{ duration: 0.15 }}
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
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1.5"
              >
                <Save size={13} />
                <span>Save</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Editor Body */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Line Numbers */}
        <div
          className="flex shrink-0 select-none flex-col border-r border-white/[0.04] bg-[#0b0b0d] py-3 pr-3 pl-4 text-right font-mono text-xs leading-6 text-zinc-600"
          style={{ minWidth: "3.5rem" }}
        >
          {lines.map((_, idx) => (
            <span key={idx}>{idx + 1}</span>
          ))}
        </div>

        //monnaco editor
      </div>

      {/* Status Bar */}
      <div className="flex h-6 shrink-0 items-center justify-between border-t border-white/[0.04] bg-[#0a0a0c] px-4 text-[11px] text-zinc-500">
        <div className="flex items-center gap-3">
          <span>Lines: {lines.length}</span>
          <span>Length: {code.length} chars</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="uppercase">{activeTab?.extension || "plaintext"}</span>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  );
}

export default Editor;
