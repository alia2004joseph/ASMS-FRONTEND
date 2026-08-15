import React from "react";
import PropTypes from "prop-types";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import LoadingState from "../components/common/LoadingState.jsx";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingState label="Checking your session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
