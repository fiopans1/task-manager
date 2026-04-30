import axios from "axios";
import configService from "./configService";
const resourceCache = new Map();
const JSON_HEADERS = {
  "Content-Type": "application/json",
};

const createTask = async (task) => {
  try {
    const serverUrl = configService.getApiBaseUrl();
    const response = await axios.post(serverUrl + "/api/tasks/create", task, {
      headers: JSON_HEADERS,
    });
    invalidateTasksCache();
    return response.data;
  } catch (error) {
    throw new Error("Error connecting to server:" + error.message);
  }
};
const editTask = async (task) => {
  try {
    const serverUrl = configService.getApiBaseUrl();
    const response = await axios.post(serverUrl + "/api/tasks/update/" + task.id, task, {
      headers: JSON_HEADERS,
    });
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
  const serverUrl = configService.getApiBaseUrl();
  if (!serverUrl) {
    console.error("Server URL not found", { serverUrl });
    return getSuspender(
      Promise.reject(new Error("Missing server configuration"))
    );
  }
  const promise = axios
    .get(serverUrl + "/api/tasks/tasks", {
      headers: JSON_HEADERS,
    })
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
  const serverUrl = configService.getApiBaseUrl();
  return axios.delete(serverUrl + "/api/tasks/delete/" + id, {
    headers: JSON_HEADERS,
  }).then((response) => response.data);
};

const getEvents = () => {
  const serverUrl = configService.getApiBaseUrl();
  return axios.get(serverUrl + "/api/tasks/events/get", {
    headers: JSON_HEADERS,
  }).then((response) => response.data);
};

const getTaskById = (id) => {
  const serverUrl = configService.getApiBaseUrl();
  return axios.get(serverUrl + "/api/tasks/" + id, {
    headers: JSON_HEADERS,
  }).then((response) => response.data);
};

const createActionTask = (id, action) => {
  const serverUrl = configService.getApiBaseUrl();
  return axios.post(serverUrl + "/api/tasks/" + id + "/actions", action, {
    headers: JSON_HEADERS,
  }).then((response) => response.data);
};

const deleteActionTask = (taskId, actionId) => {
  const serverUrl = configService.getApiBaseUrl();
  return axios.delete(serverUrl + "/api/tasks/" + taskId + "/actions/" + actionId, {
    headers: JSON_HEADERS,
  }).then((response) => response.data);
};

const updateActionTask = (taskId, actionId, action) => {
  const serverUrl = configService.getApiBaseUrl();
  return axios.put(serverUrl + "/api/tasks/" + taskId + "/actions/" + actionId, action, {
    headers: JSON_HEADERS,
  }).then((response) => response.data);
};

const getActionsTask = (taskId) => {
  const serverUrl = configService.getApiBaseUrl();
  return axios.get(serverUrl + "/api/tasks/" + taskId + "/actions", {
    headers: JSON_HEADERS,
  }).then((response) => response.data);
};

const fetchTasksPage = async (page = 0, size = 50, search = "") => {
  const serverUrl = configService.getApiBaseUrl();
  const params = { page, size };
  if (search) params.search = search;
  const response = await axios.get(serverUrl + "/api/tasks/tasks/paged", {
    headers: JSON_HEADERS,
    params,
  });
  return response.data;
};

const fetchActionsPage = async (taskId, page = 0, size = 50) => {
  const serverUrl = configService.getApiBaseUrl();
  const response = await axios.get(serverUrl + "/api/tasks/" + taskId + "/actions/paged", {
    headers: JSON_HEADERS,
    params: { page, size },
  });
  return response.data;
};

const getAllTasks = async () => {
  const serverUrl = configService.getApiBaseUrl();
  const response = await axios.get(serverUrl + "/api/tasks/tasks", {
    headers: JSON_HEADERS,
  });
  return response.data;
};

const getTasksWithoutList = async () => {
  try {
    const serverUrl = configService.getApiBaseUrl();
    const response = await axios.get(
      serverUrl + "/api/tasks/getTasksResumeWithoutList",
      {
        headers: JSON_HEADERS,
      }
    );
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
