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
import TaskDetails from "./components/tasks/TaskDetails";
import Tasks from "./components/tasks/Tasks";
import OutletUtil from "./components/common/OutletUtil";
import ListDetails from "./components/lists/ListDetails";
import Home from "./components/Home";
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    // Verificar si el token existe al cargar la aplicación
    const token = authService.getToken();
    setIsAuthenticated(!!token); // Si hay un token, estamos autenticados
  }, []);

  const handleLogin = (token) => {
    setIsAuthenticated(true); // Cambiar estado de autenticación
    navigate("/home"); // Redirigir a la página de inicio
  };

  const handleLogout = () => {
    authService.logout(); // Eliminar el token
    setIsAuthenticated(false);
  };

  return (
    <Routes>
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
          <Route path=":id" element={<ListDetails />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
