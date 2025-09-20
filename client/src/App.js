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
// import AdminPanel from "./components/adminpanel/AdminPanel";
import { infoToast, errorToast, successToast } from "./components/common/Noty";
import ListDetailsGeneral from "./components/lists/ListDetails/ListDetailsGeneral";
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 1. Verificar si hay un token OAuth2 en la URL
        const oauth2Token = authService.checkForOAuth2Token();
        if (oauth2Token) {
          setIsAuthenticated(true);
          successToast("Login successfully with OAuth2");
          navigate("/home", { replace: true });
          return;
        }

        // 2. Verificar token existente
        const existingToken = authService.getToken();
        if (existingToken) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error during auth initialization:", error);
        errorToast(error.message || "Authentication error occurred");

        authService.logout();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [navigate]);

  const handleLogin = (token) => {
    setIsAuthenticated(true); // Cambiar estado de autenticación
    navigate("/home"); // Redirigir a la página de inicio
  };

  const handleLogout = () => {
    authService.logout(); // Eliminar el token
    infoToast("Logged out");
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Verificando autenticación...</p>
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
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
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
        <Route path="/home/tasks" element={<OutletUtil />}>
          <Route index element={<Tasks />} />
          <Route path=":id" element={<TaskDetails />} />
        </Route>
        <Route path="/home/calendar" element={<CalendarComponent />} />
        <Route path="/home/lists" element={<OutletUtil />}>
          <Route index element={<Lists />} />
          <Route path=":id" element={<ListDetailsGeneral />} />
        </Route>
        {/* <Route path="/home/admin" element={<AdminPanel />} /> */}
      </Route>
    </Routes>
  );
}

export default App;
