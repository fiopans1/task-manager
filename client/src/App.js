import React, { useState, useEffect } from "react";
import {Route, Routes, Navigate } from "react-router-dom";
import authService from "./services/authService";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import MainApp from "./components/mainapp/MainApp";
import RegisterPage from "./components/auth/RegisterPage";
import LoginPage from "./components/auth/LoginPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar si el token existe al cargar la aplicación
    const token = authService.getToken();
    setIsAuthenticated(!!token); // Si hay un token, estamos autenticados
  }, []);

  const handleLogin = (token) => {
    setIsAuthenticated(true); // Cambiar estado de autenticación
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
              <Navigate to="/main" replace />
            ) : (
              <>
                <h1>Bienvenido</h1>
                <LoginPage onLogin={handleLogin} />
                <RegisterPage />
              </>
            )
          }
        />
        <Route
          path="/main"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <MainApp onLogOut={handleLogout} />
            </ProtectedRoute>
          }
        />
      </Routes>
  );
}

export default App;
