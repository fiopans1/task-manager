import React, { useState, useEffect } from "react";
import authService from "../../services/authService";
import { Container, Button, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { errorToast } from "../common/Noty";
import configService from "../../services/configService";
import ThemeToggleButton from "../common/ThemeToggleButton";

function OAuth2Login({ onLogin }) {
  const [oauth2Loading, setOauth2Loading] = useState("");

  useEffect(() => {
    const checkOAuth2Status = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const message = urlParams.get("message");

      if (code && message) {
        errorToast(
          "OAuth2 login failed with code: " +
            code +
            " and message: " +
            message
        );
        const newUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
        return;
      }

      try {
        await authService.loadSession();
        onLogin();
      } catch (error) {
      }
    };

    checkOAuth2Status();
  }, [onLogin]);

  const handleOAuth2Login = (provider) => {
    setOauth2Loading(provider);
    try {
      authService.loginWithOAuth2(provider);
    } catch (error) {
      setOauth2Loading("");
      errorToast("Error OAuth2: " + error.message);
    }
  };

  return (
    <Container
      fluid
      className="task-manager-bg d-flex flex-column justify-content-center align-items-center px-3"
    >
      <div style={{ maxWidth: 400, width: "100%" }}>
        <h1 className="brand-title text-center mb-3">
          {configService.getAppName()}
        </h1>

        <p className="auth-heading text-center mb-5">
          Quick access
        </p>

        <div className="d-grid gap-3 mb-5">
          {configService.isOAuth2ProviderEnabled("google") && (
            <Button
              size="lg"
              className="oauth-btn py-3 rounded-3 d-flex align-items-center justify-content-center"
              onClick={() => handleOAuth2Login("google")}
              disabled={!!oauth2Loading}
            >
              {oauth2Loading === "google" ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Connecting…
                </>
              ) : (
                <>
                  <svg
                    className="me-2"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </>
              )}
            </Button>
          )}

          {configService.isOAuth2ProviderEnabled("github") && (
            <Button
              size="lg"
              className="oauth-btn py-3 rounded-3 d-flex align-items-center justify-content-center"
              onClick={() => handleOAuth2Login("github")}
              disabled={!!oauth2Loading}
            >
              {oauth2Loading === "github" ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Connecting…
                </>
              ) : (
                <>
                  <svg
                    className="me-2"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                </>
              )}
            </Button>
          )}

          {configService.isOAuth2ProviderEnabled("authentik") && (
            <Button
              size="lg"
              className="oauth-btn py-3 rounded-3 d-flex align-items-center justify-content-center"
              onClick={() => handleOAuth2Login("authentik")}
              disabled={!!oauth2Loading}
            >
              {oauth2Loading === "authentik" ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Connecting…
                </>
              ) : (
                <>
                  <svg
                    className="me-2"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                  Authentik
                </>
              )}
            </Button>
          )}
        </div>

        <div
          style={{ borderTop: "1px solid var(--bs-border-color, #e2e8f0)" }}
          className="pt-4"
        >
          <p
            className="text-center mb-2"
            style={{ fontSize: "0.875rem", color: "#64748b" }}
          >
            Prefer email &amp; password?{" "}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
          <p
            className="text-center mb-0"
            style={{ fontSize: "0.875rem", color: "#64748b" }}
          >
            New here?{" "}
            <Link to="/register" className="auth-link">
              Create account
            </Link>
          </p>
        </div>
      </div>
      <ThemeToggleButton />
    </Container>
  );
}

export default OAuth2Login;
