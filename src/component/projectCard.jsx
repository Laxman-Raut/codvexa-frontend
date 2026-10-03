import React, { useState } from "react";
import { motion } from "motion/react";
import { Star } from "lucide-react";
import { useDispatch } from "react-redux";
import { deleteproject, togglestar } from "../features/project";
import { updateProject, removeProject } from "../redux/projectslice";

function ProjectCard({ project }) {
  const [loadingStar, setLoadingStar] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const dispatch = useDispatch();

  const handletogglestar = async () => {
    setLoadingStar(true);

    const data = await togglestar(project?._id);

    if (data) {
      dispatch(updateProject(data));
    }

    setLoadingStar(false);
  };

  const handledelete = async () => {
    setLoadingDelete(true);

    const data = await deleteproject(project?._id);

    if (data) {
      dispatch(removeProject(project?._id));
    }

    setLoadingDelete(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{
        opacity: 0,
        y: 10,
        scale: 0.98,
      }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-black/[0.08] bg-white/70 p-5 shadow-sm backdrop-blur-xl transition-all duration-200 hover:shadow-lg dark:border-white/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.06]"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent dark:via-white/20" />

      <motion.button
        onClick={handletogglestar}
        disabled={loadingStar}
        whileTap={{ scale: 0.9 }}
        className="absolute right-4 top-4 text-zinc-400 transition-colors hover:text-yellow-500 disabled:opacity-50"
      >
        <Star
          size={18}
          fill={project?.starred ? "currentColor" : "none"}
        />
      </motion.button>

      <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
        {project?.name}
      </h3>

      <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
        {project?.description || "No description"}
      </p>

      <button
        onClick={handledelete}
        disabled={loadingDelete}
        className="mt-4 text-xs text-red-500 hover:text-red-600 disabled:opacity-50"
      >
        {loadingDelete ? "Deleting..." : "Delete"}
      </button>
    </motion.div>
  );
}

export default ProjectCard;