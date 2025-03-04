import axios from "axios";
import store from "../redux/store";
import { setToken, clearToken } from "../redux/slices/authSlice";
import { decodeJwt } from "jose";
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
    store.dispatch(setToken(token));
    return token;
  } catch (error) {
    if (
      error.response &&
      error.response.data &&
      error.response.data.errorCount > 0
    ) {
      throw new Error(error.response.data.errorMessages.join(", "));
    }
    throw new Error("Error al conectar con el servidor");
  }
};

const register = async (formData) => {
  try {
    const userData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      age: formData.age,
      name: {
        name: formData.name,
        surname1: formData.surname1,
        surname2: formData.surname2,
      },
    };
    const serverUrl = store.getState().server.serverUrl;
    const response = await axios.post(serverUrl + "/auth/register", userData);
    return response.data; // Puedes devolver los datos de respuesta, como el token, si es necesario
  } catch (error) {
    if (
      error.response &&
      error.response.data &&
      error.response.data.errorCount > 0
    ) {
      throw new Error(error.response.data.errorMessages.join(", "));
    }
    // Puedes manejar los errores aquí (por ejemplo, mostrar un mensaje de error)
    throw new Error("Error al conectar con el servidor");
  }
};

// Método para obtener el token desde localStorage
const getToken = () => {
  return store.getState().auth.token;
};
const getUsername = () => {
  const token = store.getState().auth.token;
  if (token) {
    const payload = decodeJwt(token);
    return payload.sub;
  }
};

const getRoles = () => {
  const token = store.getState().auth.token;
  if (token) {
    const payload = decodeJwt(token);
    return payload.roles.split(",");
  }
};

// Método para cerrar sesión y eliminar el token de localStorage
const logout = () => {
  store.dispatch(clearToken());
};
const authService = {
  login,
  register,
  getToken,
  logout,
  getUsername,
  getRoles,
};

export default authService;
