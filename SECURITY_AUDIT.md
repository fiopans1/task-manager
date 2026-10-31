# 🔒 Informe de Auditoría de Seguridad — Task Manager

**Fecha:** 09 de abril de 2026
**Aplicación:** Task Manager (Spring Boot + React)
**Alcance:** Análisis exhaustivo de resiliencia frente a ataques

---

## Resumen Ejecutivo

Se han identificado **7 vulnerabilidades Críticas**, **13 de nivel Alto** y **12 de nivel Medio** en el análisis del backend (Spring Boot / Java) y frontend (React). Las más urgentes son: Mass Assignment en el registro de usuarios, CSRF deshabilitado con HTTP Basic activo, credenciales por defecto embebidas, y almacenamiento del JWT en `localStorage`.

| Severidad    | Cantidad | Categorías principales                                              |
|--------------|----------|---------------------------------------------------------------------|
| 🔴 Crítico   | 7        | Mass Assignment, CSRF+Basic Auth, credenciales hardcodeadas, IDOR   |
| 🟠 Alto      | 13       | JWT, enumeración de usuarios, rate limiting, stack traces, headers   |
| 🟡 Medio     | 12       | Stored XSS, log injection, CSP, clickjacking, token revocation      |

---

## 🔴 CRÍTICO

### C-01 · Mass Assignment en Endpoint de Registro

| Campo         | Detalle                                                                          |
|---------------|----------------------------------------------------------------------------------|
| **Archivo**   | `backend/.../controller/AuthRestController.java:49`                              |
| **Categoría** | Inyección / Validación                                                           |

**Código vulnerable:**

```java
@PostMapping("/register")
public ResponseEntity<ResponseDTO> register(@RequestBody User user) throws Exception {
```

**Riesgo:** La entidad JPA `User` se usa directamente como `@RequestBody`. Un atacante puede inyectar campos adicionales en el JSON como `roles`, `blocked`, `id` o `authProviders` para auto-asignarse el rol ADMIN:

```json
{
  "username": "attacker",
  "email": "a@b.com",
  "password": "P@ss1234",
  "roles": [{"id": 1, "name": "ADMIN"}],
  "blocked": false
}
```

**Corrección:**

```java
public class RegisterDTO {
    @NotBlank @Size(max = 50) private String username;
    @NotBlank @Email private String email;
    @NotBlank @Size(min = 8, max = 100) private String password;
    @Valid private NameDTO name;
    // solo getters/setters
}

@PostMapping("/register")
public ResponseEntity<ResponseDTO> register(@Valid @RequestBody RegisterDTO dto) throws Exception {
    User user = new User();
    user.setUsername(dto.getUsername());
    user.setEmail(dto.getEmail());
    user.setPassword(dto.getPassword());
    // name mapping...
    ResponseDTO response = authService.register(user);
    // ...
}
```

---

### C-02 · CSRF Deshabilitado Globalmente con HTTP Basic Activo

| Campo         | Detalle                                                                          |
|---------------|----------------------------------------------------------------------------------|
| **Archivo**   | `backend/.../config/WebSecurityConfig.java:62-63`                                |
| **Categoría** | Configuración de Seguridad                                                       |

**Código vulnerable:**

```java
http.csrf(csrf -> csrf.disable());
http.httpBasic(Customizer.withDefaults());
```

**Riesgo:** CSRF está deshabilitado para todos los endpoints, pero HTTP Basic está habilitado. HTTP Basic envía credenciales en Base64 (texto plano) con cada petición y es susceptible a CSRF ya que el navegador envía automáticamente el header `Authorization` en peticiones cross-origin. Un atacante puede crear un formulario en un sitio malicioso que envíe peticiones autenticadas al backend.

**Corrección:**

```java
// Opción 1 (recomendada): Eliminar HTTP Basic si solo se usa JWT
// http.httpBasic(Customizer.withDefaults()); ← ELIMINAR

// Opción 2: Si se necesita CSRF con HTTP Basic
http.csrf(csrf -> csrf
    .ignoringRequestMatchers("/auth/**", "/health", "/api/config")
    .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
);
```

---

### C-03 · Credenciales de Administrador Hardcodeadas por Defecto

