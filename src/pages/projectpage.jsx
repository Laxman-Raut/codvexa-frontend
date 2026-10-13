import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AnimatePresence, motion } from "motion/react";

import TopBar from "../component/TopBar";
import ActivityBar from "../component/ActivityBar";
import Explorer from "../component/Explorer";

import { setcurrentproject } from "../redux/projectslice";
import { getTree } from "../features/file";
import { getprojectById } from "../features/project";
import { buildTree } from "../utils/buildTree";
import { Code2, Eye, Maximize2, Minimize2 } from "lucide-react";
import Preview from "../component/Preview";
import Editor from "../component/Editor";

function ProjectPage() {
  const { id } = useParams();
  const [showExplorer, setShowExplorer] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [isPreviewfullscreen, setisPreviewfullscreen] = useState(false);
  const [tree, setTree] = useState([]);
 const[ openTabs ,setOpenTabs] = useState([])
 const [activeTab , setActiveTab] = useState(null);
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


  const openfle=(File)=>{
    const exist = openTabs.find(tab=>tab._id==File._Id)
    if(!exist)setOpenTabs(prev=>...[prev,file])
      setActiveTab(File)
    setShowPreview(false)
  }
  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-[#080808]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-48 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-white/[0.03] blur-[200px]" />
      </div>

      <TopBar />

      <div className="flex flex-1 overflow-hidden">
        <ActivityBar
          showExplorer={showExplorer}
          setShowExplorer={setShowExplorer}
        />

        <AnimatePresence initial={false}>
          {showExplorer && (
            <Explorer
              projectId={id}
              tree={tree}
              reloadTree={loadTree}
            />
          )}
        </AnimatePresence>

        <div className="relative flex w-full min-w-0 flex-1 flex-col overflow-hidden border-x border-white/[0.05]">
          <div className="pointer-events-none absolute right-2 top-2 z-40 flex items-center gap-1.5 sm:right-4 sm:gap-2">
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
              className="pointer-events-auto flex cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-[#111113]/95 p-1.5 text-zinc-400 shadow-lg shadow-black/40 backdrop-blur-sm hover:text-white sm:p-2"
            >
              {isPreviewfullscreen ? (
                <Minimize2 size={13} />
              ) : (
                <Maximize2 size={13} />
              )}
            </motion.button>

            <div className="pointer-events-auto flex items-center gap-0.5 rounded-lg border border-white/10 bg-[#111113]/95 p-1 shadow-lg shadow-black/40 backdrop-blur">
              <button
                type="button"
                onClick={() => {
                  setShowPreview(false);
                  setisPreviewfullscreen(false);
                }}
                className={`relative flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold transition-colors sm:px-3 sm:py-1.5 sm:text-xs ${
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
                <Code2 size={14} className="relative z-10" />
                <span className="relative z-10">Editor</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className={`relative flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold transition-colors sm:px-3 sm:py-1.5 sm:text-xs ${
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
                <Eye size={14} className="relative z-10" />
                <span className="relative z-10">Preview</span>
              </button>
            </div>
           <div className="flex min-h-0 flex-1 overflow-hidden">
            {showPreview?(
              <Preview tree={tree}/>
            ):<Editor/>}
           </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectPage;