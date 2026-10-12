# Codvexa — Frontend Client

> Modern, cloud-based code editor interface built with **React 19**, **Vite**, **Tailwind CSS v4**, and **Motion**.

---

## 🌟 Latest Updates

### 1. VS Code-Style Indent Guides
- Clean, vertical lines along the tree indentation column (`border-l border-white/[0.08]`).
- Positioned precisely at `ml-[7px]` to align with the center of the folder's 14px rotating chevron icon.
- Interactive hover illumination (`hover:border-white/[0.22]`) helping trace nested files and folders back to their parent container.
- Recursive multi-depth indentation handling nested folders at arbitrary depth.
- Aligned input fields for new files and folders matching file icon positions.
- Visual `"Empty folder"` placeholder inside open empty folders.

### 2. Context Menu System (`ContextMenu.jsx`)
- Sleek glassmorphic right-click menu with backdrop blur and border accents.
- Rendered via **React Portals** directly onto `document.body` to avoid clipping from scrollbars or `overflow-hidden` containers.
- Viewport boundary detection and automatic position clamping so the menu never goes off-screen.
- Contextual actions:
  - **Folders**: New File, New Folder, Rename, Copy Name, Delete.
  - **Files**: Rename, Copy Name, Delete.
- Animated clipboard copy feedback with checkmark icon.

### 3. Inline Rename (`Folder.jsx`)
- Transforms node into an inline auto-focused input when renamed.
- Automatically selects the filename without selecting the file extension.
- Save on `Enter` or blur, cancel on `Escape`.

### 4. Delete Confirmation Dialog (`DeleteModal.jsx`)
- Accessible modal dialog protecting against accidental deletion.
- Supports keyboard confirmation (`Enter` to confirm, `Escape` to cancel).

---

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4
- **Animations**: Motion (`motion/react`)
- **Icons**: Lucide React
- **State Management**: Redux Toolkit
- **Routing**: React Router v7

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```