| Campo         | Detalle                                                                          |
|---------------|----------------------------------------------------------------------------------|
| **Archivo**   | `backend/.../config/DataLoader.java:63-76`                                       |
| **Categoría** | Exposición de Datos Sensibles                                                    |

**Código vulnerable:**

```java
admin.setUsername(environment.getProperty("taskmanager.default-admin-username", "admin"));
admin.setPassword(passwordEncoder.encode(
    environment.getProperty("taskmanager.default-admin-password", "admin")));
// ...
user.setPassword(passwordEncoder.encode("basic")); // Sin override posible
```

**Riesgo:** Si las propiedades no se configuran, la app arranca con credenciales `admin/admin`. El usuario `basic` siempre tiene la contraseña `basic` sin posibilidad de cambio vía configuración.

**Corrección:**

```java
String adminPassword = environment.getRequiredProperty("taskmanager.default-admin-password");
if (adminPassword.length() < 12) {
    throw new IllegalStateException("Admin password must be at least 12 characters");
}
admin.setPassword(passwordEncoder.encode(adminPassword));

// Para basic user, también usar propiedad obligatoria
String basicPassword = environment.getRequiredProperty("taskmanager.default-basic-password");
user.setPassword(passwordEncoder.encode(basicPassword));
```

---

### C-04 · JWT Almacenado en localStorage (Vulnerable a XSS)

| Campo         | Detalle                                                                          |
|---------------|----------------------------------------------------------------------------------|
| **Archivo**   | `frontend/src/redux/store.js:3,15-18`                                            |
| **Categoría** | Autenticación y Sesiones                                                         |

**Código vulnerable:**

```js
import storage from "redux-persist/lib/storage"; // = localStorage
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],  // token persiste en localStorage
};
```

**Riesgo:** `redux-persist/lib/storage` usa `localStorage`. Cualquier XSS (incluso desde una librería de terceros comprometida) permite robar el token con `localStorage.getItem("persist:root")` y usarlo para account takeover permanente.

**Corrección:** Implementar arquitectura de cookies `httpOnly` en el backend:

```java
// Backend: en vez de devolver el token en JSON, establecer una cookie httpOnly
ResponseCookie cookie = ResponseCookie.from("jwt", token)
    .httpOnly(true)
    .secure(true)
    .path("/")
    .sameSite("Strict")
    .maxAge(Duration.ofMinutes(30))
    .build();
response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
```

---

### C-05 · Token OAuth2 Transmitido en URL

| Campo         | Detalle                                                                          |
|---------------|----------------------------------------------------------------------------------|
| **Archivo**   | `frontend/src/services/authService.js:151-170`                                   |
| **Categoría** | Autenticación y Sesiones                                                         |

**Código vulnerable:**

```js
const processOAuth2Token = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');  // JWT completo en la URL
  if (token) {
    store.dispatch(setToken(token));
    // ...
  }
};
```

**Y en el backend** (`OAuth2LoginSuccessHandler.java:82`):

```java
private String buildRedirectUrl(String token) {
    return authorizedRedirectUri + "?token=" + token;
}
```

**Riesgo:** El JWT aparece en la URL (`?token=eyJ...`), quedando registrado en: historial del navegador, headers `Referer`, logs de servidor/proxy, extensiones del navegador. Cualquier filtración de estos puntos compromete la sesión.

**Corrección:** Usar un código de autorización de un solo uso:

```java
// Backend: generar código temporal en vez de JWT directo
String authCode = UUID.randomUUID().toString();
codeStore.put(authCode, user.getId()); // TTL: 30 segundos
String redirectUrl = frontendUrl + "/oauth2-login?code=" + authCode;

// Frontend: intercambiar código por token vía POST
const response = await axios.post(serverUrl + "/auth/oauth2/exchange", { code });
store.dispatch(setToken(response.data.token));
```

---

### C-06 · Sin Protección de Rol en Ruta Admin (Frontend)

| Campo         | Detalle                                                                          |
|---------------|----------------------------------------------------------------------------------|
| **Archivo**   | `frontend/src/App.js:137`                                                        |
| **Categoría** | Autenticación y Sesiones / Control de Acceso                                     |

**Código vulnerable:**

```jsx
<Route path="/home/admin" element={<AdminPanel />} />
```

