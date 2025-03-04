import { createContext, useContext, useState } from "react";
import { Toast, ToastContainer } from "react-bootstrap";


const NotificationContext = createContext(); //Creamos el contexto de las notificaciones

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, variant = "info", duration = 3000) => {
    const id = Date.now(); //Generar un id unico como puede ser la fecha actual al milisegundo
    setNotifications((prev) => [...prev, { id, message, variant }]); //seteamos las notificaciones con el mensaje y la variante

    // Eliminar la notificación después de "duration" milisegundos
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id)); //comparamos por id y eliminamos la notificación
    }, duration);
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <ToastContainer position="top-end" className="p-3">
        {notifications.map((toast) => (
          <Toast key={toast.id} bg={toast.variant} autohide>
            <Toast.Body>{toast.message}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
