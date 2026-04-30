import axios from "./httpClient";
import store from "../redux/store";
import { setSession, clearSession } from "../redux/slices/authSlice";
import configService from "./configService";

const applySession = (session) => {
  store.dispatch(setSession(session));
  return session;
};

const resetSession = () => {
  store.dispatch(clearSession());
};

const getSessionState = () => store.getState().auth;

const login = async (username, password) => {
  try {
    const serverUrl = configService.getApiBaseUrl();
    const response = await axios.post(
      serverUrl + `/auth/login`,
      { username, password },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return applySession(response.data);
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error);
    }
    throw new Error("Error connecting to server");
  }
};

const loadSession = async () => {
  const serverUrl = configService.getApiBaseUrl();
  const response = await axios.get(serverUrl + "/api/session", {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return applySession(response.data);
};

const register = async (formData) => {
  try {
    const userData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      name: {
        name: formData.name,
        surname1: formData.surname1,
        surname2: formData.surname2,
      },
    };
    const serverUrl = configService.getApiBaseUrl();
    const response = await axios.post(serverUrl + "/auth/register", userData);
    return response.data;
  } catch (error) {
    if (
      error.response &&
      error.response.data &&
      error.response.data.errorCount > 0
    ) {
      throw new Error(error.response.data.errorMessages.join(", "));
    }
    throw new Error("Error connecting to server");
  }
};

const getUsername = () => getSessionState().username;

const getRoles = () => getSessionState().roles || [];

const isTokenValid = () => {
  const { isAuthenticated, expiresAt } = getSessionState();
  if (!isAuthenticated || !expiresAt) return false;
  return expiresAt > Date.now();
};

const getTokenTimeRemaining = () => {
  const { expiresAt } = getSessionState();
  if (!expiresAt) return 0;
  return Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
};

const refreshToken = async () => {
  try {
    const serverUrl = configService.getApiBaseUrl();
    const response = await axios.post(
      serverUrl + "/api/session/refresh",
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return applySession(response.data);
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw new Error("Error refreshing token");
  }
};

const loginWithOAuth2 = (provider) => {
  const serverUrl = configService.getApiBaseUrl();
  const oauth2Url = `${serverUrl}/oauth2/authorization/${provider}`;

  window.location.href = oauth2Url;
};

const getUserEmail = () => getSessionState().email;

const logout = async () => {
  const serverUrl = configService.getApiBaseUrl();

  try {
    await axios.post(
      serverUrl + "/auth/logout",
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.warn("Error logging out from server:", error);
  } finally {
    resetSession();
  }
};

const authService = {
  login,
  loadSession,
  register,
  logout,
  resetSession,
  getUsername,
  getRoles,
  getUserEmail,
  isTokenValid,
  getTokenTimeRemaining,
  refreshToken,
  loginWithOAuth2,
};

export default authService;