**Riesgo:** Todas las rutas de funcionalidad usan `<FeatureGuard>`, pero la ruta admin no tiene ninguna verificación de rol. Cualquier usuario autenticado puede navegar a `/home/admin` y ver la interfaz completa de administración, exponiendo la lista de usuarios, flags de funcionalidad y mensajes del sistema.

**Corrección:**

```jsx
// Crear componente RoleGuard
function RoleGuard({ requiredRole, children }) {
  const roles = authService.getRoles() || [];
  return roles.includes(requiredRole) ? children : <Navigate to="/home" replace />;
}

// En App.js
<Route path="/home/admin" element={
  <RoleGuard requiredRole="ROLE_ADMIN">
    <AdminPanel />
  </RoleGuard>
} />
```

---

### C-07 · Invitación de Equipo Sin Verificación de Destinatario (IDOR)

| Campo         | Detalle                                                                          |
|---------------|----------------------------------------------------------------------------------|
| **Archivo**   | `backend/.../service/TeamService.java:637-660`                                   |
| **Categoría** | Autenticación y Sesiones / IDOR                                                  |

**Código vulnerable:**

```java
public TeamDTO respondToInvitation(String token, boolean accept)
        throws ResourceNotFoundException {
    TeamInvitation invitation = invitationRepository.findByToken(token).orElseThrow(...);
    // ...
    User currentUser = authService.getCurrentUser();
    // ⚠️ NO verifica que currentUser sea el destinatario de la invitación
    if (accept) {
        TeamMember member = new TeamMember();
        member.setUser(currentUser); // Cualquier usuario puede aceptar
        // ...
    }
}
```

**Riesgo:** Cualquier usuario autenticado que conozca o adivine el UUID del token puede aceptar una invitación destinada a otra persona y unirse al equipo.

**Corrección:**

```java
User currentUser = authService.getCurrentUser();

// Verificar que la invitación es para el usuario actual
if (!currentUser.getUsername().equals(invitation.getInvitedUsername()) &&
    !currentUser.getEmail().equals(invitation.getInvitedEmail())) {
    throw new NotPermissionException("This invitation is not addressed to you");
}
```

---

## 🟠 ALTO

### A-01 · Token JWT con Expiración Excesiva (4 horas)

| Campo         | Detalle                                                                          |
|---------------|----------------------------------------------------------------------------------|
| **Archivo**   | `backend/.../service/JWTUtilityService.java:87`                                  |
| **Categoría** | Autenticación y Sesiones                                                         |

**Código vulnerable:**

```java
.expirationTime(new Date(now.getTime() + 4 * 60 * 60 * 1000))
```

**Riesgo:** Un token robado es válido durante 4 horas sin posibilidad de revocación. No existe mecanismo de token blacklist.

**Corrección:**

```java
.expirationTime(new Date(now.getTime() + 15 * 60 * 1000)) // 15 minutos
```

Implementar refresh tokens con rotación y revocación server-side.

---

### A-02 · Sin Validación de Issuer/Audience en JWT

| Campo         | Detalle                                                                          |
|---------------|----------------------------------------------------------------------------------|
| **Archivo**   | `backend/.../service/JWTUtilityService.java:83-113`                              |
| **Categoría** | Autenticación y Sesiones                                                         |

**Código vulnerable:**

```java
// Generación - sin issuer/audience
JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
    .subject(user.getUsername())
    .claim("roles", roles)
    .issueTime(now)
    .expirationTime(...)
    .build();

// Parseo - sin verificación de issuer/audience
```

**Riesgo:** Tokens de distintos entornos (staging, dev) o aplicaciones con las mismas claves RSA serían aceptados sin distinción.

**Corrección:**

```java
// Generación
.issuer("taskmanager-api")
.audience(List.of("taskmanager-frontend"))

// Validación en parseJWT
if (!"taskmanager-api".equals(claimsSet.getIssuer())) {
    throw new JOSEException("Invalid token issuer");
}
```

---

### A-03 · Enumeración de Usuarios vía Login

| Campo         | Detalle                                                                          |
|---------------|----------------------------------------------------------------------------------|
| **Archivo**   | `backend/.../service/AuthService.java:52-72`                                     |
| **Categoría** | Autenticación y Sesiones                                                         |

**Código vulnerable:**

