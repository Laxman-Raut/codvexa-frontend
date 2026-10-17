import React, { useState } from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { useDispatch } from "react-redux";
import { createproject } from "../features/project";
import { addNewproject } from "../redux/projectslice";
import { createrootFolder } from "../features/file";

function Createprojectmodel({ openModal, onclose }) {
  const [name, setname] = useState("");
  const [description, setdescription] = useState("");
  const [loading, setloading] = useState(false);

  const dispatch = useDispatch();

  const handlecreateproject = async () => {
    setloading(true);

    const data = await createproject({ name, description });

    if (data) {
      await createrootFolder({ projectId: data._id, projectName: data.name });
      dispatch(addNewproject(data));
      onclose();
    }

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

      <div className="pointer-events-none absolute -z-10 h-[460px] w-[460px] rounded-full bg-white/[0.03] blur-[130px]"></div>

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
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/95 shadow-xl backdrop-blur-xl transition-all dark:border-white/10 dark:bg-[#111116] dark:shadow-2xl"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent dark:via-white/10" />

        <div className="flex items-center justify-between border-b border-zinc-200/80 px-6 py-5 dark:border-white/[0.08]">
          <div>
            <h2 className="text-[17px] font-semibold tracking-tight text-zinc-900 dark:text-white">
              Create project
            </h2>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Set up a new workspace in seconds
            </p>
          </div>

          <button
            onClick={onclose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 active:scale-95 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Project Name
            </label>

            <input
              onChange={(e) => setname(e.target.value)}
              placeholder="e.g. Portfolio App"
              autoFocus
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-2xs outline-none transition-all duration-200 placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white/20 dark:focus:ring-white/5"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Description
            </label>

            <textarea
              onChange={(e) => setdescription(e.target.value)}
              rows={3}
              placeholder="What are you building?"
              className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-2xs outline-none transition-all duration-200 placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white/20 dark:focus:ring-white/5"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2.5 border-t border-zinc-200/80 px-6 py-4 dark:border-white/[0.08]">
          <button
            onClick={onclose}
            className="cursor-pointer rounded-xl px-4 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 active:scale-98 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
          >
            Cancel
          </button>

          <button
            onClick={handlecreateproject}
            disabled={loading}
            className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-zinc-900 px-5 py-2 text-sm font-medium text-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-md active:translate-y-0 active:scale-98 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default Createprojectmodel;