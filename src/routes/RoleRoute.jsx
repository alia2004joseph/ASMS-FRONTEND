import React from "react";
import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

export default function RoleRoute({ allowedRoles, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const currentRole = String(user.role || "")
    .trim()
    .toLowerCase();

  const normalizedAllowedRoles = allowedRoles.map((role) =>
    String(role).trim().toLowerCase()
  );

  if (!normalizedAllowedRoles.includes(currentRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

RoleRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
  children: PropTypes.node.isRequired,
};