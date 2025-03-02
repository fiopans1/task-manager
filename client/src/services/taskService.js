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

const taskService = {
  createTask,
};

export default taskService;
