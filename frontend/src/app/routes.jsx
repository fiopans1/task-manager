import { lazy } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import ProtectedRoute from "@/app/guards/ProtectedRoute";
import FeatureGuard from "@/app/guards/FeatureGuard";
import AppLayout from "@/app/layout/AppLayout";
import { LandingPage, LoginPage, RegisterPage, OAuth2LoginPage } from "@/features/auth";

const DashboardPage = lazy(() =>
  import("@/features/dashboard").then((module) => ({ default: module.DashboardPage })),
);
const TasksPage = lazy(() =>
  import("@/features/tasks").then((module) => ({ default: module.TasksPage })),
);
const TaskDetailsPage = lazy(() =>
  import("@/features/tasks").then((module) => ({ default: module.TaskDetailsPage })),
);
const ListsPage = lazy(() =>
  import("@/features/lists").then((module) => ({ default: module.ListsPage })),
);
const ListDetailsPage = lazy(() =>
  import("@/features/lists").then((module) => ({ default: module.ListDetailsPage })),
);
const TeamsPage = lazy(() =>
  import("@/features/teams").then((module) => ({ default: module.TeamsPage })),
);
const TeamDashboardPage = lazy(() =>
  import("@/features/teams").then((module) => ({ default: module.TeamDashboardPage })),
);
const CalendarPage = lazy(() =>
  import("@/features/calendar").then((module) => ({ default: module.CalendarPage })),
);
const AdminPage = lazy(() =>
  import("@/features/admin").then((module) => ({ default: module.AdminPage })),
);
const SettingsPage = lazy(() =>
  import("@/features/settings").then((module) => ({ default: module.SettingsPage })),
);

export const PATH_META = [
  {
    match: /^\/home\/tasks\/[^/]+/,
    title: "Task details",
    description: "View and update the details of a single task in Task Manager.",
  },
  {
    match: /^\/home\/tasks/,
    title: "Tasks",
    description: "Browse, filter and manage your tasks in Task Manager.",
  },
  {
    match: /^\/home\/calendar/,
    title: "Calendar",
    description: "Plan your work on the Task Manager calendar view.",
  },
  {
    match: /^\/home\/lists\/[^/]+/,
    title: "List details",
    description: "Open a list and review its items in Task Manager.",
  },
  {
    match: /^\/home\/lists/,
    title: "Lists",
    description: "Browse and manage your custom task lists in Task Manager.",
  },
  {
    match: /^\/home\/teams\/[^/]+/,
    title: "Team dashboard",
    description: "Collaborate with your team in Task Manager.",
  },
  {
    match: /^\/home\/teams/,
    title: "Teams",
    description: "Browse and manage your teams in Task Manager.",
  },
  {
    match: /^\/home\/admin/,
    title: "Admin panel",
    description: "Administrative tools for Task Manager.",
  },
  {
    match: /^\/home\/settings/,
    title: "Settings",
    description: "Manage your profile and account security in Task Manager.",
  },
  {
    match: /^\/home$/,
    title: "Dashboard",
    description:
      "Task Manager dashboard — your tasks, lists, calendar and time tracking.",
  },
];

export function getMetaForPath(pathname) {
  return (
    PATH_META.find((entry) => entry.match.test(pathname)) ?? {
      title: "Dashboard",
      description:
        "Task Manager dashboard — your tasks, lists, calendar and time tracking.",
    }
  );
}

export function AppRoutes({ isAuthenticated, onLogin, onLogOut }) {
  return (
    <Routes>
      <Route path="/health" element={<div>OK</div>} />
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/home" replace /> : <LandingPage />
        }
      />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage onLogin={onLogin} />} />
      <Route
        path="/oauth2-login"
        element={
          isAuthenticated ? <Navigate to="/home" replace /> : <OAuth2LoginPage />
        }
      />
      <Route
        path="/home"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <AppLayout onLogOut={onLogOut} />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route
          path="tasks"
          element={
            <FeatureGuard featureKey="tasks">
              <Outlet />
            </FeatureGuard>
          }
        >
          <Route index element={<TasksPage />} />
          <Route path=":id" element={<TaskDetailsPage />} />
        </Route>
        <Route
          path="calendar"
          element={
            <FeatureGuard featureKey="calendar">
              <CalendarPage />
            </FeatureGuard>
          }
        />
        <Route
          path="lists"
          element={
            <FeatureGuard featureKey="lists">
              <Outlet />
            </FeatureGuard>
          }
        >
          <Route index element={<ListsPage />} />
          <Route path=":id" element={<ListDetailsPage />} />
        </Route>
        <Route
          path="teams"
          element={
            <FeatureGuard featureKey="teams">
              <Outlet />
            </FeatureGuard>
          }
        >
          <Route index element={<TeamsPage />} />
          <Route path=":id" element={<TeamDashboardPage />} />
        </Route>
        <Route path="admin" element={<AdminPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
