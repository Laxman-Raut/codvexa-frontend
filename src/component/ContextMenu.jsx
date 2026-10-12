import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  FilePlus2,
  FolderPlus,
  Pencil,
  Trash2,
  Copy,
  Check,
  FolderClosed,
} from "lucide-react";
import { getFileIcon, getFolderColor } from "../utils/Customized.icon";

export default function ContextMenu({
  x,
  y,
  node,
  onClose,
  onNewFile,
  onNewFolder,
  onRename,
  onDelete,
}) {
  const menuRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [coords, setCoords] = useState({ x, y });

  const isFolder = node?.type !== "file";

  // Prevent menu from overflowing viewport
  useLayoutEffect(() => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const padding = 8;
    let safeX = x;
    let safeY = y;

    if (x + rect.width > window.innerWidth - padding) {
      safeX = Math.max(padding, window.innerWidth - rect.width - padding);
    }
    if (y + rect.height > window.innerHeight - padding) {
      safeY = Math.max(padding, window.innerHeight - rect.height - padding);
    }

    setCoords({ x: safeX, y: safeY });
  }, [x, y]);

  // Click outside and keydown listeners
  useEffect(() => {
    const handlePointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleScrollOrResize = () => {
      onClose();
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [onClose]);

  const handleCopyName = async (e) => {
    e.stopPropagation();
    if (node?.name) {
      try {
        await navigator.clipboard.writeText(node.name);
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
          onClose();
        }, 600);
      } catch (err) {
        console.error("Failed to copy:", err);
        onClose();
      }
    }
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.94, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.12, ease: "easeOut" }}
        style={{ left: coords.x, top: coords.y }}
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
        className="fixed z-[9999] min-w-[190px] select-none rounded-xl border border-white/10 bg-[#141416]/95 p-1 text-[12.5px] font-medium text-zinc-300 shadow-2xl shadow-black/80 backdrop-blur-xl"
      >
        {/* Header with node icon and title */}
        <div className="flex items-center gap-1.5 border-b border-white/[0.07] px-2.5 py-1.5 pb-2 text-[11px] font-semibold text-zinc-400">
          {isFolder ? (
            <FolderClosed
              size={13}
              className={`shrink-0 ${getFolderColor(node?.name)}`}
            />
          ) : (() => {
            const { Icon: FileIcon, color: fileColor } = getFileIcon(node?.name);
            return (
              <FileIcon
                size={13}
                className={`shrink-0 ${fileColor || "text-zinc-400"}`}
              />
            );
          })()}
          <span className="truncate max-w-[150px] font-mono text-zinc-300">
            {node?.name || "Item"}
          </span>
        </div>

        <div className="mt-1 space-y-0.5">
          {isFolder && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNewFile();
                  onClose();
                }}
                className="group flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <div className="flex items-center gap-2">
                  <FilePlus2
                    size={14}
                    className="text-zinc-400 transition-colors group-hover:text-sky-400"
                  />
                  <span>New File</span>
                </div>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNewFolder();
                  onClose();
                }}
                className="group flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <div className="flex items-center gap-2">
                  <FolderPlus
                    size={14}
                    className="text-zinc-400 transition-colors group-hover:text-amber-400"
                  />
                  <span>New Folder</span>
                </div>
              </button>

              <div className="my-1 h-px bg-white/[0.07]" />
            </>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRename();
              onClose();
            }}
            className="group flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <div className="flex items-center gap-2">
              <Pencil
                size={14}
                className="text-zinc-400 transition-colors group-hover:text-zinc-200"
              />
              <span>Rename</span>
            </div>
            <span className="text-[10px] text-zinc-600 group-hover:text-zinc-400">
              Enter
            </span>
          </button>

          <button
            type="button"
            onClick={handleCopyName}
            className="group flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <div className="flex items-center gap-2">
              {copied ? (
                <Check size={14} className="text-emerald-400" />
              ) : (
                <Copy
                  size={14}
                  className="text-zinc-400 transition-colors group-hover:text-zinc-200"
                />
              )}
              <span>{copied ? "Copied!" : "Copy Name"}</span>
            </div>
          </button>

          <div className="my-1 h-px bg-white/[0.07]" />

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
              onClose();
            }}
            className="group flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-rose-400/90 transition-colors hover:bg-rose-500/15 hover:text-rose-300"
          >
            <div className="flex items-center gap-2">
              <Trash2
                size={14}
                className="text-rose-400/80 transition-colors group-hover:text-rose-300"
              />
              <span>Delete</span>
            </div>
            <span className="text-[10px] text-rose-500/60 group-hover:text-rose-400/80">
              Del
            </span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
