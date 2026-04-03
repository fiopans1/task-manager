import axios from "axios";
import store from "../redux/store";
import configService from "./configService";
const resourceCache = new Map();

const createTask = async (task) => {
  try {
    const serverUrl = configService.getApiBaseUrl();
    const token = "Bearer " + store.getState().auth.token;
    const response = await axios.post(serverUrl + "/api/tasks/create", task, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
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
    const token = "Bearer " + store.getState().auth.token;
    const response = await axios.post(serverUrl + "/api/tasks/update/" + task.id, task, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
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

  // If already in cache, return cached resource
  if (resourceCache.has(cacheKey)) {
    return resourceCache.get(cacheKey);
  }
  const serverUrl = configService.getApiBaseUrl();
  const token = "Bearer " + store.getState().auth.token;
  if (!serverUrl || !token) {
    console.error("Server URL or token not found", { serverUrl, token });
    return getSuspender(
      Promise.reject(
        new Error("Missing server configuration or authentication")
      )
    );
  }
  const promise = axios
    .get(serverUrl + "/api/tasks/tasks", {
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    })
    .then((response) => response.data)
    .catch((error) => {
      // In case of error, invalidate cache to allow retries
      invalidateTasksCache();
      throw error;
    });
  const resource = getSuspender(promise);
  resourceCache.set(cacheKey, resource);
  return resource;
};

const deleteTask = (id) => {
  const serverUrl = configService.getApiBaseUrl();
  const token = "Bearer " + store.getState().auth.token;
  return axios.delete(serverUrl + "/api/tasks/delete/" + id, {
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
  }).then((response) => response.data);
};

const getEvents = () => {
  const serverUrl = configService.getApiBaseUrl();
  const token = "Bearer " + store.getState().auth.token;
  return axios.get(serverUrl + "/api/tasks/events/get", {
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
  }).then((response) => response.data);
};

const getTaskById = (id) => {
  const serverUrl = configService.getApiBaseUrl();
  const token = "Bearer " + store.getState().auth.token;
  return axios.get(serverUrl + "/api/tasks/" + id, {
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
  }).then((response) => response.data);
};

const createActionTask = (id, action) => {
  const serverUrl = configService.getApiBaseUrl();
  const token = "Bearer " + store.getState().auth.token;
  return axios.post(serverUrl + "/api/tasks/" + id + "/actions", action, {
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
  }).then((response) => response.data);
};

const deleteActionTask = (taskId, actionId) => {
  const serverUrl = configService.getApiBaseUrl();
  const token = "Bearer " + store.getState().auth.token;
  return axios.delete(serverUrl + "/api/tasks/" + taskId + "/actions/" + actionId, {
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
  }).then((response) => response.data);
};

const updateActionTask = (taskId, actionId, action) => {
  const serverUrl = configService.getApiBaseUrl();
  const token = "Bearer " + store.getState().auth.token;
  return axios.put(serverUrl + "/api/tasks/" + taskId + "/actions/" + actionId, action, {
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
  }).then((response) => response.data);
};

const getActionsTask = (taskId) => {
  const serverUrl = configService.getApiBaseUrl();
  const token = "Bearer " + store.getState().auth.token;
  return axios.get(serverUrl + "/api/tasks/" + taskId + "/actions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
  }).then((response) => response.data);
};

const getAllTasks = async () => {
  const serverUrl = configService.getApiBaseUrl();
  const token = "Bearer " + store.getState().auth.token;
  const response = await axios.get(serverUrl + "/api/tasks/tasks", {
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
  });
  return response.data;
};

const getTasksWithoutList = async () => {
  try {
    const serverUrl = configService.getApiBaseUrl();
    const token = "Bearer " + store.getState().auth.token;
    const response = await axios.get(
      serverUrl + "/api/tasks/getTasksResumeWithoutList",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
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
};

export default taskService;
