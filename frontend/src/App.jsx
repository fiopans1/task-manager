import React, { useState, useEffect, useRef } from "react";
import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { Container, Spinner } from "react-bootstrap";
import { useSelector } from "react-redux";
import authService from "./services/authService";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import MainApp from "./pages/MainApp";
import RegisterPage from "./components/auth/RegisterPage";
import LoginPage from "./components/auth/LoginPage";
import HomePage from "./pages/HomePage";
import CalendarComponent from "./components/CalendarComponent";
import Lists from "./components/lists/Lists";
import TaskDetails from "./components/tasks/TaskDetails/TaskDetails";
import Tasks from "./components/tasks/Tasks";
import OutletUtil from "./components/common/OutletUtil";
import Home from "./components/Home";
import OAuth2Login from "./components/auth/OAuth2Login";
import AdminPanel from "./components/adminpanel/AdminPanel";
import FeatureGuard from "./components/common/FeatureGuard";
import { infoToast, errorToast, successToast } from "./components/common/Noty";
import ListDetailsGeneral from "./components/lists/ListDetails/ListDetailsGeneral";
import Teams from "./components/teams/Teams";
import TeamDashboard from "./components/teams/TeamDashboard";

function App() {
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const didBootstrapRef = useRef(false);

    useEffect(() => {
        if (didBootstrapRef.current) {
            return;
        }

        didBootstrapRef.current = true;

        const bootstrap = async () => {
            try {
                if (window.location.pathname === "/oauth2-login") {
                    try {
                        const session = await authService.handleOAuth2Redirect();
                        if (session) {
                            successToast("Login successfully with OAuth2");
                            navigate("/home", { replace: true });
                        }
                    } catch (error) {
                        errorToast(error.message || "OAuth2 authentication error");
                    }

                    return;
                }

                await authService.initializeSession();
            } catch (error) {
                console.error("Error during auth initialization:", error);
                errorToast(error.message || "Authentication error occurred");
            } finally {
                setIsLoading(false);
            }
        };

        bootstrap();
    }, [navigate]);

    const handleLogin = () => {
        navigate("/home", { replace: true });
    };

  const handleLogout = async () => {
    await authService.logout();
    navigate("/", { replace: true });
    infoToast("Logged out");
  };

    if (isLoading) {
        return (
            <Container fluid className="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-body-tertiary gap-3">
                <Spinner animation="border" variant="primary" />
                <p className="text-body-secondary mb-0">Verifying authentication...</p>
            </Container>
        );
    }

    return (
        <Routes>
            <Route path="/health" element={<div>OK</div>} />
            <Route
                path="/"
                element={
                    isAuthenticated ? <Navigate to="/home" replace /> : <HomePage />
                }
            />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route
                path="/oauth2-login"
                element={isAuthenticated ? <Navigate to="/home" replace /> : <OAuth2Login />}
            />
            <Route
                path="/home"
                element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <MainApp onLogOut={handleLogout} />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Home />} />
                <Route
                    path="/home/tasks"
                    element={
                        <FeatureGuard featureKey="tasks">
                            <OutletUtil />
                        </FeatureGuard>
                    }
                >
                    <Route index element={<Tasks />} />
                    <Route path=":id" element={<TaskDetails />} />
                </Route>
                <Route
                    path="/home/calendar"
                    element={
                        <FeatureGuard featureKey="calendar">
                            <CalendarComponent />
                        </FeatureGuard>
                    }
                />
                <Route
                    path="/home/lists"
                    element={
                        <FeatureGuard featureKey="lists">
                            <OutletUtil />
                        </FeatureGuard>
                    }
                >
                    <Route index element={<Lists />} />
                    <Route path=":id" element={<ListDetailsGeneral />} />
                </Route>
                <Route
                    path="/home/teams"
                    element={
                        <FeatureGuard featureKey="teams">
                            <OutletUtil />
                        </FeatureGuard>
                    }
                >
                    <Route index element={<Teams />} />
                    <Route path=":id" element={<TeamDashboard />} />
                </Route>
                <Route path="/home/admin" element={<AdminPanel />} />
            </Route>
        </Routes>
    );
}

export default App;
