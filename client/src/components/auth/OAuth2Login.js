import React, { useState, useEffect } from "react";
import authService from "../../services/authService";
import configService from "../../services/configService";
import { Container, Button, Card, Spinner, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { successToast, errorToast } from "../common/Noty";

function OAuth2Login({ onLogin }) {
  const [oauth2Loading, setOauth2Loading] = useState("");

  useEffect(() => {
    const checkOAuth2Token = async () => {
      try {
        const oauth2Token = authService.checkForOAuth2Token();
        if (oauth2Token) {
          successToast("Login successfully with OAuth2");
          onLogin(oauth2Token); // Notificar a App.js
        }else{
          const urlParams = new URLSearchParams(window.location.search);
          const code = urlParams.get("code");
          const message = urlParams.get("message");
          if (code && message) {
            errorToast("OAuth2 login failed with code: " + code + " and message: " + message);
          }
        }
      } catch (error) {
        errorToast("Error OAuth2: " + error.message);
      }
    };

    checkOAuth2Token();
  }, [onLogin]);

  // 🚀 INICIAR LOGIN OAUTH2
  const handleOAuth2Login = (provider) => {
    setOauth2Loading(provider);
    try {
      authService.loginWithOAuth2(provider);
      // El usuario será redirigido automáticamente al proveedor
    } catch (error) {
      setOauth2Loading("");
      errorToast("Error OAuth2: " + error.message);
    }
  };

  return (
    <Container
      fluid
      className="task-manager-bg vh-100 d-flex justify-content-center align-items-center p-3"
    >
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={8} md={6} lg={4} xl={3}>
          <Card className="modern-card p-4 p-md-5 rounded-4">
            {/* Header */}
            <div className="text-center mb-5">
              <h2 className="brand-title display-6">Task Manager</h2>
              <p className="text-muted mb-0">
                Continue with your preferred account
              </p>
            </div>

            {/* Botones OAuth2 */}
            <div className="oauth2-section mb-4">
              {/* Google */}
              {configService.isOAuth2ProviderEnabled('google') && (
                <Button
                  size="lg"
                  variant="outline-danger"
                  className={`oauth2-btn w-100 py-3 mb-3 fw-semibold rounded-3 d-flex align-items-center justify-content-center ${
                    oauth2Loading === "google" ? "loading" : ""
                  }`}
                  onClick={() => handleOAuth2Login("google")}
                  disabled={oauth2Loading}
                >
                  {oauth2Loading === "google" ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Connecting with Google...
                    </>
                  ) : (
                    <>
                      <svg
                        className="me-2"
                        width="20"
                        height="20"
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
                      Continue with Google
                    </>
                  )}
                </Button>
              )}

              {/* GitHub */}
              {configService.isOAuth2ProviderEnabled('github') && (
                <Button
                  size="lg"
                  variant="outline-dark"
                  className={`oauth2-btn w-100 py-3 mb-3 fw-semibold rounded-3 d-flex align-items-center justify-content-center ${
                    oauth2Loading === "github" ? "loading" : ""
                  }`}
                  onClick={() => handleOAuth2Login("github")}
                  disabled={oauth2Loading}
                >
                  {oauth2Loading === "github" ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Connecting with GitHub...
                    </>
                  ) : (
                    <>
                      <svg
                        className="me-2"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="#333"
                      >
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                      Continue with GitHub
                    </>
                  )}
                </Button>
              )}

              {/* Authentik */}
              {configService.isOAuth2ProviderEnabled('authentik') && (
                <Button
                  size="lg"
                  variant="outline-dark"
                  className={`oauth2-btn w-100 py-3 mb-3 fw-semibold rounded-3 d-flex align-items-center justify-content-center ${
                    oauth2Loading === "authentik" ? "loading" : ""
                  }`}
                  onClick={() => handleOAuth2Login("authentik")}
                  disabled={oauth2Loading}
                >
                  {oauth2Loading === "authentik" ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Connecting with Authentik...
                    </>
                  ) : (
                    <>
                      <svg
                        className="me-2"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="#fd4b2d"
                      >
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                      Continue with Authentik
                    </>
                  )}
                </Button>
              )}
            </div>



            {/* Info */}
            <div className="text-center mb-4">
              <small className="text-muted">
                Quick and secure access with your existing account
              </small>
            </div>

            {/* Footer */}
            <hr className="mb-3" />
            <div className="text-center">
              <small className="text-muted">
                Prefer traditional login?{" "}
                <Link to="/login" className="modern-link">
                  Sign in with password
                </Link>
              </small>
              <br />
              <small className="text-muted mt-2 d-block">
                New to Task Manager?{" "}
                <Link to="/register" className="modern-link">
                  Create account
                </Link>
              </small>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default OAuth2Login;
