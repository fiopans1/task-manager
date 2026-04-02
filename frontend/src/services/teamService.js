import axios from "axios";
import store from "../redux/store";
import configService from "./configService";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: "Bearer " + store.getState().auth.token,
});

const getBaseUrl = () => configService.getApiBaseUrl() + "/api/teams";

// ===== TEAM CRUD =====

const createTeam = async (team) => {
  const response = await axios.post(getBaseUrl() + "/create", team, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

const getMyTeams = async () => {
  const response = await axios.get(getBaseUrl() + "/my-teams", {
    headers: getAuthHeaders(),
  });
  return response.data;
};

const getTeamById = async (teamId) => {
  const response = await axios.get(getBaseUrl() + "/" + teamId, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

const updateTeam = async (teamId, team) => {
  const response = await axios.put(getBaseUrl() + "/" + teamId, team, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

const deleteTeam = async (teamId) => {
  const response = await axios.delete(getBaseUrl() + "/" + teamId, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// ===== MEMBER MANAGEMENT =====

const addMember = async (teamId, username, role) => {
  const response = await axios.post(
    getBaseUrl() + "/" + teamId + "/members",
    { username, role: role || "MEMBER" },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

const removeMember = async (teamId, memberId) => {
  const response = await axios.delete(
    getBaseUrl() + "/" + teamId + "/members/" + memberId,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

const updateMemberRole = async (teamId, memberId, role) => {
  const response = await axios.put(
    getBaseUrl() + "/" + teamId + "/members/" + memberId + "/role",
    { role },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// ===== TASK ASSIGNMENT =====

const assignTask = async (teamId, taskId, username) => {
  const response = await axios.post(
    getBaseUrl() + "/" + teamId + "/tasks/" + taskId + "/assign",
    { username },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

const addTaskToTeam = async (teamId, taskId) => {
  const response = await axios.post(
    getBaseUrl() + "/" + teamId + "/tasks/" + taskId + "/add",
    {},
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// ===== DASHBOARD =====

const getTeamDashboard = async (teamId) => {
  const response = await axios.get(
    getBaseUrl() + "/" + teamId + "/dashboard",
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// ===== FILTERED TASKS =====

const getTeamTasks = async (teamId, filters = {}) => {
  const params = new URLSearchParams();
  if (filters.member) params.append("member", filters.member);
  if (filters.state) params.append("state", filters.state);
  if (filters.priority) params.append("priority", filters.priority);

  const query = params.toString();
  const url = getBaseUrl() + "/" + teamId + "/tasks" + (query ? "?" + query : "");

  const response = await axios.get(url, { headers: getAuthHeaders() });
  return response.data;
};

// ===== ASSIGNMENT HISTORY =====

const getAssignmentHistory = async (teamId) => {
  const response = await axios.get(
    getBaseUrl() + "/" + teamId + "/assignment-history",
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// ===== INVITATIONS =====

const createInvitation = async (teamId, username) => {
  const response = await axios.post(
    getBaseUrl() + "/" + teamId + "/invitations",
    { username },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

const getTeamInvitations = async (teamId) => {
  const response = await axios.get(
    getBaseUrl() + "/" + teamId + "/invitations",
    { headers: getAuthHeaders() }
  );
  return response.data;
};

const getMyPendingInvitations = async () => {
  const response = await axios.get(
    getBaseUrl() + "/invitations/pending",
    { headers: getAuthHeaders() }
  );
  return response.data;
};

const respondToInvitation = async (token, accept) => {
  const response = await axios.post(
    getBaseUrl() + "/invitations/" + token + "/respond",
    { accept },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// ===== MENTIONS =====

const getMembersForMention = async (teamId) => {
  const response = await axios.get(
    getBaseUrl() + "/" + teamId + "/members/mentions",
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// ===== ADMIN CHECK =====

const isCurrentUserAdmin = async (teamId) => {
  const response = await axios.get(
    getBaseUrl() + "/" + teamId + "/is-admin",
    { headers: getAuthHeaders() }
  );
  return response.data.isAdmin;
};

const teamService = {
  createTeam,
  getMyTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  addMember,
  removeMember,
  updateMemberRole,
  assignTask,
  addTaskToTeam,
  getTeamDashboard,
  getTeamTasks,
  getAssignmentHistory,
  createInvitation,
  getTeamInvitations,
  getMyPendingInvitations,
  respondToInvitation,
  getMembersForMention,
  isCurrentUserAdmin,
};

export default teamService;
