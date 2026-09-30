import React, { useEffect, useRef, useState } from "react";
import { FaRegMoon, FaRegSun } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/userslice";
import { logout } from "../features/logout";

const COLORS = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-orange-500",
  "bg-cyan-500",
];

const getInitialDark = () => {
  try {
    const theme = localStorage.getItem("theme");
    return theme ? theme === "dark" : true;
  } catch {
    return true;
  }
};

function Navbar() {
  // lazy initializer: correct value on first render, no flash from state
  const [isDark, setIsDark] = useState(getInitialDark);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const dispatch = useDispatch();
  const { userdata } = useSelector((state) => state.user);

  // keep <html> class in sync with state
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  // close menu on outside click / Escape
  useEffect(() => {
    if (!menuOpen) return;

    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  };

  const name = userdata?.name;
  const firstLetter = name?.charAt(0)?.toUpperCase() || "U";
  const colorIndex = name ? name.charCodeAt(0) % COLORS.length : 0;

  const handleLogout = async () => {
    try {
      await logout();
      dispatch(setUserData(null));
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 z-50 flex h-16 w-full items-center justify-between border-b border-slate-200/70 bg-white/70 px-6 font-sans backdrop-blur-xl transition-colors duration-300 dark:border-white/[0.07] dark:bg-[#0b0b11]/80">
      <span className="text-[17px] font-bold tracking-tight text-slate-900 dark:text-white">
        codvexa
      </span>

      <div className="relative flex items-center gap-3" ref={menuRef}>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-all duration-200 hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300 dark:hover:bg-white/10"
        >
          {isDark ? <FaRegSun size={16} /> : <FaRegMoon size={16} />}
        </button>

        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label="Account menu"
          className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white ${COLORS[colorIndex]}`}
        >
          {firstLetter}
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-12 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-white/10 dark:bg-[#111118]"
          >
            <div className="border-b border-slate-200 px-3 pb-3 dark:border-white/10">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {name}
              </p>
              <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                {userdata?.email}
              </p>
            </div>

            <button
              role="menuitem"
              onClick={handleLogout}
              className="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm text-red-500 transition hover:bg-red-500/10"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;