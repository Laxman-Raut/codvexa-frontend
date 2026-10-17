import React from "react";
import { motion } from "motion/react";
import { Folder, Star } from "lucide-react";

function Sidebar({ activesession, setActivesession }) {
  return (
    <div className="flex h-full w-64 shrink-0 flex-col border-r border-zinc-200/80 bg-white/70 px-3.5 py-6 font-sans backdrop-blur-xl transition-colors duration-300 dark:border-white/[0.08] dark:bg-[#09090b]/60">

      <div className="flex flex-col gap-1.5">

        <div className="flex flex-col gap-1.5">
          <motion.div
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActivesession("projects")}
            className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
              activesession === "projects"
                ? "bg-zinc-900 text-white shadow-xs dark:bg-white/[0.08] dark:text-white"
                : "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.05] dark:hover:text-white"
            }`}
          >
            <Folder
              size={17}
              strokeWidth={2}
              className="relative"
            />
            <span className="capitalize">projects</span>
          </motion.div>

          <motion.div
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActivesession("starred")}
            className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
              activesession === "starred"
                ? "bg-zinc-900 text-white shadow-xs dark:bg-white/[0.08] dark:text-white"
                : "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.05] dark:hover:text-white"
            }`}
          >
            <Star
              size={17}
              strokeWidth={2}
              className="relative"
            />
            <span className="capitalize">starred</span>
          </motion.div>
        </div>

        <div className="my-4 h-px bg-zinc-200/80 dark:bg-white/[0.08]"></div>

        <div className="group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-4 shadow-xs backdrop-blur-xl transition-all duration-300 hover:border-zinc-300 dark:border-white/[0.08] dark:bg-white/[0.02] dark:hover:border-white/15">
          <div className="relative">
            <span className="inline-block rounded-md border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-300">
              Pro Plan
            </span>

            <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-white">
              Upgrade workspace
            </p>

            <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              Unlock unlimited AI projects, cloud hosting, and premium speed.
            </p>

            <button className="mt-3.5 flex w-full cursor-pointer items-center justify-center rounded-xl bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-md active:translate-y-0 active:scale-98 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
              Upgrade Now
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Sidebar;