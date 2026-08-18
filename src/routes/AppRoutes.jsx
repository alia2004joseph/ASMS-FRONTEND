import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage.jsx";
import SignupPage from "../pages/auth/SignupPage.jsx";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage.jsx";
import UnauthorizedPage from "../pages/system/UnauthorizedPage.jsx";
import NotFoundPage from "../pages/system/NotFoundPage.jsx";
import AppLayout from "../layouts/AppLayout.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import RoleRoute from "./RoleRoute.jsx";
import AdminDashboard from "../pages/dashboards/AdminDashboard.jsx";
import TeacherDashboard from "../pages/dashboards/TeacherDashboard.jsx";
import StudentDashboard from "../pages/dashboards/StudentDashboard.jsx";
import GuardianDashboard from "../pages/dashboards/GuardianDashboard.jsx";
import AccountantDashboard from "../pages/dashboards/AccountantDashboard.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected application shell */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="admin/*"
          element={
            <RoleRoute allowedRoles={["admin", "super_admin", "school_admin"]}>
              <AdminDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="teacher/*"
          element={
            <RoleRoute allowedRoles={["teacher", "admin", "super_admin", "school_admin"]}>
              <TeacherDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="student/*"
          element={
            <RoleRoute allowedRoles={["student", "admin", "super_admin", "school_admin"]}>
              <StudentDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="guardian/*"
          element={
            <RoleRoute allowedRoles={["guardian", "admin", "super_admin", "school_admin"]}>
              <GuardianDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="accountant/*"
          element={
            <RoleRoute allowedRoles={["accountant", "admin", "super_admin", "school_admin"]}>
              <AccountantDashboard />
            </RoleRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
