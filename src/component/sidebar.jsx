import React from "react";
import { motion } from "motion/react";
import { Folder, Star } from "lucide-react";

function Sidebar({ activesession, setActivesession }) {
  return (
    <div className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200/70 bg-white/60 px-3 py-5 font-sans backdrop-blur-xl transition-colors duration-300 dark:border-white/[0.06] dark:bg-white/[0.02]">

      <div className="flex flex-col gap-1">

        <div className="flex flex-col gap-1">
          <motion.div
            whileTap={{ scale: 0.97 }}
            onClick={() => setActivesession("projects")}
            className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              activesession === "projects"
                ? "bg-slate-200/70 text-slate-900 dark:bg-white/[0.08] dark:text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/[0.05]"
            }`}
          >
            <Folder
              size={17}
              strokeWidth={2}
              className="relative"
            />
            <span>projects</span>
          </motion.div>

          <motion.div
            whileTap={{ scale: 0.97 }}
            onClick={() => setActivesession("starred")}
            className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              activesession === "starred"
                ? "bg-slate-200/70 text-slate-900 dark:bg-white/[0.08] dark:text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/[0.05]"
            }`}
          >
            <Star
              size={17}
              strokeWidth={2}
              className="relative"
            />
            <span>starred</span>
          </motion.div>
        </div>

        <div className="my-4 h-px bg-slate-200/70 dark:bg-white/[0.06]"></div>

        <div className="rounded-xl border border-slate-200/70 bg-white/70 p-3.5 shadow-sm backdrop-blur-xl dark:border-white/[0.07] dark:bg-white/[0.03] dark:shadow-none">
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            Upgrade plan
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            Unlock more features and build without limits.
          </p>

          <button className="mt-3 w-full rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
            Upgrade
          </button>
        </div>

      </div>

    </div>
  );
}

export default Sidebar;