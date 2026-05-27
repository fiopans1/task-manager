import { apiClient } from "./apiClient";

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

const invalidateTeamsCache = (key = "teams") => {
    resourceCache.delete(key);
};

// ===== TEAM CRUD =====

const createTeam = async (team) => {
    const response = await apiClient.post("/api/teams/create", team);
    invalidateTeamsCache();
    return response.data;
};

const getMyTeams = async () => {
    const response = await apiClient.get("/api/teams/my-teams");
    return response.data;
};

const getTeams = () => {
    const cacheKey = "teams";
    if (resourceCache.has(cacheKey)) {
        return resourceCache.get(cacheKey);
    }
    const promise = apiClient
        .get("/api/teams/my-teams")
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
    const response = await apiClient.get("/api/teams/" + teamId);
    return response.data;
};

const updateTeam = async (teamId, team) => {
    const response = await apiClient.put("/api/teams/" + teamId, team);
    invalidateTeamsCache();
    return response.data;
};

const deleteTeam = async (teamId) => {
    const response = await apiClient.delete("/api/teams/" + teamId);
    invalidateTeamsCache();
    return response.data;
};

// ===== MEMBER MANAGEMENT =====

const addMember = async (teamId, username, role) => {
    const response = await apiClient.post("/api/teams/" + teamId + "/members", {
        username,
        role: role || "MEMBER",
    });
    return response.data;
};

const removeMember = async (teamId, memberId) => {
    const response = await apiClient.delete("/api/teams/" + teamId + "/members/" + memberId);
    return response.data;
};

const leaveTeam = async (teamId) => {
    const response = await apiClient.post("/api/teams/" + teamId + "/leave", {});
    return response.data;
};

const updateMemberRole = async (teamId, memberId, role) => {
    const response = await apiClient.put(
        "/api/teams/" + teamId + "/members/" + memberId + "/role",
        { role }
    );
    return response.data;
};

// ===== TASK ASSIGNMENT =====

const assignTask = async (teamId, taskId, username) => {
    const response = await apiClient.post(
        "/api/teams/" + teamId + "/tasks/" + taskId + "/assign",
        { username }
    );
    return response.data;
};

const addTaskToTeam = async (teamId, taskId) => {
    const response = await apiClient.post(
        "/api/teams/" + teamId + "/tasks/" + taskId + "/add",
        {}
    );
    return response.data;
};

// ===== DASHBOARD =====

const getTeamDashboard = async (teamId) => {
    const response = await apiClient.get("/api/teams/" + teamId + "/dashboard");
    return response.data;
};

// ===== FILTERED TASKS =====

const getTeamTasks = async (teamId, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.member) params.append("member", filters.member);
    if (filters.state) params.append("state", filters.state);
    if (filters.priority) params.append("priority", filters.priority);

    const query = params.toString();
    const url = "/api/teams/" + teamId + "/tasks" + (query ? "?" + query : "");
    const response = await apiClient.get(url);
    return response.data;
};

// ===== ASSIGNMENT HISTORY =====

const getAssignmentHistory = async (teamId) => {
    const response = await apiClient.get("/api/teams/" + teamId + "/assignment-history");
    return response.data;
};

// ===== INVITATIONS =====

const createInvitation = async (teamId, username) => {
    const response = await apiClient.post(
        "/api/teams/" + teamId + "/invitations",
        { username }
    );
    return response.data;
};

const getTeamInvitations = async (teamId) => {
    const response = await apiClient.get("/api/teams/" + teamId + "/invitations");
    return response.data;
};

const cancelInvitation = async (teamId, invitationId) => {
    const response = await apiClient.delete(
        "/api/teams/" + teamId + "/invitations/" + invitationId
    );
    return response.data;
};

const getMyPendingInvitations = async () => {
    const response = await apiClient.get("/api/teams/invitations/pending");
    return response.data;
};

const respondToInvitation = async (token, accept) => {
    const response = await apiClient.post(
        "/api/teams/invitations/" + token + "/respond",
        { accept }
    );
    return response.data;
};

// ===== MENTIONS =====

const getMembersForMention = async (teamId) => {
    const response = await apiClient.get("/api/teams/" + teamId + "/members/mentions");
    return response.data;
};

// ===== ADMIN CHECK =====

const isCurrentUserAdmin = async (teamId) => {
    const response = await apiClient.get("/api/teams/" + teamId + "/is-admin");
    return response.data.isAdmin;
};

// ===== PAGINATED FETCHERS =====

const fetchTeamsPage = async (page = 0, size = 50, search = "") => {
    const params = { page, size };
    if (search) params.search = search;
    const response = await apiClient.get("/api/teams/my-teams/paged", { params });
    return response.data;
};

const fetchTeamTasksPage = async (teamId, filters = {}, page = 0, size = 50) => {
    const params = { page, size };
    if (filters.member) params.member = filters.member;
    if (filters.state) params.state = filters.state;
    if (filters.priority) params.priority = filters.priority;

    const response = await apiClient.get("/api/teams/" + teamId + "/tasks/paged", { params });
    return response.data;
};

const fetchAssignmentHistoryPage = async (teamId, page = 0, size = 50) => {
    const response = await apiClient.get(
        "/api/teams/" + teamId + "/assignment-history/paged",
        { params: { page, size } }
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
