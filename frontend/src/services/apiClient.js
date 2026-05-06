import axios from "axios";
import store from "../redux/store";
import { setSession, clearSession } from "../redux/slices/authSlice";
import configService from "./configService";

const SKIP_AUTH_REFRESH = "skipAuthRefresh";
const SKIP_CSRF_PROTECTION = "skipCsrfProtection";
const XSRF_COOKIE_NAME = "XSRF-TOKEN";
const XSRF_HEADER_NAME = "X-XSRF-TOKEN";

function getBaseURL() {
    return configService.getApiBaseUrl() || undefined;
}

function hasXsrfTokenCookie() {
    return document.cookie
        .split(";")
        .map((cookie) => cookie.trim())
        .some((cookie) => cookie.startsWith(`${XSRF_COOKIE_NAME}=`));
}

function needsCsrfProtection(config = {}) {
    if (config[SKIP_CSRF_PROTECTION]) {
        return false;
    }

    const method = (config.method || "get").toLowerCase();
    return ["post", "put", "patch", "delete"].includes(method);
}

const csrfClient = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true,
    withXSRFToken: true,
    xsrfCookieName: XSRF_COOKIE_NAME,
    xsrfHeaderName: XSRF_HEADER_NAME,
    headers: {
        "Content-Type": "application/json",
    },
});

async function ensureCsrfCookie() {
    if (hasXsrfTokenCookie()) {
        return;
    }

    await csrfClient.get("/api/session/csrf", {
        [SKIP_AUTH_REFRESH]: true,
        [SKIP_CSRF_PROTECTION]: true,
    });
}

const apiClient = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true,
    withXSRFToken: true,
    xsrfCookieName: XSRF_COOKIE_NAME,
    xsrfHeaderName: XSRF_HEADER_NAME,
    headers: {
        "Content-Type": "application/json",
    },
});

const publicClient = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true,
    withXSRFToken: true,
    xsrfCookieName: XSRF_COOKIE_NAME,
    xsrfHeaderName: XSRF_HEADER_NAME,
    headers: {
        "Content-Type": "application/json",
    },
});

let refreshPromise = null;

function isAuthEndpoint(url) {
    if (!url) return false;
    const authPatterns = [
        "/auth/login",
        "/auth/register",
        "/api/session/refresh",
        "/api/session/logout",
        "/api/session/me",
    ];
    const path = url.replace(/^https?:\/\/[^/]+/, "");
    return authPatterns.some(p => path.startsWith(p));
}

apiClient.interceptors.request.use(async (config) => {
    if (needsCsrfProtection(config)) {
        await ensureCsrfCookie();
    }

    return config;
});

publicClient.interceptors.request.use(async (config) => {
    if (needsCsrfProtection(config)) {
        await ensureCsrfCookie();
    }

    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401
                && !originalRequest[SKIP_AUTH_REFRESH]
                && !isAuthEndpoint(originalRequest.url)
                && originalRequest._retryCount === undefined) {

            originalRequest._retryCount = 1;

            if (!refreshPromise) {
                refreshPromise = apiClient
                    .post("/api/session/refresh", {}, {
                        [SKIP_AUTH_REFRESH]: true,
                    })
                    .then((res) => {
                        store.dispatch(setSession(res.data));
                        return res.data;
                    })
                    .catch((refreshError) => {
                        store.dispatch(clearSession());
                        throw refreshError;
                    })
                    .finally(() => {
                        refreshPromise = null;
                    });
            }

            try {
                await refreshPromise;
                return apiClient(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

const apiClientModule = {
    apiClient,
    publicClient,
    SKIP_AUTH_REFRESH,
    SKIP_CSRF_PROTECTION,
    ensureCsrfCookie,
};

export { apiClient, publicClient, SKIP_AUTH_REFRESH, SKIP_CSRF_PROTECTION, ensureCsrfCookie };
export default apiClientModule;
