import React, { useState } from "react";
import PropTypes from "prop-types";
import { Menu, Bell, Sun, Moon, ChevronDown, LogOut, Settings } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";

export default function TopNav({ onMenuClick, pageTitle, theme, onToggleTheme }) {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-navy-900 border-b border-slate-200 dark:border-white/10 px-3 sm:px-6 py-3 flex items-center gap-3 sticky top-0 z-20">
      <button
        className="lg:hidden text-slate-600 dark:text-slate-300"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <Menu size={22} aria-hidden="true" />
      </button>

      {pageTitle && (
        <h1 className="hidden sm:block text-base font-semibold text-slate-800 dark:text-slate-100">
          {pageTitle}
        </h1>
      )}

      <div className="flex-1" />

      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        <button
          onClick={onToggleTheme}
          aria-label="Toggle color theme"
          className="text-slate-500 dark:text-slate-300"
        >
          {theme === "dark" ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
        </button>

        <button aria-label="View notifications" className="relative text-slate-500 dark:text-slate-300">
          <Bell size={19} aria-hidden="true" />
        </button>

        <div className="relative">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2"
            aria-haspopup="true"
            aria-expanded={profileOpen}
            aria-label="Open profile menu"
          >
            <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0 flex items-center justify-center text-xs font-semibold text-slate-700 dark:text-slate-100">
              {(user?.firstName?.[0] ?? "U").toUpperCase()}
            </div>
            <ChevronDown size={14} className="hidden sm:block text-slate-400" aria-hidden="true" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 card p-1 z-30">
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200">
                <Settings size={15} aria-hidden="true" /> Settings
              </button>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600"
              >
                <LogOut size={15} aria-hidden="true" /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

TopNav.propTypes = {
  onMenuClick: PropTypes.func.isRequired,
  pageTitle: PropTypes.string,
  theme: PropTypes.string,
  onToggleTheme: PropTypes.func,
};
