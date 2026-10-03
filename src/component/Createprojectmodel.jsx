import React from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";

function Createprojectmodel({ openmodel, onclose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        onClick={onclose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm dark:bg-black/60"
      />

      <div className="pointer-events-none absolute -z-10 h-[460px] w-[460px] rounded-full bg-sky-300/20 blur-[130px] dark:bg-sky-500/10"></div>

      <motion.div
        initial={{
          opacity: 0,
          y: 10,
          scale: 0.98,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          y: 10,
          scale: 0.98,
        }}
        transition={{
          duration: 0.2,
          ease: "easeOut",
        }}
        className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-black/[0.08] bg-white/70 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] backdrop-blur-2xl dark:border-white/[0.1] dark:bg-white/[0.05] dark:shadow-[0_20px_70px_-15px_rgba(0,0,0,0.7)]"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/30" />

        <div className="flex items-center justify-between border-b border-black/[0.06] px-7 py-6 dark:border-white/[0.08]">
          <div>
            <h2 className="text-[17px] font-semibold tracking-tight text-zinc-900 dark:text-white">
              Create project
            </h2>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              set up a new workplace in seconds
            </p>
          </div>

          <button onClick={onclose}>
            <X  size={18}/>
          </button>
        </div>
      <div className="space-y-6 px-7 py-6">
  <div>
    <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
      project name
    </label>

    <input
      placeholder="My awesome project"
      autoFocus
      className="w-full rounded-xl border border-zinc-200 bg-white/80 px-4 py-3 text-sm text-zinc-900 outline-none transition-all duration-200 placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-900/5 dark:border-white/10 dark:bg-white/[0.05] dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white/20 dark:focus:ring-white/5"
    />
  </div>
<div>
    <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
      Description
    </label>

    <input
      placeholder="Description"
      autoFocus
      className="w-full rounded-xl border border-zinc-200 bg-white/80 px-4 py-3 text-sm text-zinc-900 outline-none transition-all duration-200 placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-900/5 dark:border-white/10 dark:bg-white/[0.05] dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white/20 dark:focus:ring-white/5"
    />
  </div>
</div>
      </motion.div>
    </div>
  );
}

export default Createprojectmodel;