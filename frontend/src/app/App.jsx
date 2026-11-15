import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import authService from "@/services/authService";
import { AppRoutes } from "@/app/routes";
import AppShellSkeleton from "@/app/layout/AppShellSkeleton";
import { errorToast, infoToast, successToast } from "@/shared/feedback/Noty";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const didBootstrapRef = useRef(false);

  useEffect(() => {
    if (didBootstrapRef.current) return;
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
    return <AppShellSkeleton />;
  }

  return (
    <AppRoutes
      isAuthenticated={isAuthenticated}
      onLogin={handleLogin}
      onLogOut={handleLogout}
    />
  );
}
