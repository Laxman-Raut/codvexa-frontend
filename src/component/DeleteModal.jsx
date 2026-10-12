import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Trash2, AlertTriangle, Loader2, FolderClosed } from "lucide-react";
import { getFileIcon, getFolderColor } from "../utils/Customized.icon";

export default function DeleteModal({
  isOpen,
  node,
  loading,
  onClose,
  onConfirm,
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "Enter" && !loading) {
        onConfirm();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose, onConfirm]);

  if (!isOpen) return null;

  const isFolder = node?.type !== "file";

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#161619] p-5 shadow-2xl shadow-black/90"
      >
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
            <Trash2 size={20} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white">
              Delete {isFolder ? "Folder" : "File"}?
            </h3>
            <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="inline-flex items-center gap-1 font-mono text-zinc-200 font-semibold break-all">
                {isFolder ? (
                  <FolderClosed size={13} className={`shrink-0 ${getFolderColor(node?.name)}`} />
                ) : (() => {
                  const { Icon: FileIcon, color: fileColor } = getFileIcon(node?.name);
                  return <FileIcon size={13} className={`shrink-0 ${fileColor || "text-zinc-400"}`} />;
                })()}
                "{node?.name}"
              </span>
              ? {isFolder ? "All files and folders inside will be deleted." : "This action cannot be undone."}
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-rose-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete</span>
            )}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
