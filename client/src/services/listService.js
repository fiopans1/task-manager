import axios from "axios";
import store from "../redux/store";

const resourceCache = new Map();

const createList = async (list) => {
  try {
    const serverUrl = process.env.REACT_APP_BACKEND_URL;
    const token = "Bearer " + store.getState().auth.token;
    const response = await axios.post(serverUrl + "/api/lists/create", list, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });
    invalidateListsCache();
    return response.data;
  } catch (error) {
    throw new Error("Error al conectar con el servidor:" + error.message);
  }
};

const updateList = async (list) => {
  try {
    const serverUrl = process.env.REACT_APP_BACKEND_URL;
    const token = "Bearer " + store.getState().auth.token;
    const response = await axios.post(
      serverUrl + "/api/lists/update/" + list.id,
      list,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    invalidateListsCache();
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

const invalidateListsCache = (key = "lists") => {
  resourceCache.delete(key);
};

const getLists = () => {
  const cacheKey = "lists"; // Puedes usar una clave más específica si es necesario

  // Si ya existe en caché, devuelve el recurso en caché
  if (resourceCache.has(cacheKey)) {
    return resourceCache.get(cacheKey);
  }
  const serverUrl = process.env.REACT_APP_BACKEND_URL;
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
    .get(serverUrl + "/api/lists/lists", {
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    })
    .then((response) => response.data)
    .catch((error) => {
      //console.error("Error en la llamada a la API:", error);
      // 6. En caso de error, invalidar la caché para permitir reintentos
      invalidateListsCache();
      throw error;
    });
  const resource = getSuspender(promise);
  resourceCache.set(cacheKey, resource);
  return resource;
};

const deleteList = (id) => {
  const serverUrl = process.env.REACT_APP_BACKEND_URL;
  const token = "Bearer " + store.getState().auth.token;
  return axios
    .delete(serverUrl + "/api/lists/delete/" + id, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    })
    .then((response) => response.data);
};

const deleteElementList = async (id) => {
  const serverUrl = process.env.REACT_APP_BACKEND_URL;
  const token = "Bearer " + store.getState().auth.token;
  await axios
    .delete(serverUrl + "/api/lists/deleteElement/" + id, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });
};

const createElementList = async (id, element) => {
  try {
    const serverUrl = process.env.REACT_APP_BACKEND_URL;
    const token = "Bearer " + store.getState().auth.token;
    const response = await axios.post(
      serverUrl + "/api/lists/addElement/" + id,
      element,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error("Error al conectar con el servidor:" + error.message);
  }
};

const updateElementList = async (id, element) => {
  try {
    const serverUrl = process.env.REACT_APP_BACKEND_URL;
    const token = "Bearer " + store.getState().auth.token;
    const response = await axios.post(
      serverUrl + "/api/lists/updateElement/" + id,
      element,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error("Error al conectar con el servidor:" + error.message);
  }
};

const getElementsList = async (id) => {
  try {
    const serverUrl = process.env.REACT_APP_BACKEND_URL;
    const token = "Bearer " + store.getState().auth.token;
    const response = await axios.get(serverUrl + "/api/lists/getList/" + id, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error("Error al conectar con el servidor:" + error.message);
  }
};

const listService = {
  getLists,
  createList,
  updateList,
  invalidateListsCache,
  deleteList,
  deleteElementList,
  createElementList,
  updateElementList,
  getElementsList,
};

export default listService;
