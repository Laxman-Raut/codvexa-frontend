import { signInWithPopup } from "firebase/auth";
import React, { useEffect, useMemo, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import {
  Loader2, Plus, Folder, Search, X, LayoutGrid, List, Star, ArrowDownUp,
  Sun, Sunset, Moon,
  
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { auth, googleProvider } from "../../firebase";
import { login, me } from "../features/login";
import { setUserData } from "../redux/userslice";
import { setprojects, setstarredprojects } from "../redux/projectslice";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../component/navbar.jsx";
import Sidebar from "../component/sidebar.jsx";
import { getprojects, getstarredproject } from "../features/project.js";
import ProjectCard from "../component/projectCard.jsx";
import Createprojectmodel from "../component/Createprojectmodel.jsx";

// Always returns an array, whatever shape the API/Redux holds
const toArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.projects)) return data.projects;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const getPeriod = (h) => {
  if (h < 5) return { text: "Working late", Icon: Moon, color: "text-violet-400" };
  if (h < 12) return { text: "Good morning", Icon: Sun, color: "text-amber-400" };
  if (h < 17) return { text: "Good afternoon", Icon: Sun, color: "text-orange-400" };
  if (h < 21) return { text: "Good evening", Icon: Sunset, color: "text-pink-400" };
  return { text: "Good night", Icon: Moon, color: "text-violet-400" };
};