```java
if (user.isEmpty()) {
    response.put("error", "User not registered!");           // Mensaje 1
}
if (user.get().isBlocked()) {
    response.put("error", "Your account has been blocked."); // Mensaje 2
}
response.put("error", "Username or password is incorrect!"); // Mensaje 3
```

**Riesgo:** Mensajes diferentes permiten a un atacante determinar si un usuario existe, y si está bloqueado.

**Corrección:**

```java
// Usar un único mensaje genérico para todos los casos
response.put("error", "Invalid username or password");
```

---

### A-04 · Enumeración de Usuarios vía Registro

| Campo         | Detalle                                                                          |
|---------------|----------------------------------------------------------------------------------|
| **Archivo**   | `backend/.../service/AuthService.java:98-108`                                    |
| **Categoría** | Autenticación y Sesiones                                                         |

**Código vulnerable:**

```java
if (existingUser.isPresent()) {
    response.addErrorMessage("User already registered!");
}
if (existingEmail.isPresent()) {
    response.addErrorMessage("Email already registered!");
}
```

**Riesgo:** Revela si un usuario o email ya está registrado.

**Corrección:**

```java
response.addSuccessMessage("If this account doesn't exist, it has been created successfully.");
// Enviar email de confirmación en background
```

---

### A-05 · Sin Validación de Input en LoginDTO

| Campo         | Detalle                                                                          |
|---------------|----------------------------------------------------------------------------------|
| **Archivo**   | `backend/.../model/dto/LoginDTO.java`, `AuthRestController.java:30`              |
| **Categoría** | Inyecciones y Validación                                                         |

**Código vulnerable:**

```java
public class LoginDTO {
    private String username;  // Sin @NotBlank, @Size ni ninguna validación
    private String password;
}

// En el controller - sin @Valid:
public ResponseEntity<...> login(@RequestBody LoginDTO login) throws Exception {
```

**Riesgo:** Entradas null, vacías o de longitud excesiva llegan al servicio sin filtrar.

**Corrección:**

```java
public class LoginDTO {
    @NotBlank @Size(max = 100) private String username;
    @NotBlank @Size(max = 200) private String password;
}

// En controller:
public ResponseEntity<...> login(@Valid @RequestBody LoginDTO login) {
```

---

### A-06 · Sin Rate Limiting en Endpoints de Autenticación

| Campo         | Detalle                                                                          |
|---------------|----------------------------------------------------------------------------------|
| **Archivo**   | `backend/.../controller/AuthRestController.java:30,48`                           |
| **Categoría** | Autenticación y Sesiones                                                         |

**Riesgo:** Los endpoints `/auth/login`, `/auth/register` y `/api/session/refresh` no tienen limitación de velocidad, permitiendo ataques de fuerza bruta y credential stuffing.

**Corrección:**

```java
// Usar Bucket4j o Resilience4j
@PostMapping("/login")
@RateLimiter(name = "authEndpoints", fallbackMethod = "rateLimitExceeded")
public ResponseEntity<...> login(...) { ... }
```

---

### A-07 · Stack Trace Filtrado en Fallos de JWT

| Campo         | Detalle                                                                          |
|---------------|----------------------------------------------------------------------------------|
| **Archivo**   | `backend/.../security/JWTAuthorizationFilter.java:73-74`                         |
| **Categoría** | Exposición de Datos Sensibles                                                    |

**Código vulnerable:**

```java
} catch (NoSuchAlgorithmException | ... | ParseException e) {
    logger.warn("JWT validation failed: {}", e.getMessage());
    throw new RuntimeException(e);  // ← Produce 500 con stack trace completo
}
```

**Riesgo:** Expone nombres de clases internas, rutas de archivos y detalles del stack al cliente.

**Corrección:**

```java
} catch (NoSuchAlgorithmException | ... | ParseException e) {
    logger.warn("JWT validation failed: {}", e.getMessage());
    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    response.setContentType("application/json");
    response.getWriter().write("{\"error\":\"Invalid or expired token\"}");
    return;
}
```

---

### A-08 · Falta de Security Headers

| Campo         | Detalle                                                                          |
|---------------|----------------------------------------------------------------------------------|
| **Archivo**   | `backend/.../config/WebSecurityConfig.java` (todo el `filterChain`)              |
| **Categoría** | Configuración de Seguridad                                                       |

