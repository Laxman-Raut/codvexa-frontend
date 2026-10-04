import { signInWithPopup } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Loader2, Plus, Folder } from "lucide-react";
import { auth, googleProvider } from "../../firebase";
import { login, me } from "../features/login";
import { setUserData } from "../redux/userslice";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../component/navbar.jsx";
import Sidebar from "../component/sidebar.jsx";
import { createproject, getprojects, getstarredproject } from "../features/project.js";
import ProjectCard from "../component/projectCard.jsx";
import Createprojectmodel from "../component/Createprojectmodel.jsx";

// Always returns an array, whatever shape the API/Redux holds
const toArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.projects)) return data.projects;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

function Dashbord() {
  const [loading, setLoading] = useState(false);
  const [loadingprojects, setloadingprojects] = useState(false);
  const [openmodel, setopenmodel] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activesession, setActivesession] = useState("projects");

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
      dispatch(setstarredprojects(toArray(data))); // fixed: was setprojects
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

  if (checkingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#07070c]">
        <Loader2 size={28} className="animate-spin text-slate-500" />
      </div>
    );
  }

  if (!userdata) {
    return (
      <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#07070c] px-4">
        <div className="pointer-events-none absolute left-1/2 top-32 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-white/[0.05] blur-[120px]" />

        <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0b11] p-6 text-center shadow-xl shadow-black/40 backdrop-blur-xl sm:p-8">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-white">
            <span className="text-lg font-bold text-slate-900">AI</span>
          </div>

          <h2 className="text-xl font-bold text-white">Welcome to Codvexa</h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Sign in to access your projects and continue building
          </p>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="mt-6 flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Signing in...
              </>
            ) : (
              <>
                <FcGoogle className="text-xl" />
                Continue with Google
              </>
            )}
          </button>

          <p className="mt-4 text-xs leading-5 text-slate-500">
            By continuing, you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </div>
    );
  }

  const currentProjects =
    activesession === "starred" ? starredprojects : projects;

  const firstName =
    typeof userdata?.name === "string" && userdata.name.trim()
      ? userdata.name.split(" ")[0]
      : "User";

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-slate-50 transition-colors duration-300 dark:bg-[#07070c]">
      <div className="pointer-events-none absolute -top-40 left-1/3 hidden h-[700px] w-[700px] rounded-full bg-white/[0.04] blur-[140px] dark:block" />
      <div className="pointer-events-none absolute right-0 top-1/3 hidden h-[500px] w-[500px] rounded-full bg-white/[0.04] blur-[130px] dark:block" />

      <Navbar />

      <div className="relative flex min-h-0 flex-1">
        <Sidebar
          activesession={activesession}
          setActivesession={setActivesession}
        />

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8 [scrollbar-width:thin] [scrollbar-color:rgba(100,116,139,0.35)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-400/60 dark:[&::-webkit-scrollbar-thumb]:bg-white/10 dark:[&::-webkit-scrollbar-thumb]:hover:bg-white/20">
          <div className="mx-auto w-full max-w-7xl">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <h1 className="flex items-center gap-2 text-2xl font-bold leading-tight text-slate-900 dark:text-white sm:text-[26px]">
                  <span className="truncate">Welcome back, {firstName}</span>
                  <span className="shrink-0 leading-none">👋</span>
                </h1>

                <p className="mt-1 text-[13.5px] text-slate-500 dark:text-slate-400">
                  Ready to build something amazing today?
                </p>
              </div>

              <button
                onClick={() => setopenmodel(true)}
                className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-slate-900 px-4 py-2.5 text-[13.5px] font-semibold leading-none text-white shadow-sm transition-opacity duration-150 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:bg-white dark:text-slate-900"
              >
                <Plus size={16} />
                New project
              </button>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                {activesession === "starred"
                  ? "Starred projects"
                  : "Recent projects"}
              </h2>
            </div>

            {loadingprojects ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <Loader2
                  size={28}
                  className="animate-spin text-slate-400 dark:text-slate-500"
                />
              </div>
            ) : currentProjects.length === 0 ? (
              <div className="mb-8 flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/40 px-4 py-16 text-center dark:border-white/10 dark:bg-white/[0.01]">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900/5 dark:bg-white/10">
                  <Folder
                    size={24}
                    className="text-slate-500 dark:text-white"
                  />
                </div>

                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  {activesession === "starred"
                    ? "No starred projects"
                    : "No projects yet"}
                </h3>

                <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                  {activesession === "starred"
                    ? "Star a project to see it here."
                    : "Create your first project and start building something amazing."}
                </p>
              </div>
            ) : (
              <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {currentProjects.map((project ) => (
                  <ProjectCard
                  
                    
                    project={project}
                  />
                ))}
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