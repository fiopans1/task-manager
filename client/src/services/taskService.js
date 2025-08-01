import axios from "axios";
import store from "../redux/store";

const resourceCache = new Map();

const createTask = async (task) => {
  try {
    const serverUrl = store.getState().server.serverUrl;
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
    throw new Error("Error al conectar con el servidor:" + error.message);
  }
};
const editTask = async (task) => {
  try {
    const serverUrl = store.getState().server.serverUrl;
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
    throw new Error("Error al conectar con el servidor:" + error.message);
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
  const cacheKey = "tasks"; // Puedes usar una clave más específica si es necesario

  // Si ya existe en caché, devuelve el recurso en caché
  if (resourceCache.has(cacheKey)) {
    return resourceCache.get(cacheKey);
  }
  const serverUrl = store.getState().server.serverUrl;
  const token = "Bearer " + store.getState().auth.token;
  if (!serverUrl || !token) {
    console.error("No se encontró serverUrl o token", { serverUrl, token });
    return getSuspender(
      Promise.reject(
        new Error("Falta configuración de servidor o autenticación")
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
      //console.error("Error en la llamada a la API:", error);
      // 6. En caso de error, invalidar la caché para permitir reintentos
      invalidateTasksCache();
      throw error;
    });
  const resource = getSuspender(promise);
  resourceCache.set(cacheKey, resource);
  return resource;
};

const deleteTask = (id) => {
  const serverUrl = store.getState().server.serverUrl;
  const token = "Bearer " + store.getState().auth.token;
  return axios.delete(serverUrl + "/api/tasks/delete/" + id, {
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
  }).then((response) => response.data);
};

const getEvents = () => {
  const serverUrl = store.getState().server.serverUrl;
  const token = "Bearer " + store.getState().auth.token;
  return axios.get(serverUrl + "/api/tasks/events/get", {
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
  }).then((response) => response.data);
};

const getTaskById = (id) => {
  const serverUrl = store.getState().server.serverUrl;
  const token = "Bearer " + store.getState().auth.token;
  return axios.get(serverUrl + "/api/tasks/" + id, {
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
  }).then((response) => response.data);
};

const taskService = {
  createTask,
  getTasks,
  deleteTask,
  editTask,
  invalidateTasksCache,
  getEvents,
  getTaskById,
};

export default taskService;
