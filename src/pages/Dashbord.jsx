import { signInWithPopup } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { FcGoogle,  } from "react-icons/fc";
import { Loader2, Plus } from "lucide-react";
import { auth, googleProvider } from "../../firebase";
import { login, me } from "../features/login";
import { setUserData } from "../redux/userslice";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../component/navbar.jsx";
import Sidebar from "../component/sidebar.jsx"
import {getprojects, getstarredproject } from"../features/project.js"
import { setprojects, setstarredprojects } from "../redux/projectslice.js";
function Dashbord() {
  const [loading, setLoading] = useState(false);

  const [loadingprojects,setloadingprojects] =useState(false)
  const dispatch = useDispatch();
  const[activesession, setActivesession]=useState("projects")

  const { userdata } = useSelector((state) => state.user);
  const { projects,starredprojects } = useSelector((state) => state.project);
  useEffect(() => {
    const checkUser = async () => {
      const data = await me();

      if (data) {
        dispatch(setUserData(data));
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

      dispatch(setUserData(data));
    } catch (error) {
      console.error("Login failed:", error.code, error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllprojects = async () => {
   setloadingprojects(true)
    const data = await getprojects();
    dispatch(setprojects(data));
    setloadingprojects(false)
  };

  const fetchstarredproject = async () => {
    setloadingprojects(true)
    const data = await getstarredproject();
    dispatch(setstarredprojects(data));
      setloadingprojects(false)
  };

  useEffect(() => {
    if (activesession === "projects") {
      fetchAllprojects();
    } else {
      fetchstarredproject();
    }
  }, [activesession]);

  if (!userdata) {
  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-[#07070c] px-4 transition-colors duration-300">

        <h1>dashbrd</h1>

        <div className="pointer-events-none absolute top-32 left-1/2 hidden h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-white/[0.05] blur-[120px] dark:block"></div>

        <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0b11] p-8 text-center shadow-xl shadow-black/40 backdrop-blur-xl">

          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-black/5 dark:border-transparent">
            <span className="text-lg font-bold text-slate-900">
              AI
            </span>
          </div>

          <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
            Welcome to Codvexa
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Sign in to access your projects and continue building
          </p>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                Signing in...
              </>
            ) : (
              <>
                <FcGoogle className="text-lg" />
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

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-slate-50 transition-colors duration-300 dark:bg-[#07070c]">
      <div className="pointer-events-none absolute -top-40 left-1/3 hidden h-[700px] w-[700px] rounded-full bg-white/[0.04] blur-[140px] dark:block" />

      <div className="pointer-events-none absolute right-0 top-1/3 hidden h-[500px] w-[500px] rounded-full bg-white/[0.04] blur-[130px] dark:block" />

      <div className="relative flex min-h-0 flex-1 flex-col"></div>

      <Navbar />
     <div className="flex min-h-[calc(100vh-4rem)] flex-1">
  <Sidebar activesession={activesession} setActivesession={setActivesession} />

  <div className="min-h-0 flex-1 overflow-y-auto px-8 py-8 [scrollbar-width:thin] 
  [scrollbar-color:rgba(100,116,139,0.35)_transparent] [&::-webkit-scrollbar]:w-2 
  [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:border-2 
  [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb]:bg-slate-400
   [&::-webkit-scrollbar-thumb]:hover:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-white/10 dark:[&::-webkit-scrollbar-thumb]:hover:bg-white/20">
 
 <div className="mb-8 flex items-start justify-between">
  <div>
    <h1 className="flex items-center gap-2 text-[26px] font-bold text-slate-900 dark:text-white">
      welcome back,{" "}
      {(userdata?.name || "User").split(" ")[0]}
      <span>👋</span>
    </h1>
    <p className="mt-1 text-[13.5px] text-slate-500 dark:text-slate-400">
      Ready to build something amazing today?
    </p>
  </div>
  <button className="flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2.5 text-[13.5px] font-semibold text-white shadow-sm transition-opacity duration-150 hover:opacity-90 dark:bg-white dark:text-slate-900">
  <Plus size={16} />
  New project
</button>
 </div>
 <div className="mb-4 flex items-center justify-between">
  <h2 className="text-[16px] font-semibold text-slate-900 dark:text-white">
   {activesession === "starred" ? "Starred projects" : "Recent projects"}
  </h2>
        
 </div>
  {loadingprojects ? (
  <div className="flex min-h-[300px] items-center justify-center">
    <Loader2
    size={28}
    className="animate-spin text-slate-400 dark:text-slate-500"/>
  </div>
 ) :projects.length ==0?(
  <div className="mb-8 flex flex-col items-center justify-center rounded-2xl border border-slate-300 bg-white/40 py-16 text-center dark:border-white/[0.1] dark:bg-white/[0.01]"> </div>
 ) : null}

  </div>
</div>
    </div>
  );
}

export default Dashbord;