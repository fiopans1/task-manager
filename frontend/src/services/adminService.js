import axios from "axios";
import configService from "./configService";

const resourceCache = new Map();
const JSON_HEADERS = {
  "Content-Type": "application/json",
};

const getAuthHeaders = () => JSON_HEADERS;

const getBaseUrl = () => configService.getApiBaseUrl();

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

const searchUsers = async (query = "") => {
  const response = await axios.get(getBaseUrl() + "/api/admin/users", {
    headers: getAuthHeaders(),
    params: query ? { query } : {},
  });
  return response.data;
};

const searchUsersSuspense = (query = "") => {
  const cacheKey = "userSearch:" + query;

  if (resourceCache.has(cacheKey)) {
    return resourceCache.get(cacheKey);
  }
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    return getSuspender(
      Promise.reject(new Error("Missing server configuration"))
    );
  }
  const promise = axios
    .get(baseUrl + "/api/admin/users", {
      headers: getAuthHeaders(),
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
  const response = await axios.get(getBaseUrl() + `/api/admin/users/${userId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

const toggleUserBlock = async (userId) => {
  const response = await axios.post(
    getBaseUrl() + `/api/admin/users/${userId}/toggle-block`,
    {},
    { headers: getAuthHeaders() }
  );
  return response.data;
};

const getUserTasks = async (userId) => {
  const response = await axios.get(
    getBaseUrl() + `/api/tasks/user/${userId}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

const getUserLists = async (userId) => {
  const response = await axios.get(
    getBaseUrl() + `/api/lists/user/${userId}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

const getUserTeams = async (userId) => {
  const response = await axios.get(
    getBaseUrl() + `/api/teams/user/${userId}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

const fetchUserSearchPage = async (query = "", page = 0, size = 50) => {
  const params = { page, size };
  if (query) params.query = query;
  const response = await axios.get(getBaseUrl() + "/api/admin/users/paged", {
    headers: getAuthHeaders(),
    params,
  });
  return response.data;
};

const fetchUserTasksPage = async (userId, page = 0, size = 50) => {
  const response = await axios.get(
    getBaseUrl() + `/api/tasks/user/${userId}/paged`,
    { headers: getAuthHeaders(), params: { page, size } }
  );
  return response.data;
};

const fetchUserListsPage = async (userId, page = 0, size = 50) => {
  const response = await axios.get(
    getBaseUrl() + `/api/lists/user/${userId}/paged`,
    { headers: getAuthHeaders(), params: { page, size } }
  );
  return response.data;
};

const fetchUserTeamsPage = async (userId, page = 0, size = 50) => {
  const response = await axios.get(
    getBaseUrl() + `/api/teams/user/${userId}/paged`,
    { headers: getAuthHeaders(), params: { page, size } }
  );
  return response.data;
};

const getFeatureFlags = async () => {
  const response = await axios.get(getBaseUrl() + "/api/admin/features", {
    headers: getAuthHeaders(),
  });
  return response.data;
};

const updateFeatureFlag = async (featureName, enabled) => {
  const response = await axios.put(
    getBaseUrl() + `/api/admin/features/${featureName}`,
    { enabled },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

const getSystemMessage = async () => {
  const response = await axios.get(getBaseUrl() + "/api/admin/system-message", {
    headers: getAuthHeaders(),
  });
  return response.data;
};

const updateSystemMessage = async (message, enabled, showBeforeLogin, showAfterLogin) => {
  const response = await axios.put(
    getBaseUrl() + "/api/admin/system-message",
    { message, enabled, showBeforeLogin, showAfterLogin },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

const getPublicConfig = async () => {
  const response = await axios.get(getBaseUrl() + "/api/config", {
    headers: JSON_HEADERS,
  });
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