**Riesgo:** No se configuran: `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, `Content-Security-Policy`.

**Corrección:**

```java
http.headers(headers -> headers
    .contentTypeOptions(Customizer.withDefaults())       // X-Content-Type-Options: nosniff
    .frameOptions(frame -> frame.deny())                 // X-Frame-Options: DENY
    .httpStrictTransportSecurity(hsts -> hsts
        .includeSubDomains(true)
        .maxAgeInSeconds(31536000))                      // HSTS
    .contentSecurityPolicy(csp -> csp
        .policyDirectives("default-src 'self'; script-src 'self'"))
);
```

---

### A-09 · JWT Token Filtrado en console.error del Frontend

| Campo         | Detalle                                                                               |
|---------------|---------------------------------------------------------------------------------------|
| **Archivo**   | `frontend/src/services/taskService.js:79`, `listService.js:84`, `teamService.js:71`   |
| **Categoría** | Exposición de Datos Sensibles                                                         |

**Código vulnerable:**

```js
console.error("Server URL or token not found", { serverUrl, token });
// token contiene el JWT completo "Bearer eyJ..."
```

**Riesgo:** El token JWT raw se imprime en la consola del navegador. Extensiones, monitoreo de errores o acceso físico permiten su robo.

**Corrección:**

```js
console.error("Server URL or authentication token not configured");
// NUNCA loguear el token
```

---

### A-10 · Mensajes de Error Internos Expuestos al Usuario

| Campo         | Detalle                                                                          |
|---------------|----------------------------------------------------------------------------------|
| **Archivo**   | `frontend/src/App.js:54`, `LoginPage.js`, `OAuth2Login.js`                       |
| **Categoría** | Exposición de Datos Sensibles                                                    |

**Código vulnerable:**

```js
errorToast(error.message || "Authentication error occurred");
errorToast("Login Error: " + error.message);
```

**Riesgo:** Mensajes de error del backend (que podrían contener stack traces o detalles internos) se muestran directamente al usuario.

**Corrección:**

```js
errorToast("Login failed. Please check your credentials and try again.");
console.error("Login error details:", error); // Solo para debugging
```

---

### A-11 · IDOR — Adición de Tareas Ajenas a Listas Propias

| Campo         | Detalle                                                                          |
|---------------|----------------------------------------------------------------------------------|
| **Archivo**   | `backend/.../service/ListService.java:148-153`                                   |
| **Categoría** | Autenticación y Sesiones / IDOR                                                  |

**Código vulnerable:**

```java
for (Long taskId : tasksListId) {
    Task task = taskRepository.findById(taskId).orElseThrow(...);
    list.addListTask(task);  // ← No verifica que el usuario sea dueño de la task
}
```

**Riesgo:** El código verifica la propiedad de la lista pero no de cada tarea. Un atacante puede añadir tareas de otro usuario a su propia lista.

**Corrección:**

```java
String currentUsername = authService.getCurrentUsername();
for (Long taskId : tasksListId) {
    Task task = taskRepository.findById(taskId).orElseThrow(...);
    if (!task.getUser().getUsername().equals(currentUsername)
        && !authService.hasRole("ROLE_ADMIN")) {
        throw new NotPermissionException("You don't own task " + taskId);
    }
    list.addListTask(task);
}
```

---

### A-12 · Actuator Potencialmente Expuesto

| Campo         | Detalle                                                                          |
|---------------|----------------------------------------------------------------------------------|
| **Archivo**   | `backend/pom.xml` (dependencia `spring-boot-starter-actuator`)                   |
| **Categoría** | Configuración de Seguridad                                                       |

**Riesgo:** Spring Boot Actuator está incluido pero no se observa configuración explícita. Endpoints como `/actuator/env`, `/actuator/configprops` podrían exponer configuración interna a cualquier usuario autenticado.

**Corrección (application.properties):**

```properties
management.endpoints.web.exposure.include=health
management.endpoint.health.show-details=never
server.error.include-stacktrace=never
server.error.include-message=never
```

---

### A-13 · BCryptPasswordEncoder Inconsistente y No Inyectado

| Campo         | Detalle                                                                          |
|---------------|----------------------------------------------------------------------------------|
| **Archivo**   | `backend/.../service/AuthService.java:81,111`                                    |
| **Categoría** | Autenticación y Sesiones                                                         |

**Código vulnerable:**

```java
// Login: strength por defecto (10)
private boolean verifyPassword(String enteredPassword, String storedPassword) {
    BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    return encoder.matches(enteredPassword, storedPassword);
}

