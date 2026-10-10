import React from "react";
import { motion } from "motion/react";
import { RefreshCw, FolderTree } from "lucide-react";
import Folder from "./Folder";

function Explorer({ projectId, tree, reloadTree }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex h-full w-64 shrink-0 flex-col overflow-hidden border-r border-white/[0.06] bg-[#111113]"
    >
      <div className="flex h-10 w-full shrink-0 items-center justify-between border-b border-white/[0.06] px-2">
        <span className="text-[11px] font-semibold tracking-wider text-zinc-500">
          Explorer
        </span>

        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92, rotate: -90 }}
          onClick={reloadTree}
          title="Refresh"
          className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 hover:bg-white/[0.06] hover:text-white"
        >
          <RefreshCw size={14} />
        </motion.button>
      </div>

      <div
        className="w-full flex-1 overflow-y-auto px-1 py-2"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255,255,255,0.1) transparent",
        }}
      >
        {!Array.isArray(tree) || tree.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <FolderTree size={28} className="mb-3 text-zinc-600" />
            <p className="text-sm text-zinc-400">No files yet</p>
            <p className="mt-1 text-xs text-zinc-600">
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
            />
          ))
        )}
      </div>
    </motion.div>
  );
}

export default Explorer;
