
import { signInWithPopup } from "firebase/auth";
import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { auth, googleProvider } from "../../firebase";
import { login } from "../features/login";

function Dashbord() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();

      const data = await login(token);

      console.log(data);
    } catch (error) {
      console.error("Login failed:", error.code, error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-slate-50 px-4 transition-colors duration-300 dark:bg-[#07070c]">

      <h1>
        dashbrd
      </h1>

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

export default Dashbord;

