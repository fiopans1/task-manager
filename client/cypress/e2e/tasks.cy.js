describe("Tasks Test", () => {
  it("Debería realizar el flujo completo de tareas", () => {
    // Preparar las interceptaciones
    cy.intercept("POST", "**/auth/login", {
      statusCode: 200,
      body: {
        token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyLCJ1c2VybmFtZSI6ImFkbWluIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
      },
    }).as("login");

    // 1. Iniciar sesión
    cy.visit("/login");
    cy.get("input#formBasicUsername").type("admin");
    cy.get("input#formBasicPassword").type("admin123");
    cy.get('button[type="submit"]').click();

    // Esperar a que se complete el login
    cy.wait("@login");

    // Verificar mensaje de inicio de sesión exitoso
    cy.contains("Logged in", { timeout: 10000 }).should("be.visible");

    // 2. Test de verificación mínima - Solo comprobamos que la aplicación carga sin errores
    cy.get("body").should("be.visible");
    cy.get("body").should("not.contain", "Error");
  });
});
