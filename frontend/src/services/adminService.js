import axios from "axios";
import store from "../redux/store";
import configService from "./configService";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: "Bearer " + store.getState().auth.token,
});

const getBaseUrl = () => configService.getApiBaseUrl();

// ===== USER MANAGEMENT =====

const searchUsers = async (query = "") => {
  const response = await axios.get(getBaseUrl() + "/api/admin/users", {
    headers: getAuthHeaders(),
    params: query ? { query } : {},
  });
  return response.data;
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

// ===== USER RESOURCES (using existing controllers with admin role) =====

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

// ===== FEATURE FLAGS =====

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

// ===== SYSTEM MESSAGE =====

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

// ===== PUBLIC CONFIG (no auth needed) =====

const getPublicConfig = async () => {
  const response = await axios.get(getBaseUrl() + "/api/config", {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

const adminService = {
  searchUsers,
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
};

export default adminService;
