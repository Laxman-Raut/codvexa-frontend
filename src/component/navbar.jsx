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
    <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between border-b border-zinc-200/80 bg-white/80 px-6 font-sans backdrop-blur-xl transition-colors duration-300 dark:border-white/[0.08] dark:bg-[#09090b]/80">
      <span className="text-[17px] font-bold tracking-tight text-zinc-900 transition-opacity hover:opacity-80 dark:text-white">
        codvexa
      </span>

      <div className="relative flex items-center gap-3" ref={menuRef}>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="group flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 shadow-2xs transition-all duration-200 hover:bg-zinc-100 hover:text-zinc-900 active:scale-95 dark:border-white/10 dark:bg-white/[0.05] dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
        >
          {isDark ? <FaRegSun size={15} className="transition-transform duration-300 group-hover:rotate-45" /> : <FaRegMoon size={15} className="transition-transform duration-300 group-hover:-rotate-12" />}
        </button>

        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label="Account menu"
          className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-sm font-semibold text-white shadow-xs ring-2 ring-white/80 transition-all duration-200 hover:scale-105 hover:ring-zinc-400 active:scale-95 dark:ring-white/10 dark:hover:ring-white/40 ${COLORS[colorIndex]}`}
        >
          {firstLetter}
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-12 w-64 origin-top-right rounded-2xl border border-zinc-200 bg-white p-3 shadow-xl backdrop-blur-xl transition-all dark:border-white/10 dark:bg-[#121216] dark:shadow-2xl"
          >
            <div className="border-b border-zinc-200 px-3 pb-3 dark:border-white/10">
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                {name}
              </p>
              <p className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">
                {userdata?.email}
              </p>
            </div>

            <button
              role="menuitem"
              onClick={handleLogout}
              className="mt-2 flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10 active:scale-98 dark:text-red-400 dark:hover:bg-red-500/15"
            >
              <span>Logout</span>
              <span className="text-xs opacity-60">→</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;