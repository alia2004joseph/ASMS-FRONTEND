import React from "react";
import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

export default function RoleRoute({ allowedRoles, children }) {
  const { user, isLoading, loading } = useAuth();
  
  // Support both isLoading and legacy loading property
  const isAuthLoading = isLoading ?? loading ?? false;

  if (isAuthLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const currentRole = String(user.role || "").trim().toLowerCase();
  const normalizedAllowedRoles = allowedRoles.map((role) =>
    String(role).trim().toLowerCase()
  );

  // Allow admin and super_admin access to all views for testing & administration
  if (currentRole === "admin" || currentRole === "super_admin" || currentRole === "school_admin") {
    return children;
  }

  if (!normalizedAllowedRoles.includes(currentRole)) {
    console.warn(`[RoleRoute] Access denied. User role '${currentRole}' is not in allowed roles:`, normalizedAllowedRoles);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

RoleRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
  children: PropTypes.node.isRequired,
};
