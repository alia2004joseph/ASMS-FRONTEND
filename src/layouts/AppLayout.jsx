import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar.jsx";
import TopNav from "../components/layout/TopNav.jsx";
import { ROLE_NAVIGATION } from "../config/roleNavigation.js";
import { useAuth } from "../hooks/useAuth.js";

export default function AppLayout() {
  const { user, role } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const location = useLocation();

  // Close the mobile drawer automatically whenever the route changes.
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const navItems = ROLE_NAVIGATION[role] || [];
  const basePathMap = {
    super_admin: "/app/admin",
    school_admin: "/app/admin",
    teacher: "/app/teacher",
    student: "/app/student",
    guardian: "/app/guardian",
    accountant: "/app/accountant",
  };
  const basePath = basePathMap[role] || "/app/admin";

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-navy-950 flex">
      <Sidebar
        navItems={navItems}
        basePath={basePath}
        role={role}
        user={user}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <TopNav
          onMenuClick={() => setDrawerOpen(true)}
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        />
        <main className="p-3 sm:p-6 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
