import { apiClient, publicClient } from "./apiClient";

const resourceCache = new Map();

function getSuspender(promise) {
    let status = "pending";
    let result;
    const suspender = promise.then(
        (response) => {
            status = "success";
            result = response;
        },
        (error) => {
            status = "error";
            result = error;
        }
    );
    const read = () => {
        switch (status) {
            case "pending":
                throw suspender;
            case "error":
                throw result;
            default:
                return result;
        }
    };
    return { read };
}

const invalidateUserSearchCache = () => {
    for (const key of resourceCache.keys()) {
        if (key.startsWith("userSearch:")) {
            resourceCache.delete(key);
        }
    }
};

// ===== USER MANAGEMENT =====

const searchUsers = async (query = "") => {
    const response = await apiClient.get("/api/admin/users", {
        params: query ? { query } : {},
    });
    return response.data;
};

const searchUsersSuspense = (query = "") => {
    const cacheKey = "userSearch:" + query;
    if (resourceCache.has(cacheKey)) {
        return resourceCache.get(cacheKey);
    }
    const promise = apiClient
        .get("/api/admin/users", {
            params: query ? { query } : {},
        })
        .then((response) => response.data)
        .catch((error) => {
            resourceCache.delete(cacheKey);
            throw error;
        });
    const resource = getSuspender(promise);
    resourceCache.set(cacheKey, resource);
    return resource;
};

const getUserById = async (userId) => {
    const response = await apiClient.get("/api/admin/users/" + userId);
    return response.data;
};

const toggleUserBlock = async (userId) => {
    const response = await apiClient.post("/api/admin/users/" + userId + "/toggle-block", {});
    return response.data;
};

// ===== USER RESOURCES =====

const getUserTasks = async (userId) => {
    const response = await apiClient.get("/api/tasks/user/" + userId);
    return response.data;
};

const getUserLists = async (userId) => {
    const response = await apiClient.get("/api/lists/user/" + userId);
    return response.data;
};

const getUserTeams = async (userId) => {
    const response = await apiClient.get("/api/teams/user/" + userId);
    return response.data;
};

// ===== PAGINATED FETCHERS =====

const fetchUserSearchPage = async (query = "", page = 0, size = 50) => {
    const params = { page, size };
    if (query) params.query = query;
    const response = await apiClient.get("/api/admin/users/paged", { params });
    return response.data;
};

const fetchUserTasksPage = async (userId, page = 0, size = 50) => {
    const response = await apiClient.get("/api/tasks/user/" + userId + "/paged", {
        params: { page, size },
    });
    return response.data;
};

const fetchUserListsPage = async (userId, page = 0, size = 50) => {
    const response = await apiClient.get("/api/lists/user/" + userId + "/paged", {
        params: { page, size },
    });
    return response.data;
};

const fetchUserTeamsPage = async (userId, page = 0, size = 50) => {
    const response = await apiClient.get("/api/teams/user/" + userId + "/paged", {
        params: { page, size },
    });
    return response.data;
};

// ===== FEATURE FLAGS =====

const getFeatureFlags = async () => {
    const response = await apiClient.get("/api/admin/features");
    return response.data;
};

const updateFeatureFlag = async (featureName, enabled) => {
    const response = await apiClient.put(
        "/api/admin/features/" + featureName,
        { enabled }
    );
    return response.data;
};

// ===== SYSTEM MESSAGE =====

const getSystemMessage = async () => {
    const response = await apiClient.get("/api/admin/system-message");
    return response.data;
};

const updateSystemMessage = async (message, enabled, showBeforeLogin, showAfterLogin) => {
    const response = await apiClient.put(
        "/api/admin/system-message",
        { message, enabled, showBeforeLogin, showAfterLogin }
    );
    return response.data;
};

// ===== PUBLIC CONFIG (no auth needed) =====

const getPublicConfig = async () => {
    const response = await publicClient.get("/api/config");
    return response.data;
};

const adminService = {
    searchUsers,
    searchUsersSuspense,
    invalidateUserSearchCache,
    getUserById,
    toggleUserBlock,
    getUserTasks,
    getUserLists,
    getUserTeams,
    getFeatureFlags,
    updateFeatureFlag,
    getSystemMessage,
    updateSystemMessage,
    getPublicConfig,
    fetchUserSearchPage,
    fetchUserTasksPage,
    fetchUserListsPage,
    fetchUserTeamsPage,
};

export default adminService;
