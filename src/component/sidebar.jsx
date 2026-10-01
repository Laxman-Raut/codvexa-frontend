import React from "react";
import { motion } from "motion/react";
import { Folder, Star } from "lucide-react";

function Sidebar({ activesession, setActivesession }) {
  const isActive =
    activesession === "projects" ? "projects" : "starred";

  return (
    <div className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200/70 bg-white/60 px-3 py-5 font-sans backdrop-blur-xl transition-colors duration-300 dark:border-white/[0.06] dark:bg-white/[0.02]">

      <div className="flex flex-col gap-1">

        <div>
          <motion.div
            whileTap={{ scale: 0.97 }}
            onClick={() => setActivesession("projects")}
            className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive === "projects"
                ? "bg-slate-200/70 text-slate-900 dark:bg-white/[0.08] dark:text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/[0.05]"
            }`}
          >
            <Folder
              size={17}
              strokeWidth={2}
              className="relative"
            />
            <span>
              projects
            </span>
          </motion.div>

          <motion.div
            whileTap={{ scale: 0.97 }}
            onClick={() => setActivesession("starred")}
            className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive === "starred"
                ? "bg-slate-200/70 text-slate-900 dark:bg-white/[0.08] dark:text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/[0.05]"
            }`}
          >
            <Star
              size={17}
              strokeWidth={2}
              className="relative"
            />
            <span>
              starred
            </span>
          </motion.div>
        </div>

      </div>

    </div>
  );
}

export default Sidebar;