import {
  Row,
  Col,
  Button,
  Container,
  Card,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import configService from "../services/configService";

const HomePage = () => {
  const navigateTo = useNavigate();

  return (
    <Container
      fluid
      className="task-manager-bg d-flex justify-content-center align-items-center py-4"
    >
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6} xl={5}>
          <Card className="modern-card p-4 p-md-5 rounded-4">
            {/* Header Principal */}
            <div className="text-center mb-5">
              <h1 className="brand-title display-4 mb-3">Task Manager</h1>
              <p className="welcome-subtitle mb-4">
                Organize your tasks, boost your productivity
              </p>

              {/* Features showcase - simplified */}
              <Row className="mb-4 text-center">
                <Col xs={4}>
                  <div className="feature-icon-simple">
                    <i className="bi bi-list-check fs-3"></i>
                  </div>
                  <div className="feature-text">Organize</div>
                </Col>
                <Col xs={4}>
                  <div className="feature-icon-simple">
                    <i className="bi bi-lightning-charge fs-3"></i>
                  </div>
                  <div className="feature-text">Fast</div>
                </Col>
                <Col xs={4}>
                  <div className="feature-icon-simple">
                    <i className="bi bi-bullseye fs-3"></i>
                  </div>
                  <div className="feature-text">Focus</div>
                </Col>
              </Row>
            </div>

            {/* Botones de Acción Tradicionales */}
            <div className="d-grid gap-3">
              <Button
                className="modern-btn-primary modern-btn py-3 rounded-3"
                size="lg"
                onClick={() => navigateTo("/login")}
              >
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Sign In to Your Account
              </Button>

              <Button
                className="modern-btn-outline modern-btn py-3 rounded-3"
                size="lg"
                onClick={() => navigateTo("/register")}
              >
                <i className="bi bi-person-plus me-2"></i>
                Create New Account
              </Button>
            </div>
            {configService.isOAuth2Enabled() && (
              <div>
                {/* Separador */}
                <div className="text-center mb-4">
                  <hr className="my-3" />
                  <small className="text-muted">Or continue with</small>
                </div>

                <div className="mb-4">
                  <Button
                    className="modern-btn-success modern-btn py-3 rounded-3 w-100"
                    size="lg"
                    onClick={() => navigateTo("/oauth2-login")}
                  >
                    <i className="bi bi-shield-lock me-2"></i>
                    Continue with SSO
                  </Button>
                </div>
              </div>
            )}

            {/* Footer informativo */}
            <div className="text-center mt-4 pt-3 border-top">
              <small className="text-muted">
                Start managing your tasks efficiently today
              </small>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
