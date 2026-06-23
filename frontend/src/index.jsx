import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./styles.css";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import { Toaster } from "sonner";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { HelmetProvider } from "react-helmet-async";

const ThemedToaster = () => {
    const { darkMode } = useTheme();
    return (
        <Toaster
            position="top-right"
            theme={darkMode ? "dark" : "light"}
            closeButton
            richColors
            duration={3000}
        />
    );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <Provider store={store}>
            <ThemeProvider>
                <HelmetProvider>
                    <Router>
                        <App />
                        <ThemedToaster />
                    </Router>
                </HelmetProvider>
            </ThemeProvider>
        </Provider>
    </React.StrictMode>
);
