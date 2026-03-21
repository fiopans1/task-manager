import { Button, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import configService from "../services/configService";
import ThemeToggleButton from "../components/common/ThemeToggleButton";

const HomePage = () => {
  const navigateTo = useNavigate();

  return (
    <Container
      fluid
      className="task-manager-bg d-flex flex-column justify-content-center align-items-center px-3"
    >
      <div style={{ maxWidth: 420, width: "100%" }}>
        <h1 className="brand-title text-center mb-3">
          {configService.getAppName()}
        </h1>

        <p className="auth-heading text-center mb-4">
          Your tasks, under control.
        </p>
        <p className="auth-subtext text-center mb-5">
          A simple and focused way to organize your day, track progress, and get
          things done.
        </p>

        <div className="d-grid gap-3 mb-4">
          <Button
            className="auth-btn-primary py-3 rounded-3"
            size="lg"
            onClick={() => navigateTo("/login")}
          >
            Sign in
          </Button>
          <Button
            className="auth-btn-secondary py-3 rounded-3"
            size="lg"
            onClick={() => navigateTo("/register")}
          >
            Create account
          </Button>
        </div>

        {configService.isOAuth2Enabled() && (
          <>
            <div className="auth-divider my-4">or</div>
            <Button
              variant="success"
              className="w-100 py-3 rounded-3"
              size="lg"
              onClick={() => navigateTo("/oauth2-login")}
            >
              <i className="bi bi-shield-lock me-2"></i>
              Continue with SSO
            </Button>
          </>
        )}

        <p
          className="text-center mt-5 mb-0"
          style={{ fontSize: "0.8125rem", color: "#94a3b8" }}
        >
          Free &amp; open-source task management
        </p>
      </div>
      <ThemeToggleButton />
    </Container>
  );
};

export default HomePage;
