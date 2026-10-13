# Codvexa — Frontend Client

> Modern, high-performance web-based IDE client for **Codvexa**, inspired by VS Code. Built with **React 19**, **Vite**, **Tailwind CSS v4**, **Motion**, and **Redux Toolkit**.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation & Running](#installation--running)
- [Available Scripts](#-available-scripts)
- [Architecture & Modules](#-architecture--modules)
  - [Routing & Navigation](#routing--navigation)
  - [State Management](#state-management)
  - [API Client Layer](#api-client-layer)
- [UI Components & Design System](#-ui-components--design-system)
- [License](#-license)

---

## 🌟 Overview

The **Codvexa Frontend** provides a responsive, dark-mode-first cloud development environment. It connects to the Codvexa microservices architecture through an API Gateway to deliver file tree exploration, inline file management, workspace controls, and project orchestration.

---

## ✨ Key Features

### 🖥️ VS Code-Inspired Workspace
- **Activity Bar & Collapsible Sidebar**: Quick switching between Explorer, AI Chat, and Terminal panes.
- **Top Bar**: Displays the active project name, workspace status, and view controls.
- **Preview & Fullscreen Controls**: Dedicated maximize/minimize toggles to expand workspace preview and editor views to fullscreen.

### 🌳 Hierarchical File Tree Explorer
- **Visual Indent Guides**: 1px vertical guide lines connecting nested children directly beneath parent folder chevrons.
- **Interactive Guide Illumination**: Hovering over nested directories highlights the ancestor guide lines for instant depth tracking.
- **File Extension Icons**: Dynamic syntax and file type icon resolution via `Customized.icon.js` (JavaScript, TypeScript, React, HTML, CSS, JSON, Python, etc.).
- **Inline Creation**: In-tree input rows for creating new files and folders with proper alignment spacers.

### ⚡ Context Menu & Modal Workflows
- **Glassmorphic Context Menu (`ContextMenu.jsx`)**:
  - Right-click menu rendered via `createPortal` to prevent container overflow clipping.
  - Smart boundary detection and clamping to guarantee 100% viewport visibility.
  - Context-aware actions: *New File*, *New Folder*, *Rename*, *Copy Name*, and *Delete*.
  - Animated copy feedback and keyboard dismissal (`Escape`).
- **Inline Rename**: Double-click or menu-driven rename with smart stem selection (automatically selects filename while preserving extension).
- **Safe Deletion Dialog (`DeleteModal.jsx`)**: Context-aware confirmation modal protecting against accidental deletions.

### 🔐 Authentication & Session Sync
- **Firebase OAuth**: Integrated Google sign-in workflow.
- **Cookie-Based Sessions**: Synchronized credentials with backend Gateway and Redis session store.

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Core Framework** | [React 19](https://react.dev/) + [Vite](https://vite.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite`) |
| **Animations** | [Motion](https://motion.dev/) (`motion/react`) |
| **Icons** | [Lucide React](https://lucide.dev/) & [React Icons](https://react-icons.github.io/react-icons/) |
| **State Management** | [Redux Toolkit](https://redux-toolkit.js.org/) + React Redux |
| **Routing** | [React Router DOM v7](https://reactrouter.com/) |
| **HTTP Client** | [Axios](https://axios-http.com/) (configured with credentials) |
| **Authentication** | [Firebase v12](https://firebase.google.com/) |

---

## 📂 Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── component/          # Reusable UI & workspace components
│   │   ├── ActivityBar.jsx # Left vertical activity bar
│   │   ├── ContextMenu.jsx # Floating right-click context menu (Portal)
│   │   ├── DeleteModal.jsx # Deletion confirmation dialog
│   │   ├── Explorer.jsx    # File tree explorer container
│   │   ├── Folder.jsx      # Recursive tree node with indent guides & actions
│   │   └── TopBar.jsx      # Top header with project details & toggles
│   ├── features/           # API request services (Axios)
│   │   ├── file.js         # Virtual file system endpoints (CRUD, tree)
│   │   ├── login.js        # Auth session validation
│   │   └── project.js      # Project management endpoints
│   ├── pages/              # Application route pages
│   │   ├── Dashbord.jsx    # User projects list and creation dashboard
│   │   └── ProjectPage.jsx # Main IDE workspace
│   ├── redux/              # Redux Toolkit slices & global store
│   │   ├── projectslice.js # Active project & workspace state
│   │   ├── userslice.js    # Authenticated user state
│   │   └── store.js        # Redux store configuration
│   ├── utils/              # Utility functions and mappers
│   │   ├── axios.js        # Pre-configured Axios instance
│   │   ├── buildTree.js    # Flat MongoDB record to nested tree converter
│   │   ├── Customized.icon.js # File extension icon resolver
│   │   └── firebase.js     # Firebase client SDK initialization
│   ├── App.jsx             # Main router & session initializer
│   ├── index.css           # Global Tailwind CSS imports & theme rules
│   └── main.jsx            # Application entry point
├── .env                    # Local environment variables
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
└── README.md               # Frontend documentation
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm** or **yarn** / **pnpm**
- Running Codvexa backend services (specifically API Gateway on `http://localhost:8000`)

### Environment Variables

Create a `.env` file in the `frontend/` directory (or verify existing settings):

```env
VITE_SERVER_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
```

### Installation & Running

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open browser**:
   Navigate to [http://localhost:5173](http://localhost:5173).

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite local development server with HMR |
| `npm run build` | Builds optimized production bundle into `dist/` |
| `npm run preview` | Locally previews the production build |
| `npm run lint` | Runs ESLint to check for code issues |

---

## 🏛️ Architecture & Modules

### Routing & Navigation

Configured in [`App.jsx`](src/App.jsx) with `react-router-dom`:

- `/` → Redirects to `/dashboard`
- `/dashboard` → Projects overview, create new project dialog, and user profile
- `/project/:id` → Workspace IDE for project editing and file management

### State Management

Global state is managed via Redux Toolkit in [`src/redux`](src/redux/):

- **`userSlice`**: Stores authenticated user session information (`setUserData`, `logout`).
- **`projectSlice`**: Holds currently loaded project metadata (`currentproject`, `setcurrentproject`).

### API Client Layer

Centralized in [`src/utils/axios.js`](src/utils/axios.js) with `withCredentials: true` to support HTTP-only session cookies forwarded through the API Gateway:

- **File Operations** ([`src/features/file.js`](src/features/file.js)):
  - `getTree(projectId)`: Fetches flat node records and transforms them via `buildTree()`
  - `createFile({ projectId, name, parentId, content, language })`
  - `createFolder({ projectId, name, parentId })`
  - `updateFile({ id, name, content })`
  - `deleteFile({ id })`

---

## 🎨 UI Components & Design System

- **Background Palette**: Ultra-dark `#080808` canvas with `#111113` surface containers.
- **Accents**: Subtle white opacity borders (`border-white/[0.06]`, `border-white/10`) and blur filters (`backdrop-blur-xl`).
- **Transitions**: High-framerate spring animations via `motion/react` for modals, popovers, and button states.

---

## 📄 License

MIT © [Codvexa Team](../README.md)
