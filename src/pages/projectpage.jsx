import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AnimatePresence } from "motion/react";

import TopBar from "../component/TopBar";
import ActivityBar from "../component/ActivityBar";
import Explorer from "../component/Explorer";

import { setcurrentproject } from "../redux/projectslice";
import { getTree } from "../features/file";
import { getprojectById } from "../features/project";
import { buildTree } from "../utils/buildTree";

function ProjectPage() {
  const { id } = useParams();
  const [showExplorer, setShowExplorer] = useState(false);
  const [tree, setTree] = useState([]);
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
      </div>
    </div>
  );
}

export default ProjectPage;