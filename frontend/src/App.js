import React, { useState, useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import authService from "./services/authService";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import MainApp from "./pages/MainApp";
import RegisterPage from "./components/auth/RegisterPage";
import LoginPage from "./components/auth/LoginPage";
import HomePage from "./pages/HomePage";
import { useNavigate } from "react-router-dom";
import CalendarComponent from "./components/CalendarComponent";
import Lists from "./components/lists/Lists";
import TaskDetails from "./components/tasks/TaskDetails/TaskDetails";
import Tasks from "./components/tasks/Tasks";
import OutletUtil from "./components/common/OutletUtil";
import Home from "./components/Home";
import OAuth2Login from "./components/auth/OAuth2Login";
import AdminPanel from "./components/adminpanel/AdminPanel";
import FeatureGuard from "./components/common/FeatureGuard";
import { infoToast, errorToast } from "./components/common/Noty";
import ListDetailsGeneral from "./components/lists/ListDetails/ListDetailsGeneral";
import Teams from "./components/teams/Teams";
import TeamDashboard from "./components/teams/TeamDashboard";
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await authService.loadSession();
        setIsAuthenticated(true);
      } catch (error) {
        authService.resetSession();
        setIsAuthenticated(false);

        if (error.response && error.response.status !== 401) {
          console.error("Error during auth initialization:", error);
          errorToast(error.message || "Authentication error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    navigate("/home");
  };

  const handleLogout = () => {
    authService.logout();
    infoToast("Logged out");
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Verifying authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/health" element={<div>OK</div>} />
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/home" replace />
          ) : (
            <>
              <HomePage />
            </>
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/home" replace /> : <RegisterPage />
        }
      />
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/home" replace />
          ) : (
            <LoginPage onLogin={handleLogin} />
          )
        }
      />
      <Route
        path="/oauth2-login"
        element={
          isAuthenticated ? (
            <Navigate to="/home" replace />
          ) : (
            <OAuth2Login onLogin={handleLogin} />
          )
        }
      />
      <Route
        path="/home"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <MainApp onLogOut={handleLogout} />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="/home/tasks" element={<FeatureGuard featureKey="tasks"><OutletUtil /></FeatureGuard>}>
          <Route index element={<Tasks />} />
          <Route path=":id" element={<TaskDetails />} />
        </Route>
        <Route path="/home/calendar" element={<FeatureGuard featureKey="calendar"><CalendarComponent /></FeatureGuard>} />
        <Route path="/home/lists" element={<FeatureGuard featureKey="lists"><OutletUtil /></FeatureGuard>}>
          <Route index element={<Lists />} />
          <Route path=":id" element={<ListDetailsGeneral />} />
        </Route>
        <Route path="/home/teams" element={<FeatureGuard featureKey="teams"><OutletUtil /></FeatureGuard>}>
          <Route index element={<Teams />} />
          <Route path=":id" element={<TeamDashboard />} />
        </Route>
        <Route path="/home/admin" element={<AdminPanel />} />
      </Route>
    </Routes>
  );
}

export default App;
