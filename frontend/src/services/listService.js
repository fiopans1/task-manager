import { apiClient } from "./apiClient";

const resourceCache = new Map();

const createList = async (list) => {
    try {
        const response = await apiClient.post("/api/lists/create", list);
        invalidateListsCache();
        return response.data;
    } catch (error) {
        throw new Error("Error connecting to server:" + error.message);
    }
};

const updateList = async (list) => {
    try {
        const response = await apiClient.post("/api/lists/update/" + list.id, list);
        invalidateListsCache();
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

const invalidateListsCache = (key = "lists") => {
    resourceCache.delete(key);
};

const getLists = () => {
    const cacheKey = "lists";
    if (resourceCache.has(cacheKey)) {
        return resourceCache.get(cacheKey);
    }
    const promise = apiClient
        .get("/api/lists/lists")
        .then((response) => response.data)
        .catch((error) => {
            invalidateListsCache();
            throw error;
        });
    const resource = getSuspender(promise);
    resourceCache.set(cacheKey, resource);
    return resource;
};

const deleteList = (id) => {
    return apiClient.delete("/api/lists/delete/" + id).then((response) => response.data);
};

const addTasksToList = async (listId, taskIds) => {
    try {
        const response = await apiClient.post("/api/lists/addTasksToList/" + listId, taskIds);
        return response.data;
    } catch (error) {
        throw new Error("Error connecting to server:" + error.message);
    }
};

const deleteTaskFromList = async (taskId) => {
    try {
        await apiClient.delete("/api/lists/deleteTaskFromList/" + taskId);
    } catch (error) {
        throw new Error("Error connecting to server:" + error.message);
    }
};

const getListById = async (id) => {
    try {
        const response = await apiClient.get("/api/lists/getList/" + id);
        return response.data;
    } catch (error) {
        throw new Error("Error connecting to server:" + error.message);
    }
};

const fetchListsPage = async (page = 0, size = 50, search = "") => {
    const params = { page, size };
    if (search) params.search = search;
    const response = await apiClient.get("/api/lists/lists/paged", { params });
    return response.data;
};

const listService = {
    getLists,
    createList,
    updateList,
    invalidateListsCache,
    deleteList,
    addTasksToList,
    deleteTaskFromList,
    getListById,
    fetchListsPage,
};

export default listService;
