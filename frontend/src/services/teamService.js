import axios from "./httpClient";
import configService from "./configService";

const resourceCache = new Map();
const JSON_HEADERS = {
  "Content-Type": "application/json",
};

const getAuthHeaders = () => JSON_HEADERS;

const getBaseUrl = () => configService.getApiBaseUrl() + "/api/teams";

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

const invalidateTeamsCache = (key = "teams") => {
  resourceCache.delete(key);
};

const createTeam = async (team) => {
  const response = await axios.post(getBaseUrl() + "/create", team, {
    headers: getAuthHeaders(),
  });
  invalidateTeamsCache();
  return response.data;
};

const getMyTeams = async () => {
  const response = await axios.get(getBaseUrl() + "/my-teams", {
    headers: getAuthHeaders(),
  });
  return response.data;
};

const getTeams = () => {
  const cacheKey = "teams";

  if (resourceCache.has(cacheKey)) {
    return resourceCache.get(cacheKey);
  }
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    console.error("Server URL not found", { baseUrl });
    return getSuspender(
      Promise.reject(new Error("Missing server configuration"))
    );
  }
  const promise = axios
    .get(baseUrl + "/my-teams", {
      headers: getAuthHeaders(),
    })
    .then((response) => response.data)
    .catch((error) => {
      invalidateTeamsCache();
      throw error;
    });
  const resource = getSuspender(promise);
  resourceCache.set(cacheKey, resource);
  return resource;
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
  invalidateTeamsCache();
  return response.data;
};

const deleteTeam = async (teamId) => {
  const response = await axios.delete(getBaseUrl() + "/" + teamId, {
    headers: getAuthHeaders(),
  });
  invalidateTeamsCache();
  return response.data;
};

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

const leaveTeam = async (teamId) => {
  const response = await axios.post(
    getBaseUrl() + "/" + teamId + "/leave",
    {},
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

const getTeamDashboard = async (teamId) => {
  const response = await axios.get(
    getBaseUrl() + "/" + teamId + "/dashboard",
    { headers: getAuthHeaders() }
  );
  return response.data;
};

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

const getAssignmentHistory = async (teamId) => {
  const response = await axios.get(
    getBaseUrl() + "/" + teamId + "/assignment-history",
    { headers: getAuthHeaders() }
  );
  return response.data;
};

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

const cancelInvitation = async (teamId, invitationId) => {
  const response = await axios.delete(
    getBaseUrl() + "/" + teamId + "/invitations/" + invitationId,
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

const getMembersForMention = async (teamId) => {
  const response = await axios.get(
    getBaseUrl() + "/" + teamId + "/members/mentions",
    { headers: getAuthHeaders() }
  );
  return response.data;
};

const isCurrentUserAdmin = async (teamId) => {
  const response = await axios.get(
    getBaseUrl() + "/" + teamId + "/is-admin",
    { headers: getAuthHeaders() }
  );
  return response.data.isAdmin;
};

const fetchTeamsPage = async (page = 0, size = 50, search = "") => {
  const params = { page, size };
  if (search) params.search = search;
  const response = await axios.get(getBaseUrl() + "/my-teams/paged", {
    headers: getAuthHeaders(),
    params,
  });
  return response.data;
};

const fetchTeamTasksPage = async (teamId, filters = {}, page = 0, size = 50) => {
  const params = { page, size };
  if (filters.member) params.member = filters.member;
  if (filters.state) params.state = filters.state;
  if (filters.priority) params.priority = filters.priority;

  const response = await axios.get(getBaseUrl() + "/" + teamId + "/tasks/paged", {
    headers: getAuthHeaders(),
    params,
  });
  return response.data;
};

const fetchAssignmentHistoryPage = async (teamId, page = 0, size = 50) => {
  const response = await axios.get(
    getBaseUrl() + "/" + teamId + "/assignment-history/paged",
    { headers: getAuthHeaders(), params: { page, size } }
  );
  return response.data;
};

const teamService = {
  createTeam,
  getMyTeams,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  addMember,
  removeMember,
  leaveTeam,
  updateMemberRole,
  assignTask,
  addTaskToTeam,
  getTeamDashboard,
  getTeamTasks,
  getAssignmentHistory,
  createInvitation,
  getTeamInvitations,
  cancelInvitation,
  getMyPendingInvitations,
  respondToInvitation,
  getMembersForMention,
  isCurrentUserAdmin,
  invalidateTeamsCache,
  fetchTeamsPage,
  fetchTeamTasksPage,
  fetchAssignmentHistoryPage,
};

export default teamService;