function Greeting() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const { text, Icon, color } = getPeriod(now.getHours());
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest">
      <AnimatePresence mode="wait">
        <motion.span
          key={text}
          initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
          transition={{ duration: 0.3 }}
          className={color}
        >
          <Icon size={15} />
        </motion.span>
      </AnimatePresence>

      {/* Letters fade in one by one; re-plays whenever the greeting changes */}
      <span className="flex text-sky-400">
        {text.split("").map((ch, i) => (
          <motion.span
            key={`${text}-${i}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.035, duration: 0.25 }}
          >
            {ch === " " ? "\u00A0" : ch}
          </motion.span>
        ))}
      </span>

      <span className="text-zinc-700">•</span>
      <span className="tabular-nums text-zinc-500">{time}</span>
    </div>
  );
}

const projectTitle = (p) => p?.name || p?.projectName || p?.title || "";
const projectDate = (p) => new Date(p?.updatedAt || p?.createdAt || 0).getTime();

const PRIMARY_BTN =
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sky-500/40 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 active:translate-y-0 active:scale-[0.98]";

// ---------- Codvexa logo mark (sky -> violet, transparent) ----------
function LogoMark({ width = 56 }) {
  return (
    <svg
      viewBox="0 0 600 400"
      width={width}
      height={(width * 400) / 600}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="dash-logo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <polyline
        points="140,68 32,198 140,330"
        stroke="url(#dash-logo-grad)"
        strokeWidth="30"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="465,68 573,198 465,330"
        stroke="url(#dash-logo-grad)"
        strokeWidth="30"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon points="418,8 475,8 187,390 131,390" fill="url(#dash-logo-grad)" />
      <polygon points="131,8 188,8 286,140 258,178" fill="url(#dash-logo-grad)" />
      <polygon points="346,220 468,390 418,390 320,260" fill="url(#dash-logo-grad)" />
    </svg>
  );
}

// ---------- Loading skeleton card ----------
function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-white/[0.06]" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-2/3 rounded bg-white/[0.06]" />
          <div className="h-2.5 w-1/3 rounded bg-white/[0.04]" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-2.5 w-full rounded bg-white/[0.04]" />
        <div className="h-2.5 w-4/5 rounded bg-white/[0.04]" />
      </div>
    </div>
  );
}

function Dashbord() {
  const [loading, setLoading] = useState(false);
  const [loadingprojects, setloadingprojects] = useState(false);
  const [openmodel, setopenmodel] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activesession, setActivesession] = useState("projects");

  // UI-only state
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent"); // "recent" | "name"
  const [view, setView] = useState("grid"); // "grid" | "list"

  const dispatch = useDispatch();

  const userdata = useSelector((state) => state.user?.userdata);
  const rawProjects = useSelector((state) => state.project?.projects);
  const rawStarred = useSelector((state) => state.project?.starredprojects);

  const projects = toArray(rawProjects);
  const starredprojects = toArray(rawStarred);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const data = await me();
        if (data) {
          dispatch(setUserData(data));
        }
      } catch (error) {
        console.error("Session check failed:", error);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkUser();
  }, [dispatch]);

  const handleLogin = async () => {
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      const data = await login(token);
      if (data) {
        dispatch(setUserData(data));
      }
    } catch (error) {
      console.error("Login failed:", error?.code, error?.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllprojects = async () => {
    setloadingprojects(true);
    try {
      const data = await getprojects();
      dispatch(setprojects(toArray(data)));
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setloadingprojects(false);
    }
  };

  const fetchstarredproject = async () => {
    setloadingprojects(true);
    try {
      const data = await getstarredproject();
      dispatch(setstarredprojects(toArray(data)));
    } catch (error) {
      console.error("Failed to fetch starred projects:", error);
    } finally {
      setloadingprojects(false);
    }
  };

  useEffect(() => {
    if (!userdata) return;

    if (activesession === "projects") {
      fetchAllprojects();
    } else {
      fetchstarredproject();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activesession, userdata]);

  // Clear the search when switching between Projects and Starred
  useEffect(() => {
    setQuery("");
  }, [activesession]);

  const currentProjects =
    activesession === "starred" ? starredprojects : projects;

  const visibleProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? currentProjects.filter((p) => projectTitle(p).toLowerCase().includes(q))
      : [...currentProjects];

    if (sortBy === "name") {
      list.sort((a, b) => projectTitle(a).localeCompare(projectTitle(b)));
    } else {
      list.sort((a, b) => projectDate(b) - projectDate(a));
    }
    return list;
  }, [currentProjects, query, sortBy]);

  // ---------- Auth check ----------
  if (checkingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#07070c]">
        <Loader2 size={28} className="animate-spin text-sky-400/70" />
      </div>
    );
  }

  // ---------- Login screen ----------
  if (!userdata) {
    return (
      <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#07070c] px-4">
        {/* Grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage:
              "radial-gradient(ellipse at center, black 20%, transparent 70%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 20%, transparent 70%)",
          }}
        />

        {/* Glow orbs */}
        <motion.div
          className="pointer-events-none absolute -left-20 top-20 h-96 w-96 rounded-full bg-sky-500/10 blur-[120px]"
          animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="pointer-events-none absolute -right-20 bottom-10 h-[420px] w-[420px] rounded-full bg-violet-500/10 blur-[130px]"
          animate={{ x: [0, -60, 0], y: [0, -40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0c0c12]/80 p-8 text-center shadow-2xl backdrop-blur-xl sm:p-10"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_0_40px_-8px_rgba(56,189,248,0.45)]">
            <LogoMark width={44} />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-white">
            Welcome to Codvexa
          </h2>

          <p className="mt-2.5 text-sm leading-relaxed text-zinc-400">
            Sign in to access your projects and continue building
          </p>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="mt-8 flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-zinc-100 transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-400/40 hover:bg-white/[0.08] hover:shadow-lg hover:shadow-sky-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-sky-400" />
                Signing in...
              </>
            ) : (
              <>
                <FcGoogle className="text-xl" />
                Continue with Google
              </>
            )}
          </button>

          <p className="mt-6 text-xs leading-relaxed text-zinc-600">
            By continuing, you agree to our Terms and Privacy Policy.
          </p>
        </motion.div>
      </div>
    );
  }

  // ---------- Dashboard ----------
  const firstName =
    typeof userdata?.name === "string" && userdata.name.trim()
      ? userdata.name.split(" ")[0]
      : "User";

  const isStarredTab = activesession === "starred";
  const hasProjects = currentProjects.length > 0;
  const isSearching = query.trim().length > 0;

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-[#07070c]">
      {/* Ambient background */}
      <div className="pointer-events-none absolute -top-40 left-1/3 h-[700px] w-[700px] rounded-full bg-sky-500/[0.05] blur-[150px]" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-[500px] w-[500px] rounded-full bg-violet-500/[0.05] blur-[150px]" />

      <Navbar />

      <div className="relative flex min-h-0 flex-1">
        <Sidebar
          activesession={activesession}
          setActivesession={setActivesession}
        />

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.12)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:hover:bg-white/20">
          <div className="mx-auto w-full max-w-7xl">
            {/* ---------- Hero header ---------- */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative mb-8 overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-6 sm:p-8"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />
              <div className="pointer-events-none absolute -right-2 top-1/2 hidden -translate-y-1/2 opacity-[0.10] md:block">
                <LogoMark width={260} />
              </div>

              <div className="relative flex flex-wrap items-center justify-between gap-5">
                <div className="min-w-0">
                 <Greeting />
                  <h1 className="mt-1.5 flex items-center gap-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    <span className="truncate">Welcome back, {firstName}</span>
                    <span className="shrink-0 transition-transform duration-300 hover:rotate-12">
                      👋
                    </span>
                  </h1>
                  <p className="mt-1.5 text-sm text-zinc-400">
                    Ready to build something amazing today?
                  </p>
                </div>

                <button
                  onClick={() => setopenmodel(true)}
                  className={`${PRIMARY_BTN} px-5 py-3`}
                >
                  <Plus size={16} />
                  New project
                </button>
              </div>
            </motion.div>

            {/* ---------- Section title + toolbar ---------- */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {isStarredTab && (
                  <Star size={16} className="fill-amber-400 text-amber-400" />
                )}
                <h2 className="text-base font-semibold tracking-tight text-white">
                  {isStarredTab ? "Starred projects" : "Recent projects"}
                </h2>
                {!loadingprojects && hasProjects && (
                  <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] font-medium text-zinc-400">
                    {currentProjects.length}
                  </span>
                )}
              </div>

              {hasProjects && (
                <div className="flex flex-wrap items-center gap-2">
                  {/* Search */}
                  <div className="relative">
                    <Search
                      size={14}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                    />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search projects..."
                      className="h-9 w-48 rounded-lg border border-white/[0.08] bg-white/[0.03] pl-8 pr-8 text-[13px] text-white outline-none transition-all placeholder:text-zinc-600 focus:w-60 focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/15 sm:w-56 sm:focus:w-72"
                    />
                    {query && (
                      <button
                        type="button"
                        onClick={() => setQuery("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-zinc-500 hover:text-white"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  {/* Sort */}
                  <div className="relative">
                    <ArrowDownUp
                      size={13}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                    />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="h-9 cursor-pointer appearance-none rounded-lg border border-white/[0.08] bg-[#0f0f14] pl-8 pr-3 text-[13px] text-zinc-300 outline-none transition-colors hover:border-white/20 focus:border-sky-400/50"
                    >
                      <option value="recent">Most recent</option>
                      <option value="name">Name (A-Z)</option>
                    </select>
                  </div>

                  {/* View toggle */}
                  <div className="flex h-9 items-center rounded-lg border border-white/[0.08] bg-white/[0.03] p-0.5">
                    {[
                      { id: "grid", icon: LayoutGrid, label: "Grid view" },
                      { id: "list", icon: List, label: "List view" },
                    ].map(({ id, icon: Icon, label }) => (
                      <button
                        key={id}
                        type="button"
                        title={label}
                        onClick={() => setView(id)}
                        className={`flex h-full w-8 items-center justify-center rounded-md transition-colors ${
                          view === id
                            ? "bg-sky-500/20 text-sky-300"
                            : "text-zinc-500 hover:text-white"
                        }`}
                      >
                        <Icon size={14} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ---------- Content ---------- */}
            {loadingprojects ? (
              <div
                className={`mb-8 grid gap-4 ${
                  view === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : !hasProjects ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group mb-8 flex w-full flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.01] px-6 py-20 text-center transition-all duration-200 hover:border-sky-400/30"
              >
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 transition-transform duration-200 group-hover:scale-105">
                  {isStarredTab ? (
                    <Star
                      size={26}
                      className="text-zinc-400 transition-colors group-hover:text-amber-400"
                    />
                  ) : (
                    <Folder
                      size={26}
                      className="text-zinc-400 transition-colors group-hover:text-sky-400"
                    />
                  )}
                </div>

                <h3 className="text-lg font-semibold text-white">
                  {isStarredTab ? "No starred projects" : "No projects yet"}
                </h3>

                <p className="mt-2 max-w-sm text-sm text-zinc-400">
                  {isStarredTab
                    ? "Star a project to see it here."
                    : "Create your first project and start building something amazing."}
                </p>

                {!isStarredTab && (
                  <button
                    onClick={() => setopenmodel(true)}
                    className={`${PRIMARY_BTN} mt-6 px-4 py-2.5`}
                  >
                    <Plus size={16} />
                    Create project
                  </button>
                )}
              </motion.div>
            ) : visibleProjects.length === 0 && isSearching ? (
              <div className="mb-8 flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 px-6 py-16 text-center">
                <Search size={22} className="mb-3 text-zinc-500" />
                <h3 className="text-base font-semibold text-white">
                  No results for "{query}"
                </h3>
                <p className="mt-1.5 text-sm text-zinc-400">
                  Try a different name.
                </p>
                <button
                  onClick={() => setQuery("")}
                  className="mt-4 text-[13px] font-medium text-sky-400 hover:text-sky-300"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div
                className={`mb-8 grid gap-4 ${
                  view === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                <AnimatePresence mode="popLayout">
                  {visibleProjects.map((project, index) => (
                    <motion.div
                      key={project._id || project.id || index}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{
                        duration: 0.25,
                        delay: Math.min(index * 0.04, 0.3),
                      }}
                    >
                      <ProjectCard project={project} />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* "New project" tile at the end of the Projects tab */}
                {!isStarredTab && !isSearching && (
                  <motion.button
                    layout
                    type="button"
                    onClick={() => setopenmodel(true)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-transparent text-zinc-500 transition-colors hover:border-sky-400/50 hover:bg-sky-500/[0.04] hover:text-sky-400 ${
                      view === "grid"
                        ? "min-h-[140px] flex-col"
                        : "min-h-[64px] flex-row"
                    }`}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 transition-colors group-hover:bg-sky-500/15">
                      <Plus size={18} />
                    </span>
                    <span className="text-[13px] font-medium">New project</span>
                  </motion.button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {openmodel && (
        <Createprojectmodel
          openModal={openmodel}
          onclose={() => setopenmodel(false)}
        />
      )}
    </div>
  );
}

export default Dashbord;