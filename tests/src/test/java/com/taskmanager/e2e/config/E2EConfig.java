package com.taskmanager.e2e.config;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.Locale;
import java.util.Properties;

/**
 * Loads the E2E configuration from {@code tests/e2e.properties} and allows
 * environment variables or system properties to override every value.
 */
public final class E2EConfig {

    private static final Properties PROPERTIES = loadProperties();

    private E2EConfig() {
    }

    public static String baseUrl() {
        return trimTrailingSlash(value("e2e.base-url", "E2E_BASE_URL", "http://localhost:3000"));
    }

    public static String username() {
        return value("e2e.username", "E2E_USERNAME", "admin");
    }

    public static String password() {
        return value("e2e.password", "E2E_PASSWORD", "admin");
    }

    public static String collaboratorUsername() {
        return value("e2e.collaborator.username", "E2E_COLLABORATOR_USERNAME", "basic");
    }

    public static String collaboratorPassword() {
        return value("e2e.collaborator.password", "E2E_COLLABORATOR_PASSWORD", "basic");
    }

    public static String collaboratorEmail() {
        return value("e2e.collaborator.email", "E2E_COLLABORATOR_EMAIL", "basic@example.com");
    }

    public static String browserName() {
        return value("e2e.browser", "E2E_BROWSER", "chromium").toLowerCase(Locale.ROOT);
    }

    public static boolean headless() {
        return Boolean.parseBoolean(value("e2e.headless", "E2E_HEADLESS", "false"));
    }

    public static double slowMoMillis() {
        return Double.parseDouble(value("e2e.slow-mo-ms", "E2E_SLOW_MO_MS", "0"));
    }

    public static Duration timeout() {
        return Duration.ofSeconds(Long.parseLong(value("e2e.timeout-seconds", "E2E_TIMEOUT_SECONDS", "30")));
    }

    public static Duration assertionTimeout() {
        return Duration.ofSeconds(Long.parseLong(
                value("e2e.assertion-timeout-seconds", "E2E_ASSERTION_TIMEOUT_SECONDS", "15")));
    }

    public static boolean tracingEnabled() {
        return Boolean.parseBoolean(value("e2e.trace", "E2E_TRACE", "false"));
    }

    public static Path artifactsDir() {
        return resolvePath(value("e2e.artifacts-dir", "E2E_ARTIFACTS_DIR", "target/playwright-artifacts"));
    }

    public static Path configFile() {
        String configured = System.getProperty("e2e.config");
        if (configured != null && !configured.isBlank()) {
            return Paths.get(configured).toAbsolutePath().normalize();
        }
        return null;
    }

    private static String value(String propertyName, String environmentName, String defaultValue) {
        String systemValue = System.getProperty(propertyName);
        if (systemValue != null && !systemValue.isBlank()) {
            return systemValue.trim();
        }

        String environmentValue = System.getenv(environmentName);
        if (environmentValue != null && !environmentValue.isBlank()) {
            return environmentValue.trim();
        }

        String propertyValue = PROPERTIES.getProperty(propertyName);
        if (propertyValue != null && !propertyValue.isBlank()) {
            return propertyValue.trim();
        }

        return defaultValue;
    }

    private static Properties loadProperties() {
        Properties properties = new Properties();

        Path explicit = configFile();
        if (explicit != null && Files.isRegularFile(explicit)) {
            try (InputStream input = Files.newInputStream(explicit)) {
                properties.load(input);
                return properties;
            } catch (IOException e) {
                throw new IllegalStateException("Unable to read E2E configuration: " + explicit, e);
            }
        }

        for (String candidate : new String[]{"e2e.properties", "tests/e2e.properties"}) {
            Path path = Paths.get(candidate);
            if (Files.isRegularFile(path)) {
                try (InputStream input = Files.newInputStream(path)) {
                    properties.load(input);
                    return properties;
                } catch (IOException e) {
                    throw new IllegalStateException("Unable to read E2E configuration: " + path, e);
                }
            }
        }

        try (InputStream input = E2EConfig.class.getResourceAsStream("/e2e.properties")) {
            if (input != null) {
                properties.load(input);
            }
        } catch (IOException e) {
            throw new IllegalStateException("Unable to read the classpath E2E configuration", e);
        }

        return properties;
    }

    private static String trimTrailingSlash(String value) {
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }

    private static Path resolvePath(String value) {
        Path path = Paths.get(value);
        if (!path.isAbsolute()) {
            path = Paths.get(System.getProperty("user.dir")).resolve(path);
        }
        return path.toAbsolutePath().normalize();
    }
}
