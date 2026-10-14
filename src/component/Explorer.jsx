import React from "react";
import { motion } from "motion/react";
import { RefreshCw, FolderTree } from "lucide-react";
import Folder from "./Folder";

function Explorer({ projectId, tree, reloadTree, openFile, openfile, openfle, activeTab }) {
  const handleOpenFile = openFile || openfile || openfle;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex h-full w-64 shrink-0 flex-col overflow-hidden border-r border-white/[0.06] bg-[#111113]"
    >
      <div className="flex h-10 w-full shrink-0 items-center justify-between border-b border-white/[0.06] px-3 bg-[#111113]/90">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Explorer
          </span>
          {Array.isArray(tree) && tree.length > 0 && (
            <span className="rounded-full bg-white/[0.06] px-1.5 py-0.2 text-[10px] font-medium text-zinc-500">
              {tree.length}
            </span>
          )}
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92, rotate: 180 }}
          onClick={reloadTree}
          title="Refresh Explorer"
          className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-white/[0.08] hover:text-white"
        >
          <RefreshCw size={13} />
        </motion.button>
      </div>

      <div
        className="w-full flex-1 overflow-y-auto px-1.5 py-2"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255,255,255,0.1) transparent",
        }}
      >
        {!Array.isArray(tree) || tree.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-3">
              <FolderTree size={24} className="text-zinc-500" />
            </div>
            <p className="text-xs font-semibold text-zinc-300">No files yet</p>
            <p className="mt-1 text-[11px] text-zinc-500">
              Create a file or folder to get started
            </p>
          </div>
        ) : (
          tree.map((node) => (
            <Folder
              key={node._id || node.id}
              node={node}
              projectId={projectId}
              reloadTree={reloadTree}
              openFile={handleOpenFile}
              activeTab={activeTab}
            />
          ))
        )}
      </div>
    </motion.div>
  );
}

export default Explorer;
