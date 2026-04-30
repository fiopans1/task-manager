import axios from "./httpClient";
import configService from "./configService";
const resourceCache = new Map();
const JSON_HEADERS = {
  "Content-Type": "application/json",
};

const createList = async (list) => {
  try {
    const serverUrl = configService.getApiBaseUrl();
    const response = await axios.post(serverUrl + "/api/lists/create", list, {
      headers: JSON_HEADERS,
    });
    invalidateListsCache();
    return response.data;
  } catch (error) {
    throw new Error("Error connecting to server:" + error.message);
  }
};

const updateList = async (list) => {
  try {
    const serverUrl = configService.getApiBaseUrl();
    const response = await axios.post(
      serverUrl + "/api/lists/update/" + list.id,
      list,
      {
        headers: JSON_HEADERS,
      }
    );
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
  const serverUrl = configService.getApiBaseUrl();
  if (!serverUrl) {
    console.error("Server URL not found", { serverUrl });
    return getSuspender(
      Promise.reject(new Error("Missing server configuration"))
    );
  }
  const promise = axios
    .get(serverUrl + "/api/lists/lists", {
      headers: JSON_HEADERS,
    })
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
  const serverUrl = configService.getApiBaseUrl();
  return axios
    .delete(serverUrl + "/api/lists/delete/" + id, {
      headers: JSON_HEADERS,
    })
    .then((response) => response.data);
};

const addTasksToList = async (listId, taskIds) => {
  try {
    const serverUrl = configService.getApiBaseUrl();
    const response = await axios.post(
      serverUrl + "/api/lists/addTasksToList/" + listId,
      taskIds,
      {
        headers: JSON_HEADERS,
      }
    );
    return response.data;
  } catch (error) {
    throw new Error("Error connecting to server:" + error.message);
  }
};

const deleteTaskFromList = async (taskId) => {
  try {
    const serverUrl = configService.getApiBaseUrl();
    await axios.delete(
      serverUrl + "/api/lists/deleteTaskFromList/" + taskId,
      {
        headers: JSON_HEADERS,
      }
    );
  } catch (error) {
    throw new Error("Error connecting to server:" + error.message);
  }
};

const getListById = async (id) => {
  try {
    const serverUrl = configService.getApiBaseUrl();
    const response = await axios.get(serverUrl + "/api/lists/getList/" + id, {
      headers: JSON_HEADERS,
    });
    return response.data;
  } catch (error) {
    throw new Error("Error connecting to server:" + error.message);
  }
};

const fetchListsPage = async (page = 0, size = 50, search = "") => {
  const serverUrl = configService.getApiBaseUrl();
  const params = { page, size };
  if (search) params.search = search;
  const response = await axios.get(serverUrl + "/api/lists/lists/paged", {
    headers: JSON_HEADERS,
    params,
  });
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
