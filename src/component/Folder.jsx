import React, { useState, useRef, useEffect } from "react";
import {
  ChevronRight,
  FolderOpen,
  FolderClosed,
  FilePlus2,
  FolderPlus,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getFileIcon, getFolderColor } from "../utils/Customized.icon";
import {
  createFile,
  createFolder,
  updateFile,
  deleteFile,
} from "../features/file";
import ContextMenu from "./ContextMenu";
import DeleteModal from "./DeleteModal";

function Folder({ node, projectId, reloadTree }) {
  const isFolder = node?.type !== "file";
  const isRoot = !node?.parentId;

  // Root folders open by default, nested folders start closed
  const [open, setOpen] = useState(isRoot);

  // Context menu position { x, y } | null
  const [menu, setMenu] = useState(null);

  // Inline rename state
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(node?.name || "");
  const renameInputRef = useRef(null);

  // Delete modal state
  const [isDeleting, setIsDeleting] = useState(false);

  // File creation state
  const [creatingFile, setCreatingFile] = useState(false);
  const [fileName, setFileName] = useState("");

  // Folder creation state
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [folderName, setFolderName] = useState("");

  const [loading, setLoading] = useState(false);

  const folderColor = getFolderColor(node?.name);
  const { Icon: FileIcon, color: fileColor } = getFileIcon(node?.name);
  // Icon for the "new file" input updates live as the user types (e.g. app.js -> JS logo)
  const { Icon: NewFileIcon, color: newFileColor } = getFileIcon(fileName);

  const hasChildren = node?.children?.length > 0;
  const nodeId = node?._id || node?.id;

  // Auto-focus and select text when entering rename mode
  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus();
      const dotIndex = node?.name?.lastIndexOf(".");
      if (!isFolder && dotIndex > 0) {
        renameInputRef.current.setSelectionRange(0, dotIndex);
      } else {
        renameInputRef.current.select();
      }
    }
  }, [isRenaming, isFolder, node?.name]);

  // ---------- Context Menu ----------
  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMenu({ x: e.clientX, y: e.clientY });
  };

  // ---------- File Creation ----------
  const startCreatingFile = () => {
    setOpen(true);
    setCreatingFolder(false);
    setFolderName("");
    setCreatingFile(true);
    setFileName("");
  };

  const cancelCreatingFile = () => {
    setCreatingFile(false);
    setFileName("");
  };

  const handleCreateFile = async () => {
    const name = fileName.trim();
    if (!name || loading) return;

    setLoading(true);
    const result = await createFile({ projectId, name, parentId: nodeId });
    setLoading(false);

    if (!result) return; // request failed: keep the input open to retry
    await reloadTree();
    cancelCreatingFile();
  };

  // ---------- Folder Creation ----------
  const startCreatingFolder = () => {
    setOpen(true);
    setCreatingFile(false);
    setFileName("");
    setCreatingFolder(true);
    setFolderName("");
  };

  const cancelCreatingFolder = () => {
    setCreatingFolder(false);
    setFolderName("");
  };

  const handleCreateFolder = async () => {
    const name = folderName.trim();
    if (!name || loading) return;

    setLoading(true);
    const result = await createFolder({ projectId, name, parentId: nodeId });
    setLoading(false);

    if (!result) return;
    await reloadTree();
    cancelCreatingFolder();
  };

  // ---------- Rename ----------
  const handleRename = async () => {
    if (loading) return;

    const trimmed = renameValue.trim();
    if (!trimmed || trimmed === node?.name) {
      setIsRenaming(false);
      setRenameValue(node?.name || "");
      return;
    }

    setLoading(true);
    const result = await updateFile({ id: nodeId, name: trimmed });
    setLoading(false);

    if (result) {
      await reloadTree();
    } else {
      setRenameValue(node?.name || ""); // failed: restore old name
    }
    setIsRenaming(false);
  };

  // ---------- Delete ----------
  const handleDelete = async () => {
    if (loading) return;

    setLoading(true);
    const result = await deleteFile({ id: nodeId });
    setLoading(false);

    if (!result) return;
    await reloadTree();
    setIsDeleting(false);
  };

  return (
    <div className="relative select-none">
      <motion.div
        whileHover={{ x: 2 }}
        transition={{ duration: 0.15, ease: "easeInOut" }}
        className={`group flex items-center justify-between rounded-lg py-1.5 transition-colors hover:bg-white/[0.05] ${
          menu ? "bg-white/[0.07]" : ""
        }`}
        onContextMenu={handleContextMenu}
      >
        <div
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-1.5"
          onClick={() => {
            if (isFolder && !isRenaming) setOpen((prev) => !prev);
          }}
        >
          {isFolder ? (
            <motion.div
              animate={{ rotate: open ? 90 : 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="shrink-0"
            >
              <ChevronRight size={14} className="text-zinc-500" />
            </motion.div>
          ) : (
            <div className="w-3.5 shrink-0" />
          )}

          {isFolder ? (
            open ? (
              <FolderOpen size={16} className={`shrink-0 ${folderColor}`} />
            ) : (
              <FolderClosed size={16} className={`shrink-0 ${folderColor}`} />
            )
          ) : (
            <FileIcon size={15} className={`shrink-0 ${fileColor}`} />
          )}

          {isRenaming ? (
            <input
              ref={renameInputRef}
              value={renameValue}
              disabled={loading}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
                if (e.key === "Escape") {
                  setIsRenaming(false);
                  setRenameValue(node?.name || "");
                }
              }}
              onBlur={handleRename}
              onClick={(e) => e.stopPropagation()}
              className="w-full rounded bg-white/10 px-1.5 py-0.5 text-[13px] text-white outline-none ring-1 ring-sky-500/70"
            />
          ) : (
            <span className="truncate text-[13px] text-zinc-300 transition-colors group-hover:text-white">
              {node?.name}
            </span>
          )}

          {loading && (
            <Loader2 size={13} className="shrink-0 animate-spin text-zinc-500" />
          )}
        </div>

        {/* Quick action buttons on hover for folders */}
        {isFolder && !isRenaming && (
          <div className="flex items-center gap-1 pr-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              title="New file"
              className="rounded-md p-1 text-zinc-500 hover:bg-white/10 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                startCreatingFile();
              }}
            >
              <FilePlus2 size={15} />
            </button>
            <button
              type="button"
              title="New folder"
              className="rounded-md p-1 text-zinc-500 hover:bg-white/10 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                startCreatingFolder();
              }}
            >
              <FolderPlus size={15} />
            </button>
          </div>
        )}
      </motion.div>

      {/* Nested children with VS Code style indent guide */}
      <AnimatePresence>
        {open && isFolder && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="relative ml-[7px] overflow-hidden border-l border-white/[0.08] pl-2.5 transition-colors duration-150 hover:border-white/[0.22]"
          >
            {/* New folder inline input */}
            {creatingFolder && (
              <div className="flex items-center gap-1.5 py-1">
                <div className="w-3.5 shrink-0" />
                <FolderClosed size={16} className="shrink-0 text-amber-400" />
                <input
                  autoFocus
                  value={folderName}
                  disabled={loading}
                  onChange={(e) => setFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateFolder();
                    if (e.key === "Escape") cancelCreatingFolder();
                  }}
                  onBlur={() => {
                    if (!folderName.trim()) cancelCreatingFolder();
                  }}
                  placeholder="Folder name"
                  className="w-full rounded bg-white/10 px-1.5 py-0.5 text-[13px] text-white outline-none ring-1 ring-amber-500/50 placeholder:text-zinc-500"
                />
              </div>
            )}

            {/* New file inline input (icon changes as you type the extension) */}
            {creatingFile && (
              <div className="flex items-center gap-1.5 py-1">
                <div className="w-3.5 shrink-0" />
                <NewFileIcon size={15} className={`shrink-0 ${newFileColor}`} />
                <input
                  autoFocus
                  value={fileName}
                  disabled={loading}
                  onChange={(e) => setFileName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateFile();
                    if (e.key === "Escape") cancelCreatingFile();
                  }}
                  onBlur={() => {
                    if (!fileName.trim()) cancelCreatingFile();
                  }}
                  placeholder="File name"
                  className="w-full rounded bg-white/10 px-1.5 py-0.5 text-[13px] text-white outline-none ring-1 ring-sky-500/50 placeholder:text-zinc-500"
                />
              </div>
            )}

            {hasChildren ? (
              node.children.map((child) => (
                <Folder
                  key={child._id || child.id}
                  node={child}
                  projectId={projectId}
                  reloadTree={reloadTree}
                />
              ))
            ) : !creatingFile && !creatingFolder ? (
              <div className="select-none py-1 pl-5 text-[11px] italic text-zinc-600">
                Empty folder
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context Menu */}
      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          node={node}
          onClose={() => setMenu(null)}
          onNewFile={startCreatingFile}
          onNewFolder={startCreatingFolder}
          onRename={() => {
            setIsRenaming(true);
            setRenameValue(node?.name || "");
          }}
          onDelete={() => setIsDeleting(true)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleting}
        node={node}
        loading={loading}
        onClose={() => setIsDeleting(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default Folder;