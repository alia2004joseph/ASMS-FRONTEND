import React from "react";
import PropTypes from "prop-types";
import { Sparkles } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";

// Shared shell for all role dashboards during Phase One.
// Phase Two will replace this with real widgets wired to backend data.
export default function PlaceholderDashboard({ roleLabel }) {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
        Welcome{user?.firstName ? `, ${user.firstName}` : ""}!
      </h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
        {roleLabel} dashboard
      </p>

      <div className="card p-8 mt-6 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-brand-blue/10 flex items-center justify-center mb-4">
          <Sparkles size={22} className="text-brand-blue" aria-hidden="true" />
        </div>
        <p className="font-semibold text-slate-700 dark:text-slate-200">
          Phase Two will add real widgets here
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md">
          This is a placeholder. Once backend data for this role is connected, this page
          will show live stats, activity, and role-specific tools.
        </p>
      </div>
    </div>
  );
}

PlaceholderDashboard.propTypes = {
  roleLabel: PropTypes.string.isRequired,
};