// Registro: strength 12
BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
user.setPassword(encoder.encode(user.getPassword()));
```

**Riesgo:** Inconsistencia entre strength de registro (12) y verificación (10). Instancias creadas por petición en vez de reusar el bean.

**Corrección:**

```java
@Autowired
private PasswordEncoder passwordEncoder; // Inyectar el bean de WebSecurityConfig

private boolean verifyPassword(String enteredPassword, String storedPassword) {
    return passwordEncoder.matches(enteredPassword, storedPassword);
}

// En register:
user.setPassword(passwordEncoder.encode(user.getPassword()));
```

---

## 🟡 MEDIO

### M-01 · Stored XSS — Sin Sanitización de Input en Entidades

| Campo         | Detalle                                                                          |
|---------------|----------------------------------------------------------------------------------|
| **Archivo**   | DTOs: `TaskDTO`, `ListTMDTO`, `TeamDTO`                                          |
| **Categoría** | Inyecciones y Validación                                                         |

**Riesgo:** Los campos `nameOfTask`, `descriptionOfTask`, etc. (hasta 10.000 chars) se almacenan sin sanitizar y se devuelven tal cual en la API. Si el frontend renderiza sin escape, payloads como `<script>alert('xss')</script>` se ejecutarán.

**Corrección:**

```java
import org.springframework.web.util.HtmlUtils;

public void setNameOfTask(String name) {
    this.nameOfTask = HtmlUtils.htmlEscape(name);
}
```

---

### M-02 · GlobalExceptionHandler Incompleto — Stack Traces en Errores No Manejados

| Campo         | Detalle                                                                          |
|---------------|----------------------------------------------------------------------------------|
| **Archivo**   | `backend/.../controller/GlobalExceptionHandler.java`                             |
| **Categoría** | Exposición de Datos Sensibles                                                    |

**Código vulnerable:** Solo maneja `MethodArgumentNotValidException` e `IllegalArgumentException`. Excepciones como `NotPermissionException`, `RuntimeException`, etc. producen respuestas 500 con stack trace completo.

**Corrección:**

```java
@ExceptionHandler(NotPermissionException.class)
public ResponseEntity<Map<String, Object>> handleNotPermission(NotPermissionException ex) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN)
        .body(Map.of("message", "Access denied"));
}

@ExceptionHandler(Exception.class)
public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
    logger.error("Unexpected error", ex);
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(Map.of("message", "An internal error occurred"));
}
```

---

### M-03 · Log Injection

| Campo         | Detalle                                                                          |
|---------------|----------------------------------------------------------------------------------|
| **Archivo**   | `backend/.../service/AuthService.java:47`, `AuthRestController.java:31`          |
| **Categoría** | Inyecciones y Validación                                                         |

**Código vulnerable:**

```java
logger.info("Attempting login for username: {}", login.getUsername());
```

**Riesgo:** Un atacante puede inyectar `\r\n` en el username para falsificar entradas de log.

**Corrección:**

```java
String safeUsername = login.getUsername().replaceAll("[\\r\\n\\t]", "_");
logger.info("Attempting login for username: {}", safeUsername);
```

---

### M-04 · Error OAuth2 Filtra Mensaje de Excepción Interna

| Campo         | Detalle                                                                          |
|---------------|----------------------------------------------------------------------------------|
| **Archivo**   | `backend/.../security/OAuth2LoginSuccessHandler.java:92-93`                      |
| **Categoría** | Exposición de Datos Sensibles                                                    |

**Código vulnerable:**

```java
String errorUrl = authorizedRedirectUri + "?error=token_generation_failed&message="
    + java.net.URLEncoder.encode(e.getMessage(), "UTF-8");
