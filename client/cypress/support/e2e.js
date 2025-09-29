// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

// Exponer el Redux store para pruebas
Cypress.on("window:before:load", (win) => {
  // Crear una propiedad para almacenar el Redux store
  win.store = null;
});

// Ignorar excepciones específicas de JWT para las pruebas
Cypress.on("uncaught:exception", (err, runnable) => {
  // Retornar false previene que Cypress falle la prueba
  if (err.message.includes("Invalid JWT")) {
    return false;
  }
  // Para otras excepciones, dejamos que Cypress falle la prueba
  return true;
});

// Comando para esperar a que el store esté listo
Cypress.Commands.add("waitForStoreReady", () => {
  return new Cypress.Promise((resolve) => {
    const checkStore = () => {
      if (window.store) {
        return resolve(window.store);
      }
      setTimeout(checkStore, 100);
    };
    checkStore();
  });
});
