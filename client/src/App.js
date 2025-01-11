import React, { useState, useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import authService from "./services/authService";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import MainApp from "./pages/MainApp";
import RegisterPage from "./components/auth/RegisterPage";
import LoginPage from "./components/auth/LoginPage";
import Prueba1 from "./components/prueba1";
import Prueba2 from "./components/prueba2";
import HomePage from "./pages/HomePage";
import { useNavigate } from "react-router-dom";
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
        <Route path="/home/prueba1" element={<Prueba1 />} />
        <Route path="/home/prueba2" element={<Prueba2 />} />
      </Route>
    </Routes>
  );
}

export default App;
