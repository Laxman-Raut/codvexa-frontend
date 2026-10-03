import React, { useState } from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { useDispatch } from "react-redux";
import { createproject } from "../features/project";
import { addNewproject } from "../redux/projectslice";

function Createprojectmodel({ openmodel, onclose }) {
  const [name, setname] = useState("");
  const [description, setdescription] = useState("");
  const [loading, setloading] = useState(false);

  const dispatch = useDispatch();

  const handlecreateproject = async () => {
    setloading(true);

    const data = await createproject({ name, description });
    onclose()

    dispatch(addNewproject(data));

    setloading(false);
  };

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
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 px-7 py-6">
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              project name
            </label>

            <input
              onChange={(e) => setname(e.target.value)}
              placeholder="My awesome project"
              autoFocus
              className="w-full rounded-xl border border-zinc-200 bg-white/80 px-4 py-3 text-sm text-zinc-900 outline-none transition-all duration-200 placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-900/5 dark:border-white/10 dark:bg-white/[0.05] dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white/20 dark:focus:ring-white/5"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Description
            </label>

            <textarea
              onChange={(e) => setdescription(e.target.value)}
              rows={3}
              placeholder="Description"
              className="w-full resize-none rounded-xl border border-zinc-200 bg-white/80 px-4 py-3 text-sm text-zinc-900 outline-none transition-all duration-200 placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-900/5 dark:border-white/10 dark:bg-white/[0.05] dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white/20 dark:focus:ring-white/5"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-black/[0.06] px-7 py-5 dark:border-white/[0.08]">
          <button
            onClick={onclose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/10"
          >
            Cancel
          </button>

          <button
            onClick={handlecreateproject}
            disabled={loading}
            className="rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default Createprojectmodel;