```

**Riesgo:** Mensajes de excepción internos se envían al frontend vía URL.

**Corrección:**

```java
String errorUrl = authorizedRedirectUri + "?error=token_generation_failed";
logger.error("OAuth2 token generation failed", e); // Solo en logs del servidor
```

---

### M-05 · OPTIONS Requests Permitidos Globalmente

| Campo         | Detalle                                                                          |
|---------------|----------------------------------------------------------------------------------|
| **Archivo**   | `backend/.../config/WebSecurityConfig.java:54`                                   |
| **Categoría** | Configuración de Seguridad                                                       |

**Código vulnerable:**

```java
.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
```

**Riesgo:** Permite peticiones OPTIONS no autenticadas a cualquier ruta, evitando la cadena de seguridad.

**Corrección:** Dejar que la configuración CORS maneje los preflight automáticamente o restringir a rutas API específicas.

---

### M-06 · Sin Verificación de Firma JWT en Cliente

| Campo         | Detalle                                                                          |
|---------------|----------------------------------------------------------------------------------|
| **Archivo**   | `frontend/src/services/authService.js:70,89`                                     |
| **Categoría** | Autenticación y Sesiones                                                         |

**Código vulnerable:**

```js
const payload = decodeJwt(token); // Solo decodifica, NO verifica firma
```

**Riesgo:** `decodeJwt` de `jose` solo hace base64-decode del payload. Un atacante que modifique el token en localStorage puede inyectar roles/claims arbitrarios.

**Corrección:** No confiar en datos del token para decisiones de seguridad en el cliente. Todas las verificaciones de autorización deben realizarse en el backend.

---

### M-07 · URL Base HTTP Hardcodeada (Sin TLS)

| Campo         | Detalle                                                                          |
|---------------|----------------------------------------------------------------------------------|
| **Archivo**   | `frontend/public/config.js`                                                      |
| **Categoría** | Configuración de Seguridad                                                       |

**Código vulnerable:**

```js
baseUrl: 'http://localhost:8080'  // HTTP, no HTTPS
```

**Riesgo:** En producción, si no se cambia a `https://`, todo el tráfico API (incluyendo credenciales y tokens JWT) se transmite en texto plano.

**Corrección:** Usar `https://` por defecto en producción.

---

### M-08 · Sin Content Security Policy (CSP) en Frontend

| Campo         | Detalle                                                                          |
|---------------|----------------------------------------------------------------------------------|
| **Archivo**   | `frontend/public/index.html`                                                     |
| **Categoría** | Configuración de Seguridad                                                       |

**Corrección:**

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
               connect-src 'self' https://api.yourdomain.com; img-src 'self' data:;">
