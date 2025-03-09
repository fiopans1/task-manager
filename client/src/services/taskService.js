import axios from "axios";
import store from "../redux/store";
const createTask = async (task) => {
  try {
    const serverUrl = store.getState().server.serverUrl;
    const token = "Bearer " + store.getState().auth.token;
    const response = await axios.post(serverUrl + "/api/tasks/create", task, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    });
    console.log(response.data); //TO-DO: Cambiar esto y mostrar si se creo bien o no
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

const getTasks = () => {
  const promise = null //TO-DO: Implementar esto but necesita ser un promise
  return getSuspender(promise);
};

const taskService = {
  createTask,
  getTasks,
};

export default taskService;
