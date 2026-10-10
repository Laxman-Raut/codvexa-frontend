import React, { useState } from "react";
import { ChevronRight, Folder as FolderIcon, FileText, FolderOpen, FolderClosed } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import getFolderColor from "../utils/Customized.icon";

function Folder({ node, projectId, reloadTree }) {
  const [open, setOpen] = useState(false);

  const isFolder = node?.type !== "file";
  const folderColor = getFolderColor(node?.name);

  return (
    <div className="relative">
      <motion.div
        whileHover={{ x: 2 }}
        transition={{ duration: 0.15, ease: "easeInOut" }}
        className="group flex items-center justify-between rounded-lg py-1.5 hover:bg-white/[0.05] transition-colors"
        onContextMenu={(e) => {
          e.preventDefault();
          console.log({ x: e.clientX, y: e.clientY });
        }}
      >
        <div
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-1.5"
          onClick={() => {
            if (isFolder) setOpen(!open);
          }}
        >
          {isFolder ? (
            <motion.div
              animate={{ rotate: open ? 90 : 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="shrink-0"
            >
              <ChevronRight size={14} className="text-zinc-500" />
            </motion.div>
          ) : (
            <div className="w-3.5 shrink-0" />
          )}

          {isFolder ? (
            open ? (
              <FolderOpen size={16} className={`shrink-0 ${folderColor}`} />
            ) : (
              <FolderClosed size={16} className={`shrink-0 ${folderColor}`} />
            )
          ) : (
            <FileText size={15} className="shrink-0 text-zinc-400" />
          )}

          <span className="truncate text-[13px] text-zinc-300 transition-colors group-hover:text-white">
            {node?.name}
          </span>
        </div>
      </motion.div>

      <AnimatePresence>
        {open && isFolder && node?.children && node.children.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="pl-3"
          >
            {node.children.map((child) => (
              <Folder
                key={child._id || child.id}
                node={child}
                projectId={projectId}
                reloadTree={reloadTree}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Folder;
