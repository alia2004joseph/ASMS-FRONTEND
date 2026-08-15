import React from "react";
import { Routes, Route } from "react-router-dom";
import PlaceholderDashboard from "./PlaceholderDashboard.jsx";
import UsersPage from "./admin/UsersPage.jsx";

// Phase Two: Users (approvals + access codes) is wired to real data.
// Everything else on the admin nav still renders the shared placeholder
// until its backend app is wired up next.
export default function AdminDashboard() {
  return (
    <Routes>
      <Route index element={<PlaceholderDashboard roleLabel="School Administrator" />} />
      <Route path="users/*" element={<UsersPage />} />
      <Route path="academics/*" element={<PlaceholderDashboard roleLabel="Academics" />} />
      <Route path="timetable/*" element={<PlaceholderDashboard roleLabel="Timetable" />} />
      <Route path="attendance/*" element={<PlaceholderDashboard roleLabel="Attendance" />} />
      <Route path="grading/*" element={<PlaceholderDashboard roleLabel="Grading" />} />
      <Route path="finance/*" element={<PlaceholderDashboard roleLabel="Finance" />} />
      <Route path="reports/*" element={<PlaceholderDashboard roleLabel="Reports" />} />
      <Route path="communication/*" element={<PlaceholderDashboard roleLabel="Communication" />} />
      <Route path="ai-assistant/*" element={<PlaceholderDashboard roleLabel="AI Assistant" />} />
      <Route path="settings/*" element={<PlaceholderDashboard roleLabel="Settings" />} />
    </Routes>
  );
}
