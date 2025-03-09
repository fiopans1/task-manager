import axios from "axios";
import store from "../redux/store";

let tasksCache = null;

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
    throw new Error("Error al conectar con el servidor");
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

const invalidateTasksCache = () => {
  console.log("Invalidando caché de tareas");
  tasksCache = null;
};

const getTasks = () => {
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
      console.error("Error en la llamada a la API:", error);
      // 6. En caso de error, invalidar la caché para permitir reintentos
      invalidateTasksCache();
      throw error;
    });
  tasksCache = getSuspender(promise);
  return tasksCache;
};

const taskService = {
  createTask,
  getTasks,
  invalidateTasksCache,
};

export default taskService;
