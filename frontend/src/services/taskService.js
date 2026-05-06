import { apiClient } from "./apiClient";

const resourceCache = new Map();

const createTask = async (task) => {
    try {
        const response = await apiClient.post("/api/tasks/create", task);
        invalidateTasksCache();
        return response.data;
    } catch (error) {
        throw new Error("Error connecting to server:" + error.message);
    }
};

const editTask = async (task) => {
    try {
        const response = await apiClient.post("/api/tasks/update/" + task.id, task);
        invalidateTasksCache();
        return response.data;
    } catch (error) {
        throw new Error("Error connecting to server:" + error.message);
    }
};

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

const invalidateTasksCache = (key = "tasks") => {
    resourceCache.delete(key);
};

const getTasks = () => {
    const cacheKey = "tasks";
    if (resourceCache.has(cacheKey)) {
        return resourceCache.get(cacheKey);
    }
    const promise = apiClient
        .get("/api/tasks/tasks")
        .then((response) => response.data)
        .catch((error) => {
            invalidateTasksCache();
            throw error;
        });
    const resource = getSuspender(promise);
    resourceCache.set(cacheKey, resource);
    return resource;
};

const deleteTask = (id) => {
    return apiClient.delete("/api/tasks/delete/" + id).then((response) => response.data);
};

const getEvents = () => {
    return apiClient.get("/api/tasks/events/get").then((response) => response.data);
};

const getTaskById = (id) => {
    return apiClient.get("/api/tasks/" + id).then((response) => response.data);
};

const createActionTask = (id, action) => {
    return apiClient.post("/api/tasks/" + id + "/actions", action).then((response) => response.data);
};

const deleteActionTask = (taskId, actionId) => {
    return apiClient.delete("/api/tasks/" + taskId + "/actions/" + actionId).then((response) => response.data);
};

const updateActionTask = (taskId, actionId, action) => {
    return apiClient.put("/api/tasks/" + taskId + "/actions/" + actionId, action).then((response) => response.data);
};

const getActionsTask = (taskId) => {
    return apiClient.get("/api/tasks/" + taskId + "/actions").then((response) => response.data);
};

const fetchTasksPage = async (page = 0, size = 50, search = "") => {
    const params = { page, size };
    if (search) params.search = search;
    const response = await apiClient.get("/api/tasks/tasks/paged", { params });
    return response.data;
};

const fetchActionsPage = async (taskId, page = 0, size = 50) => {
    const response = await apiClient.get("/api/tasks/" + taskId + "/actions/paged", {
        params: { page, size },
    });
    return response.data;
};

const getAllTasks = async () => {
    const response = await apiClient.get("/api/tasks/tasks");
    return response.data;
};

const getTasksWithoutList = async () => {
    try {
        const response = await apiClient.get("/api/tasks/getTasksResumeWithoutList");
        return response.data;
    } catch (error) {
        throw new Error("Error connecting to server:" + error.message);
    }
};

const taskService = {
    createTask,
    getTasks,
    deleteTask,
    createActionTask,
    deleteActionTask,
    updateActionTask,
    getActionsTask,
    editTask,
    invalidateTasksCache,
    getEvents,
    getTaskById,
    getAllTasks,
    getTasksWithoutList,
    fetchTasksPage,
    fetchActionsPage,
};

export default taskService;
