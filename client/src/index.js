import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import store, { persistor } from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { ToastContainer } from "react-toastify";
import configService from "./services/configService";

// Initialize configuration before rendering the app
configService.loadConfig()
  .then(() => {
    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(
      <React.StrictMode>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
              <Router>
                <App />
                <ToastContainer autoClose={3000} />
              </Router>
          </PersistGate>
        </Provider>
      </React.StrictMode>
    );
  })
  .catch((error) => {
    console.error("Failed to load configuration:", error);
    // Render app anyway with fallback to environment variables
    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(
      <React.StrictMode>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
              <Router>
                <App />
                <ToastContainer autoClose={3000} />
              </Router>
          </PersistGate>
        </Provider>
      </React.StrictMode>
    );
  });
