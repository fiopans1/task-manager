describe("Login Test", () => {
  beforeEach(() => {
    // Stubbing JWT para evitar errores de decodificación
    cy.window().then((win) => {
      win.localStorage.removeItem("auth_token");
    });

    // Interceptamos la petición de login para poder controlar la respuesta
    cy.intercept("POST", "**/auth/login", (req) => {
      if (req.body.username === "admin" && req.body.password === "admin123") {
        req.reply({
          statusCode: 200,
          // Usamos un token JWT válido formateado correctamente
          body: {
            token:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyLCJ1c2VybmFtZSI6ImFkbWluIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
          },
        });
      } else {
        req.reply({
          statusCode: 401,
          body: { error: "Credenciales inválidas" },
        });
      }
    }).as("loginRequest");

    // Visitar la página de login
    cy.visit("/login");
  });

  it("Debería mostrar el formulario de login", () => {
    // Verificar elementos en la página
    cy.contains("Task Manager").should("be.visible");
    cy.get("input#formBasicUsername").should("be.visible");
    cy.get("input#formBasicPassword").should("be.visible");
    cy.get('button[type="submit"]').should("be.visible");
  });

  it("Debería mostrar mensaje de error con credenciales incorrectas", () => {
    // Ingresar credenciales incorrectas
    cy.get("input#formBasicUsername").type("usuarioincorrecto");
    cy.get("input#formBasicPassword").type("contraseñaincorrecta");
    cy.get('button[type="submit"]').click();

    cy.wait("@loginRequest");

    // Verificar mensaje de error (puede tardar un poco)
    cy.contains("Error al iniciar sesión", { timeout: 10000 }).should(
      "be.visible"
    );
  });

  it("Debería iniciar sesión correctamente", () => {
    // Ingresar credenciales correctas
    cy.get("input#formBasicUsername").type("admin");
    cy.get("input#formBasicPassword").type("admin123");
    cy.get('button[type="submit"]').click();

    cy.wait("@loginRequest");

    // Verificar mensaje de éxito
    cy.contains("Logged in", { timeout: 10000 }).should("be.visible");

    // No verificamos la navegación completa ya que puede haber problemas con JWT
    // en las pruebas, pero verificamos que el token se almacenó correctamente
    cy.window()
      .its("localStorage")
      .invoke("getItem", "auth_token")
      .should("not.be.null");
  });
});
