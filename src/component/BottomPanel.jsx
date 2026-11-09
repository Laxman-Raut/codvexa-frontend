import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { motion } from "motion/react";
import {
  Terminal as TerminalIcon,
  Plus,
  X,
  Trash2,
  RefreshCw,
  Maximize2,
  Minimize2,
  GripHorizontal,
} from "lucide-react";
import TerminalInstance from "./TerminalInstance";
import { me } from "../features/login";

const MIN_H = 140;

function BottomPanel({
  projectId: propProjectId,
  projectName: propProjectName,
  onClose,
}) {
  const { id: paramProjectId } = useParams();
  const projectId = propProjectId || paramProjectId;

  const { userdata } = useSelector((state) => state.user);
  const { currentproject } = useSelector((state) => state.project);

  const projectName = propProjectName || currentproject?.name || "project";

  const reduxUserId = userdata?.userId || userdata?._id || userdata?.id;
  const [fetchedUserId, setFetchedUserId] = useState("");
  const resolvedUserId = reduxUserId ? String(reduxUserId) : fetchedUserId;

  // Fallback: If user is not yet in Redux, retrieve from auth
  useEffect(() => {
    if (reduxUserId) return;

    let isMounted = true;
    me()
      .then((data) => {
        if (!isMounted || !data) return;
        const uid = data.userId || data._id || data.id;
        if (uid) setFetchedUserId(String(uid));
      })
      .catch((err) => {
        console.warn("Could not fetch user info for terminal:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [reduxUserId]);

  const [height, setHeight] = useState(280);
  const [isMaximized, setIsMaximized] = useState(false);
  const [prevHeight, setPrevHeight] = useState(280);
  const [isDragging, setIsDragging] = useState(false);

  // Multi-terminal tabs
  const [tabs, setTabs] = useState([
    { id: "term-1", title: "Terminal 1", status: "connecting" },
  ]);
  const [activeTabId, setActiveTabId] = useState("term-1");

  // Keep references to terminal instances to invoke clear, reconnect, etc.
  const instanceRefs = useRef(new Map());

  const addTab = () => {
    const nextNum = tabs.length + 1;
    const newId = `term-${Date.now()}`;
    const newTab = {
      id: newId,
      title: `Terminal ${nextNum}`,
      status: "connecting",
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
  };

  const closeTab = (e, tabIdToClose) => {
    e.stopPropagation();
    if (tabs.length <= 1) {
      onClose?.();
      return;
    }

    const nextTabs = tabs.filter((t) => t.id !== tabIdToClose);
    instanceRefs.current.delete(tabIdToClose);
    setTabs(nextTabs);

    if (activeTabId === tabIdToClose) {
      setActiveTabId(nextTabs[nextTabs.length - 1].id);
    }
  };

  const handleStatusChange = (tabId, status, message) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === tabId ? { ...t, status, message } : t))
    );
  };

  const handleClear = () => {
    const activeRef = instanceRefs.current.get(activeTabId);
    activeRef?.clear();
  };

  const handleReconnect = () => {
    const activeRef = instanceRefs.current.get(activeTabId);
    activeRef?.reconnect();
  };

  const toggleMaximize = () => {
    if (isMaximized) {
      setHeight(prevHeight);
      setIsMaximized(false);
    } else {
      setPrevHeight(height);
      const maxH = Math.max(MIN_H, Math.floor(window.innerHeight * 0.75));
      setHeight(maxH);
      setIsMaximized(true);
    }
  };

  // Drag-to-resize handle on top edge
  const startDrag = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const startY = e.clientY;
    const startH = height;

    const onPointerMove = (ev) => {
      const delta = startY - ev.clientY;
      const maxH = Math.max(MIN_H, Math.floor(window.innerHeight * 0.88));
      const nextH = Math.min(maxH, Math.max(MIN_H, startH + delta));
      setHeight(nextH);
      setIsMaximized(false);
    };

    const onPointerUp = () => {
      setIsDragging(false);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const userName = userdata?.name || "dev";

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height, opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={
        isDragging ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }
      }
      className="relative flex shrink-0 flex-col overflow-hidden border-t border-white/[0.08] bg-[#0c0c0e] shadow-2xl"
    >
      {/* Top drag handle */}
      <div
        onPointerDown={startDrag}
        className="group absolute inset-x-0 top-0 z-20 flex h-1.5 cursor-row-resize items-center justify-center select-none"
        title="Drag to resize terminal panel"
      >
        <div className="h-0.5 w-full bg-transparent transition-colors group-hover:bg-sky-500/80 group-active:bg-sky-500" />
        <GripHorizontal
          size={12}
          className="absolute text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100"
        />
      </div>

      {/* Dock Bar / Terminal Header */}
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#111113] px-2.5">
        {/* Left side: Terminal tabs */}
        <div className="flex min-w-0 items-center gap-1 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 pr-2 border-r border-white/[0.06] text-zinc-400">
            <TerminalIcon size={14} className="text-emerald-400" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white">
              Terminal
            </span>
          </div>

          {/* Terminal Tabs */}
          <div className="flex items-center gap-1">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              const statusColor =
                tab.status === "connected"
                  ? "bg-emerald-400"
                  : tab.status === "connecting" || tab.status === "syncing"
                  ? "bg-amber-400 animate-pulse"
                  : "bg-red-400";

              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`group flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1 text-xs transition-all ${
                    isActive
                      ? "bg-[#1f1f23] text-white shadow-xs"
                      : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusColor}`}
                    title={`Status: ${tab.status || "unknown"}`}
                  />
                  <span className="font-mono text-[11px] font-medium">
                    {tab.title}
                  </span>
                  {tabs.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => closeTab(e, tab.id)}
                      title="Kill terminal tab"
                      className="rounded p-0.5 text-zinc-500 opacity-60 hover:bg-white/10 hover:text-white hover:opacity-100 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Add Tab Button */}
            <button
              type="button"
              onClick={addTab}
              title="New Terminal"
              className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Plus size={13} />
            </button>
          </div>
        </div>

        {/* Right side: Actions & Controls */}
        <div className="flex shrink-0 items-center gap-1.5 pl-2">
          {/* User & Project badge */}
          <span className="hidden sm:inline-block font-mono text-[11px] text-zinc-500 border-r border-white/[0.06] pr-2.5">
            {userName}@{projectName}
          </span>

          {/* Reconnect button */}
          <button
            type="button"
            onClick={handleReconnect}
            title="Restart / Reconnect terminal"
            className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 hover:bg-white/10 hover:text-zinc-200 transition-colors"
          >
            <RefreshCw size={12} />
          </button>

          {/* Clear terminal button */}
          <button
            type="button"
            onClick={handleClear}
            title="Clear terminal (Ctrl+L)"
            className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 hover:bg-white/10 hover:text-zinc-200 transition-colors"
          >
            <Trash2 size={12} />
          </button>

          {/* Maximize / Restore button */}
          <button
            type="button"
            onClick={toggleMaximize}
            title={isMaximized ? "Restore terminal panel" : "Maximize terminal panel"}
            className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 hover:bg-white/10 hover:text-zinc-200 transition-colors"
          >
            {isMaximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>

          {/* Close panel button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              title="Close terminal panel"
              className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Terminal Viewports Container */}
      <div className="relative flex-1 overflow-hidden bg-[#0c0c0e]">
        {tabs.map((tab) => (
          <TerminalInstance
            key={tab.id}
            ref={(el) => {
              if (el) {
                instanceRefs.current.set(tab.id, el);
              } else {
                instanceRefs.current.delete(tab.id);
              }
            }}
            projectId={projectId}
            userId={resolvedUserId}
            isActive={tab.id === activeTabId}
            onStatusChange={(status, msg) =>
              handleStatusChange(tab.id, status, msg)
            }
          />
        ))}
      </div>
    </motion.div>
  );
}

export default BottomPanel;
