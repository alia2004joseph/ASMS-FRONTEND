import React from "react";
import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import { School, X } from "lucide-react";
import { ROLE_LABELS } from "../../config/roleNavigation.js";

export default function Sidebar({ navItems, basePath, role, user, isOpen, onClose }) {
  return (
    <>
      {/* Backdrop, mobile only */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed lg:static z-40 top-0 left-0 h-full w-64 bg-navy-900 text-white flex flex-col
        transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
        aria-label="Main navigation"
      >
        <div className="p-5 flex items-center gap-2 border-b border-white/10">
          <School size={22} className="text-amber-300 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-bold leading-none">ALIA</p>
            <p className="text-[10px] tracking-widest text-slate-400">SCHOOL MANAGEMENT</p>
          </div>
          <button
            className="ml-auto lg:hidden"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const to = item.path ? `${basePath}/${item.path}` : basePath;
            return (
              <NavLink
                key={item.label}
                to={to}
                end={item.path === ""}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition
                  ${isActive ? "bg-brand-blue text-white font-medium" : "text-slate-300 hover:bg-white/5"}`
                }
              >
                <Icon size={17} className="shrink-0" aria-hidden="true" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold">
              {(user?.firstName?.[0] ?? "U").toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              {user ? `${user.firstName} ${user.lastName}` : "Guest User"}
            </p>
            <p className="text-xs text-slate-400 truncate">{ROLE_LABELS[role] || role}</p>
          </div>
        </div>
      </aside>
    </>
  );
}

Sidebar.propTypes = {
  navItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
      icon: PropTypes.elementType.isRequired,
    })
  ).isRequired,
  basePath: PropTypes.string.isRequired,
  role: PropTypes.string,
  user: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
