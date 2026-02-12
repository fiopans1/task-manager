import axios from "axios";
import store from "../redux/store";
import { setToken, clearToken } from "../redux/slices/authSlice";
import { decodeJwt } from "jose";
import configService from "./configService";

// Login method: authenticate user and store token in localStorage
const login = async (username, password) => {
  try {
    const serverUrl = configService.getApiBaseUrl();
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
    const token = response.data.token;

    // Save token in localStorage
    store.dispatch(setToken(token));
    return token;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error);
    }
    throw new Error("Error connecting to server");
  }
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

// Get token from localStorage
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

// Verify if token is valid (not expired)
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

// OAuth2 Methods

// Start OAuth2 login (redirects to backend)
const loginWithOAuth2 = (provider) => {
  const serverUrl = configService.getApiBaseUrl();
  const oauth2Url = `${serverUrl}/oauth2/authorization/${provider}`;
  
  window.location.href = oauth2Url;
};

// Process OAuth2 token after redirect
const processOAuth2Token = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const error = urlParams.get('error');
  
  
  if (error) {
    const message = urlParams.get('message') || 'OAuth2 authentication error';
    throw new Error(decodeURIComponent(message));
  }
  
  if (token) {
    store.dispatch(setToken(token));
    
    // Clean URL parameters
    const newUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
    
    return token;
  }
  
  return null;
};

// Check for pending OAuth2 token when page loads
const checkForOAuth2Token = () => {
  // Only process if URL has parameters
  const urlParams = new URLSearchParams(window.location.search);
  if (!urlParams.has('token') && !urlParams.has('error')) {
    return null;
  }

  try {
    return processOAuth2Token();
  } catch (error) {
    console.error('Error processing OAuth2 token:', error);
    // Clean URL on error
    const newUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
    throw error;
  }
};

// Get email from token (useful for OAuth2)
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


// Logout: clear token from localStorage
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
