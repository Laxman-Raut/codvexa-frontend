import React, { useState } from "react";
import { Bot, Files } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

function ActivityIcon({ icon: Icon, label, active, onClick }) {
  const [hovered, setHovered] = useState(false);
  

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.15 }}
        onClick={onClick}
        className={`relative flex h-10 w-10 items-center justify-center rounded-lg ${
          active
            ? "text-white"
            : "text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-300"
        }`}
      >
        {active && (
          <motion.div
            layoutId="activity-active"
            className="absolute inset-0 rounded-lg bg-white/[0.06]"
          />
        )}

        <Icon size={20} className="relative z-10" />
      </motion.button>

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute left-12 top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-md border border-white/[0.08] bg-[#1a1a1c] px-2.5 py-1.5 text-xs text-white shadow-xl"
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActivityBar() {
  const [showexplorer, setshowExplorer] = useState(false);
  const [showaichat, setShowAichat] = useState(false);

  return (
    <div className="flex w-14 shrink-0 flex-col items-center gap-2 border-r border-white/[0.06] bg-[#111113] py-3">
      <ActivityIcon
        icon={Files}
        label="Explorer"
        active={showexplorer}
        onClick={() => setshowExplorer((v) => !v)}
      />

      <ActivityIcon
        icon={Bot}
        label="AI Chat"
        active={showaichat}
        onClick={() => setShowAichat((v) => !v)}
      />
    </div>
  );
}

export default ActivityBar;