import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Folder } from "lucide-react";
import { motion } from "motion/react";

function TopBar() {
  const { currentproject } = useSelector((state) => state.project);
  const [showpreview, setshowpreview] = useState(false);

  return (
    <div className="relative flex h-12 items-center justify-between border-b border-white/[0.06] bg-[#111113]/90 px-4 backdrop-blur-xl">

      <div className="flex items-center gap-4">
        <div className="text-[15px] font-semibold tracking-tight text-white">
          codvexa
        </div>

        <div className="h-4 w-px bg-white/[0.08]" />

        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.05]">
            <Folder size={14} className="text-zinc-400" />
          </div>

          <span className="text-sm font-medium text-zinc-300">
            {currentproject?.name || "project"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <motion.button
          whileHover={{
            scale: 1.05,
           
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.15 }}
          onClick={() => setshowpreview(!showpreview)}
          className="relative flex items-center justify-center rounded-lg =-2 transition-colors{showpreview"
        >
        </motion.button>
      </div>

    </div>
  );
}

export default TopBar;