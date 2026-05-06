import store from "../redux/store";
import { setSession, clearSession } from "../redux/slices/authSlice";
import { apiClient, SKIP_AUTH_REFRESH, ensureCsrfCookie } from "./apiClient";
import configService from "./configService";

const ensureCsrfToken = async () => {
    await ensureCsrfCookie();
};

const login = async (username, password) => {
    await ensureCsrfToken();

    const response = await apiClient.post("/auth/login", {
        username,
        password,
    }, {
        [SKIP_AUTH_REFRESH]: true,
    });

    store.dispatch(setSession(response.data));
    return response.data;
};

const getSession = async () => {
    try {
        const response = await apiClient.get("/api/session/me", {
            [SKIP_AUTH_REFRESH]: true,
        });
        store.dispatch(setSession(response.data));
        return response.data?.authenticated ? response.data : null;
    } catch (error) {
        const status = error.response?.status;
        if (status === 401) {
            try {
                return await refreshSession();
            } catch (refreshError) {
                console.debug("Session expired, refresh failed:", refreshError.message);
            }
        }
        store.dispatch(clearSession());
        return null;
    }
};

const refreshSession = async () => {
    const response = await apiClient.post("/api/session/refresh", {}, {
        [SKIP_AUTH_REFRESH]: true,
    });

    store.dispatch(setSession(response.data));
    return response.data;
};

const logout = async () => {
    try {
        await ensureCsrfToken();
        await apiClient.post("/api/session/logout", {}, {
            [SKIP_AUTH_REFRESH]: true,
        });
    } catch (e) {
        console.debug("Logout request failed, clearing local state:", e);
    }

    store.dispatch(clearSession());
};

const initializeSession = async () => {
    await ensureCsrfToken();
    const session = await getSession();
    return session;
};

const loginWithOAuth2 = async (provider) => {
    await ensureCsrfToken();
    const baseUrl = configService.getApiBaseUrl();
    const serverUrl = baseUrl || window.location.origin;
    window.location.href = `${serverUrl}/oauth2/authorization/${provider}`;
};

const handleOAuth2Redirect = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");
    const message = urlParams.get("message");

    if (error) {
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        throw new Error(decodeURIComponent(message || "OAuth2 authentication error"));
    }

    await ensureCsrfToken();
    const session = await getSession();
    if (session) {
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        return session;
    }
    return null;
};

const register = async (formData) => {
    await ensureCsrfToken();

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

    const response = await apiClient.post("/auth/register", userData);
    return response.data;
};

const getAccessExpiresAt = () => {
    return store.getState().auth.accessExpiresAt;
};

const getUsername = () => {
    const user = store.getState().auth.user;
    return user ? user.username : null;
};

const getDisplayName = () => {
    const user = store.getState().auth.user;
    return user ? user.displayName || user.username : null;
};

const getRoles = () => {
    return Promise.resolve(store.getState().auth.roles);
};

const isAuthenticated = () => {
    return store.getState().auth.isAuthenticated;
};

const authService = {
    login,
    logout,
    getSession,
    refreshSession,
    initializeSession,
    ensureCsrfToken,

    loginWithOAuth2,
    handleOAuth2Redirect,

    register,

    getAccessExpiresAt,
    getUsername,
    getDisplayName,
    getRoles,
    isAuthenticated,
};

export default authService;
