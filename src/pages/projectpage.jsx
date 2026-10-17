import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AnimatePresence, motion } from "motion/react";

import TopBar from "../component/TopBar";
import ActivityBar from "../component/ActivityBar";
import Explorer from "../component/Explorer";

import { setcurrentproject } from "../redux/projectslice";
import { getTree, getFile } from "../features/file";
import { getprojectById } from "../features/project";
import { buildTree } from "../utils/buildTree";
import { Code2, Eye, Maximize2, Minimize2, X } from "lucide-react";
import { getFileIcon } from "../utils/Customized.icon";
import Preview from "../component/Preview";
import Editor from "../component/Editor";
import BottomPanel from "../component/bottompanel";
import AiChat from "../component/AiChat";

function ProjectPage() {
  const { id } = useParams();
  const [showExplorer, setShowExplorer] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [isPreviewfullscreen, setisPreviewfullscreen] = useState(false);
  const [tree, setTree] = useState([]);
  const [openTabs, setOpenTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [showBpttomPanel , setShowBottomPanel]= useState(false)
  const dispatch = useDispatch();

  const loadTree = useCallback(async () => {
    const data = await getTree(id);
    setTree(buildTree(data));
  }, [id]);

  useEffect(() => {
    const handleGetProject = async () => {
      const data = await getprojectById(id);
      dispatch(setcurrentproject(data));
    };

    handleGetProject();
    loadTree();
  }, [id, dispatch, loadTree]);

  const openFile = async (file) => {
    if (!file) return;
    const fileId = (file._id || file.id)?.toString() || file.name;
    const exist = openTabs.find(
      (tab) => ((tab._id || tab.id)?.toString() || tab.name) === fileId
    );

    let targetFile = exist || file;

    // If content is undefined and we have an ID, load full file data
    if (targetFile.content === undefined && (targetFile._id || targetFile.id)) {
      try {
        const full = await getFile({ id: targetFile._id || targetFile.id });
        if (full) {
          targetFile = { ...targetFile, ...full };
        }
      } catch (err) {
        console.error("Error loading file content:", err);
      }
    }

    if (!exist) {
      setOpenTabs((prev) => [...prev, targetFile]);
    } else {
      setOpenTabs((prev) =>
        prev.map((t) =>
          ((t._id || t.id)?.toString() || t.name) === fileId ? targetFile : t
        )
      );
    }
    setActiveTab(targetFile);
    setShowPreview(false);
  };

  const openfle = openFile;

  const closeTab = (e, fileToClose) => {
    e.stopPropagation();
    const closeId = fileToClose._id || fileToClose.id || fileToClose.name;
    const nextTabs = openTabs.filter(
      (tab) => (tab._id || tab.id || tab.name) !== closeId
    );
    setOpenTabs(nextTabs);
    if ((activeTab?._id || activeTab?.id || activeTab?.name) === closeId) {
      setActiveTab(nextTabs.length > 0 ? nextTabs[nextTabs.length - 1] : null);
    }
  };

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-[#080808]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-48 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-white/[0.03] blur-[200px]" />
      </div>

      <TopBar showPreview={showPreview} setShowPreview={setShowPreview} />

      <div className="flex flex-1 overflow-hidden">
        <ActivityBar
          showExplorer={showExplorer}
          setShowExplorer={setShowExplorer}
          showTerminal={showBpttomPanel}
          setShowTerminal={setShowBottomPanel}
          showAiChat={showAiChat}
          setShowAiChat={setShowAiChat}
        />

        <AnimatePresence initial={false}>
          {showExplorer && (
            <Explorer
              projectId={id}
              tree={tree}
              reloadTree={loadTree}
              openFile={openFile}
              openfile={openFile}
              openfle={openfle}
              activeTab={activeTab}
            />
          )}
        </AnimatePresence>

        <div className="relative flex w-full min-w-0 flex-1 flex-col overflow-hidden border-x border-white/[0.05]">
          {/* Top VS Code-style tabs bar */}
          <div className="flex h-9 w-full shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#0d0d0f]/90">
            {/* Open tabs list */}
            <div
              className="flex h-full min-w-0 flex-1 items-center overflow-x-auto"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {openTabs.map((tab) => {
                const isActive =
                  (activeTab?._id || activeTab?.id || activeTab?.name) ===
                  (tab._id || tab.id || tab.name);
                const { Icon: TabIcon, color: iconColor } = getFileIcon(
                  tab?.name || ""
                );

                return (
                  <div
                    key={tab._id || tab.id || tab.name}
                    onClick={() => {
                      setActiveTab(tab);
                      setShowPreview(false);
                    }}
                    className={`group flex h-full cursor-pointer items-center gap-2 border-r border-white/[0.06] px-3 text-xs transition-colors ${
                      isActive
                        ? "border-t-2 border-t-white bg-[#18181b] text-white font-medium"
                        : "border-t-2 border-t-transparent bg-[#111113]/50 text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                    }`}
                  >
                    {TabIcon && (
                      <TabIcon
                        size={14}
                        className={`shrink-0 ${iconColor || ""}`}
                      />
                    )}
                    <span className="max-w-[130px] truncate font-medium">
                      {tab?.name || "untitled"}
                    </span>
                    <button
                      type="button"
                      title="Close"
                      onClick={(e) => closeTab(e, tab)}
                      className="ml-1 rounded p-0.5 text-zinc-500 opacity-60 hover:bg-white/10 hover:text-white hover:opacity-100 group-hover:opacity-100"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}

              {openTabs.length === 0 && (
                <div className="flex h-full items-center px-3 text-xs italic text-zinc-600">
                  No open tabs
                </div>
              )}
            </div>

            {/* Right-side controls (Editor/Preview toggle & fullscreen button) */}
            <div className="flex shrink-0 items-center gap-1.5 px-2">
              <div className="flex items-center gap-0.5 rounded-lg border border-white/10 bg-[#111113]/95 p-0.5 shadow-lg shadow-black/40 backdrop-blur">
                <button
                  type="button"
                  onClick={() => {
                    setShowPreview(false);
                    setisPreviewfullscreen(false);
                  }}
                  className={`relative flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold transition-colors sm:px-3 sm:py-1 sm:text-xs ${
                    !showPreview
                      ? "text-white"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {!showPreview && (
                    <motion.div
                      layoutId="preview-tab"
                      className="absolute inset-0 rounded-md bg-gradient-to-b from-zinc-700 to-zinc-800"
                      transition={{
                        type: "spring",
                        duration: 0.4,
                        bounce: 0.15,
                      }}
                    />
                  )}
                  <Code2 size={13} className="relative z-10" />
                  <span className="relative z-10">Editor</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className={`relative flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold transition-colors sm:px-3 sm:py-1 sm:text-xs ${
                    showPreview
                      ? "text-white"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {showPreview && (
                    <motion.div
                      layoutId="preview-tab"
                      className="absolute inset-0 rounded-md bg-gradient-to-b from-zinc-700 to-zinc-800"
                      transition={{
                        type: "spring",
                        duration: 0.4,
                        bounce: 0.15,
                      }}
                    />
                  )}
                  <Eye size={13} className="relative z-10" />
                  <span className="relative z-10">Preview</span>
                </button>
              </div>

              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                title={
                  isPreviewfullscreen
                    ? "Exit fullscreen"
                    : "Fullscreen preview"
                }
                onClick={() => setisPreviewfullscreen((v) => !v)}
                className="flex cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-[#111113]/95 p-1.5 text-zinc-400 shadow-lg shadow-black/40 backdrop-blur-sm hover:text-white"
              >
                {isPreviewfullscreen ? (
                  <Minimize2 size={13} />
                ) : (
                  <Maximize2 size={13} />
                )}
              </motion.button>
            </div>
          </div>

          {/* Active file breadcrumb (VS Code style) */}
          {activeTab && !showPreview && (
            <div className="flex h-6 shrink-0 items-center gap-1.5 border-b border-white/[0.04] bg-[#0c0c0e]/40 px-3 text-[11px] text-zinc-500">
              <span className="text-zinc-400 font-medium">
                {activeTab.name}
              </span>
            </div>
          )}

          {/* Main workspace view (Editor or Preview) */}
          <div className="flex min-h-0 flex-1 overflow-hidden">
            {showPreview ? (
              <Preview
                tree={tree}
                openTabs={openTabs}
                activeTab={activeTab}
                onClose={() => setShowPreview(false)}
                isFullscreen={isPreviewfullscreen}
                setIsFullscreen={setisPreviewfullscreen}
              />
            ) : (
              <Editor
                file={activeTab}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                setactiveTab={setActiveTab}
                openTabs={openTabs}
                setOpenTabs={setOpenTabs}
                setOpenTb={setOpenTabs}
                reloadTree={loadTree}
              />
            )}
          </div>

          <AnimatePresence>
            {showBpttomPanel &&(
              <div className="max-h-[45vh] md:max-h-none">
                <BottomPanel
                projectId={id}/>

              </div>
            )}
          </AnimatePresence>
        </div>
<div className="w-full md:flex md:w-auto">

<AnimatePresence  initial={false}>
{showAiChat &&(
  <AiChat
  projectId/>
)}

</AnimatePresence>

</div>

      </div>
    </div>
  );
}

export default ProjectPage;