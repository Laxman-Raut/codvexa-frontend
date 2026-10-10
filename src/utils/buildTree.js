/**
 * Builds a hierarchical tree structure from a list of files/folders.
 * Handles flat lists with parentId relationships, already-nested trees,
 * and sorts folders first followed by files alphabetically.
 *
 * @param {Array} files - Array of file and folder objects
 * @returns {Array} - Nested array of tree nodes with children
 */
export const buildTree = (files = []) => {
  if (!Array.isArray(files) || files.length === 0) {
    return [];
  }

  const map = new Map();
  const tree = [];

  // Step 1: Normalize items and populate map
  files.forEach((file) => {
    if (!file) return;

    // Unpack mongoose _doc if present
    const item = file._doc ? { ...file._doc, ...file } : { ...file };
    const id = (item._id || item.id)?.toString();

    if (!id) return;

    map.set(id, {
      ...item,
      children: Array.isArray(item.children) ? [...item.children] : [],
    });
  });

  // Step 2: Establish parent-child relationships
  files.forEach((file) => {
    if (!file) return;

    const item = file._doc ? { ...file._doc, ...file } : { ...file };
    const id = (item._id || item.id)?.toString();
    const parentId = (item.parentId?._id || item.parentId)?.toString();

    const node = map.get(id);
    if (!node) return;

    if (parentId && map.has(parentId)) {
      const parent = map.get(parentId);
      const childExists = parent.children.some(
        (child) => (child._id || child.id)?.toString() === id
      );

      if (!childExists) {
        parent.children.push(node);
      }
    } else {
      // Root-level node (no parentId, or parent is not within this list)
      const rootExists = tree.some(
        (root) => (root._id || root.id)?.toString() === id
      );

      if (!rootExists) {
        tree.push(node);
      }
    }
  });

  // Step 3: Sort folders before files, then sort by name alphabetically
  const sortTreeNodes = (nodes) => {
    nodes.sort((a, b) => {
      const isFolderA = a.type === "folder";
      const isFolderB = b.type === "folder";

      if (isFolderA && !isFolderB) return -1;
      if (!isFolderA && isFolderB) return 1;

      return (a.name || "").localeCompare(b.name || "", undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });

    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        sortTreeNodes(node.children);
      }
    });

    return nodes;
  };

  return sortTreeNodes(tree);
};

export const buildtree = buildTree;
export default buildTree;
