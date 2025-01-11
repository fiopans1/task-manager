import axios from "axios";
import store from "../redux/store";

// Método para iniciar sesión y almacenar el token en localStorage
const login = async (username, password) => {
  try {
    const serverUrl = store.getState().server.serverUrl;
    const response = await axios.post(
      serverUrl + `/auth/login`,
      {
        username: username,
        password: password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
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
