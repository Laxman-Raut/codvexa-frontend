import React from "react";
import { motion } from "motion/react";
import { RefreshCw } from "lucide-react";
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
    className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 hover:bg-white/[0.06] hover:text-white"
  >
    <RefreshCw size={14} />
  </motion.button>
</div>




</motion.div>
  );
}

export default Explorer;