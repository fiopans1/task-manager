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

// ===== USER TASKS =====

const getUserTasks = async (userId) => {
  const response = await axios.get(
    getBaseUrl() + `/api/admin/users/${userId}/tasks`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

const updateUserTask = async (userId, taskId, taskData) => {
  const response = await axios.put(
    getBaseUrl() + `/api/admin/users/${userId}/tasks/${taskId}`,
    taskData,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

const deleteUserTask = async (userId, taskId) => {
  const response = await axios.delete(
    getBaseUrl() + `/api/admin/users/${userId}/tasks/${taskId}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// ===== USER LISTS =====

const getUserLists = async (userId) => {
  const response = await axios.get(
    getBaseUrl() + `/api/admin/users/${userId}/lists`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

const deleteUserList = async (userId, listId) => {
  const response = await axios.delete(
    getBaseUrl() + `/api/admin/users/${userId}/lists/${listId}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

const updateUserList = async (userId, listId, listData) => {
  const response = await axios.put(
    getBaseUrl() + `/api/admin/users/${userId}/lists/${listId}`,
    listData,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// ===== USER TEAMS =====

const getUserTeams = async (userId) => {
  const response = await axios.get(
    getBaseUrl() + `/api/admin/users/${userId}/teams`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

const updateTeam = async (teamId, teamData) => {
  const response = await axios.put(
    getBaseUrl() + `/api/admin/teams/${teamId}`,
    teamData,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

const deleteTeam = async (teamId) => {
  const response = await axios.delete(
    getBaseUrl() + `/api/admin/teams/${teamId}`,
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
  updateUserTask,
  deleteUserTask,
  getUserLists,
  updateUserList,
  deleteUserList,
  getUserTeams,
  updateTeam,
  deleteTeam,
  getFeatureFlags,
  updateFeatureFlag,
  getSystemMessage,
  updateSystemMessage,
  getPublicConfig,
};

export default adminService;
