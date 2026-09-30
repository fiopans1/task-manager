import { apiClient } from "./apiClient";

const createList = async (list) => {
    try {
        const response = await apiClient.post("/api/lists/create", list);
        return response.data;
    } catch (error) {
        throw new Error("Error connecting to server:" + error.message);
    }
};

const updateList = async (list) => {
    try {
        const response = await apiClient.post("/api/lists/update/" + list.id, list);
        return response.data;
    } catch (error) {
        throw new Error("Error connecting to server:" + error.message);
    }
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
    createList,
    updateList,
    deleteList,
    addTasksToList,
    deleteTaskFromList,
    getListById,
    fetchListsPage,
};

export default listService;
