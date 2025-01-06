import axios from "axios";

const API_URL = "http://localhost:8080/api"; // URL de tu backend

// Método para iniciar sesión y almacenar el token en localStorage
const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      username,
      password,
    });
    const token = response.data.token; // Suponiendo que el backend retorna { token: "JWT_TOKEN" }

    // Guardar el token en localStorage
    localStorage.setItem("jwt", token);
    return token;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Error al iniciar sesión");
    }
    throw new Error("Error al conectar con el servidor");
  }
};

// Método para obtener el token desde localStorage
const getToken = () => {
  return localStorage.getItem("jwt");
};

// Método para cerrar sesión y eliminar el token de localStorage
const logout = () => {
  localStorage.removeItem("jwt");
};

const authService = {
  login,
  getToken,
  logout,
};

export default authService;