```

---

### M-09 · Sin Protección Clickjacking (X-Frame-Options)

| Campo         | Detalle                                                                          |
|---------------|----------------------------------------------------------------------------------|
| **Archivo**   | `frontend/public/index.html`, `WebSecurityConfig.java`                           |
| **Categoría** | Configuración de Seguridad                                                       |

**Corrección:** Configurar en el backend (ver A-08) o añadir `frame-ancestors 'none'` en CSP.

---

### M-10 · `window.APP_CONFIG` Accesible desde Cualquier Script

| Campo         | Detalle                                                                          |
|---------------|----------------------------------------------------------------------------------|
| **Archivo**   | `frontend/public/config.js`                                                      |
| **Categoría** | Exposición de Datos Sensibles                                                    |

**Corrección:**

```js
Object.freeze(window.APP_CONFIG);
Object.freeze(window.APP_CONFIG.api);
```

---

### M-11 · Sin Sanitización de Input en Frontend Antes de Enviar al API

| Campo         | Detalle                                                                          |
|---------------|----------------------------------------------------------------------------------|
| **Archivo**   | `frontend/src/components/auth/RegisterPage.js`, servicios varios                 |
| **Categoría** | Inyecciones y Validación                                                         |

**Corrección:** Aplicar `trim()` y validación de longitud mínima en el frontend. Sanitizar HTML con DOMPurify para campos de descripción.

---

### M-12 · Sin Token Revocation / Blacklisting

| Campo         | Detalle                                                                          |
|---------------|----------------------------------------------------------------------------------|
| **Archivo**   | `JWTUtilityService.java`, `JWTAuthorizationFilter.java`                          |
| **Categoría** | Autenticación y Sesiones                                                         |

**Riesgo:** Cuando un usuario es bloqueado vía admin panel, sus tokens existentes siguen siendo validados por la firma (aunque el filtro JWT verifica `isAccountNonLocked()` parcialmente). No hay forma de revocar un token específico comprometido.

**Corrección:** Implementar una tabla de tokens revocados con TTL, o reducir la vida del token y usar refresh tokens con revocación server-side.

---

## 📊 Tabla Resumen Completa

| ID    | Severidad      | Categoría                     | Vulnerabilidad                                     |
|-------|----------------|-------------------------------|----------------------------------------------------|
| C-01  | 🔴 Crítico     | Inyección / Validación        | Mass Assignment en registro                        |
| C-02  | 🔴 Crítico     | Configuración                 | CSRF deshabilitado + HTTP Basic activo              |
| C-03  | 🔴 Crítico     | Datos Sensibles               | Credenciales admin hardcodeadas                    |
| C-04  | 🔴 Crítico     | Autenticación                 | JWT en localStorage (XSS → robo de sesión)         |
| C-05  | 🔴 Crítico     | Autenticación                 | Token OAuth2 en URL                                |
| C-06  | 🔴 Crítico     | Control de Acceso             | Ruta admin sin protección de rol                   |
| C-07  | 🔴 Crítico     | Control de Acceso (IDOR)      | Invitación aceptable por cualquier usuario         |
| A-01  | 🟠 Alto        | Autenticación                 | JWT expiración 4 horas sin revocación              |
| A-02  | 🟠 Alto        | Autenticación                 | Sin validación issuer/audience JWT                 |
| A-03  | 🟠 Alto        | Autenticación                 | Enumeración usuarios vía login                     |
| A-04  | 🟠 Alto        | Autenticación                 | Enumeración usuarios vía registro                  |
| A-05  | 🟠 Alto        | Validación                    | Sin validación en LoginDTO                         |
| A-06  | 🟠 Alto        | Autenticación                 | Sin rate limiting en auth                          |
| A-07  | 🟠 Alto        | Datos Sensibles               | Stack trace en fallos JWT                          |
| A-08  | 🟠 Alto        | Configuración                 | Falta security headers                             |
| A-09  | 🟠 Alto        | Datos Sensibles               | JWT filtrado en console.error                      |
| A-10  | 🟠 Alto        | Datos Sensibles               | Errores internos expuestos al usuario              |
| A-11  | 🟠 Alto        | Control de Acceso (IDOR)      | Tareas ajenas añadidas a listas propias            |
| A-12  | 🟠 Alto        | Configuración                 | Actuator potencialmente expuesto                   |
| A-13  | 🟠 Alto        | Autenticación                 | BCrypt inconsistente y no inyectado                |
| M-01  | 🟡 Medio       | Inyección                     | Stored XSS en campos de entidades                  |
| M-02  | 🟡 Medio       | Datos Sensibles               | GlobalExceptionHandler incompleto                  |
| M-03  | 🟡 Medio       | Inyección                     | Log injection                                      |
| M-04  | 🟡 Medio       | Datos Sensibles               | Error OAuth2 filtra excepción                      |
| M-05  | 🟡 Medio       | Configuración                 | OPTIONS global permitAll                           |
| M-06  | 🟡 Medio       | Autenticación                 | Sin verificación de firma JWT en cliente            |
| M-07  | 🟡 Medio       | Configuración                 | URL base HTTP sin TLS                              |
| M-08  | 🟡 Medio       | Configuración                 | Sin CSP en frontend                                |
| M-09  | 🟡 Medio       | Configuración                 | Sin protección clickjacking                        |
| M-10  | 🟡 Medio       | Datos Sensibles               | window.APP_CONFIG accesible globalmente            |
| M-11  | 🟡 Medio       | Validación                    | Sin sanitización en frontend                       |
| M-12  | 🟡 Medio       | Autenticación                 | Sin token revocation                               |

---

## 🎯 Top 5 Acciones Prioritarias

1. **Crear `RegisterDTO`** y eliminar el uso de la entidad `User` como `@RequestBody` → Cierra C-01
2. **Eliminar `httpBasic`** o habilitar CSRF selectivo → Cierra C-02
3. **Migrar tokens a cookies `httpOnly`** en el backend → Cierra C-04 y reduce riesgo de C-05
4. **Validar destinatario** en `respondToInvitation` del TeamService → Cierra C-07
5. **Añadir `RoleGuard`** en la ruta `/home/admin` → Cierra C-06
