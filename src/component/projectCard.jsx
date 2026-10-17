import React, { useState } from "react";
import { motion } from "motion/react";
import { Star } from "lucide-react";
import { useDispatch } from "react-redux";
import { deleteproject, togglestar } from "../features/project";
import { removeProject, setcurrentproject, starproject } from "../redux/projectslice";
import { useNavigate } from "react-router-dom";

function ProjectCard({ project }) {
  const [loadingStar, setLoadingStar] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handletogglestar = async (e) => {
    e.stopPropagation();
    setLoadingStar(true);

    const data = await togglestar(project?._id);

    if (data) {
      dispatch(starproject(data));
    }

    setLoadingStar(false);
  };

  const handledelete = async (e) => {
    e.stopPropagation();
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
      onClick={() => {
        
        navigate(`/project/${project._id}`);
      }}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/70 p-5 shadow-xs backdrop-blur-xl transition-all duration-200 hover:border-zinc-300 hover:bg-white hover:shadow-md dark:border-white/[0.08] dark:bg-white/[0.02] dark:hover:border-white/20 dark:hover:bg-white/[0.05] dark:hover:shadow-lg"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-300 to-transparent dark:via-white/10" />

      <motion.button
        onClick={handletogglestar}
        disabled={loadingStar}
        whileTap={{ scale: 0.9 }}
        className={`absolute right-3.5 top-3.5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl transition-colors hover:text-zinc-900 disabled:opacity-50 dark:hover:text-white ${project?.starred ? "text-amber-500" : "text-zinc-400"}`}
      >
        <Star size={17} fill={project?.starred ? "currentColor" : "none"} />
      </motion.button>

      <h3 className="pr-8 text-sm font-semibold text-zinc-900 dark:text-white">
        {project?.name}
      </h3>

      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
        {project?.description || "No description"}
      </p>

      <button
        onClick={handledelete}
        disabled={loadingDelete}
        className="mt-4 inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-zinc-400 transition-colors hover:text-red-500 disabled:opacity-50 dark:text-zinc-500 dark:hover:text-red-400"
      >
        {loadingDelete ? "Deleting..." : "Delete"}
      </button>
    </motion.div>
  );
}

export default ProjectCard;
