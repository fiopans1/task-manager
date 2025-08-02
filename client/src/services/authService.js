import axios from "axios";
import store from "../redux/store";
import { setToken, clearToken } from "../redux/slices/authSlice";
import { decodeJwt } from "jose";
// Método para iniciar sesión y almacenar el token en localStorage
const login = async (username, password) => {
  try {
    const serverUrl = process.env.REACT_APP_BACKEND_URL;
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
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error);
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
    const serverUrl = process.env.REACT_APP_BACKEND_URL;
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

// Verificar si el token es válido (no expirado)
const isTokenValid = () => {
  const token = getToken();
  if (!token) return false;

  try {
    const payload = decodeJwt(token);
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch (error) {
    console.error("Error validating token:", error);
    return false;
  }
};

// ============== NUEVOS MÉTODOS OAUTH2 ==============


// Iniciar login con OAuth2 (redirige al backend)
const loginWithOAuth2 = (provider) => {
  const serverUrl = process.env.REACT_APP_BACKEND_URL;
  const oauth2Url = `${serverUrl}/oauth2/authorization/${provider}`;
  
  window.location.href = oauth2Url;
};

// Procesar token OAuth2 después del redirect
const processOAuth2Token = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const error = urlParams.get('error');
  
  
  if (error) {
    const message = urlParams.get('message') || 'Error de autenticación OAuth2';
    throw new Error(decodeURIComponent(message));
  }
  
  if (token) {
    store.dispatch(setToken(token));
    
    // Limpiar parámetros de la URL
    const newUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
    
    return token;
  }
  
  return null;
};

// Verificar si hay un token OAuth2 pendiente al cargar la página
const checkForOAuth2Token = () => {
  // Solo procesar si hay parámetros en la URL
  const urlParams = new URLSearchParams(window.location.search);
  if (!urlParams.has('token') && !urlParams.has('error')) {
    return null;
  }

  try {
    return processOAuth2Token();
  } catch (error) {
    console.error('Error procesando token OAuth2:', error);
    // Limpiar URL en caso de error
    const newUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
    throw error;
  }
};

// Obtener email del token (útil para OAuth2)
const getUserEmail = () => {
  const token = store.getState().auth.token;
  if (token) {
    try {
      const payload = decodeJwt(token);
      return payload.email || payload.sub;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
  return null;
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
  getUserEmail,
  isTokenValid,

  // Métodos OAuth2
  loginWithOAuth2,
  processOAuth2Token,
  checkForOAuth2Token,
};

export default authService;
