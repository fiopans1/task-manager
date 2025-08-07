package com.taskmanager.application.service.oauth2providers;

import java.util.Arrays;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.taskmanager.application.model.entities.FullName;

@Service
public class GithubOAuth2ProviderServiceImpl implements OAuth2ProviderService {

    private static final Logger logger = LoggerFactory.getLogger(GithubOAuth2ProviderServiceImpl.class);

    @Value("${taskmanager.oauth2.github.enabled:false}")
    private boolean isProviderActive;

    @Override
    public String extractEmail(OAuth2User user, OAuth2UserRequest userRequest) {
        logger.debug("Extracting email from GitHub OAuth2 user");

        String email = user.getAttribute("email");

        // Si el email es null, intentar obtenerlo de la API de emails
        if (email == null || email.isEmpty()) {
            logger.debug("Direct email not available, checking notification_email");
            String notification_email = user.getAttribute("notification_email");
            if (notification_email != null && !notification_email.isEmpty()) {
                logger.debug("Using notification_email from GitHub user");
                return notification_email;
            }
            logger.debug("Fetching primary email from GitHub API");
            return fetchPrimaryEmailFromGitHub(userRequest);
        }

        logger.debug("Successfully extracted email from GitHub user");
        return email;
    }

    @Override
    public FullName extractFullName(OAuth2User user) {
        logger.debug("Extracting full name from GitHub OAuth2 user");

        String name = user.getAttribute("name");
        if (name != null && !name.isEmpty()) {
            String[] parts = name.split("\\s+");
            logger.debug("Successfully extracted full name from GitHub user");
            return new FullName(
                    parts.length > 0 ? parts[0] : "",
                    parts.length > 1 ? parts[1] : "",
                    parts.length > 2 ? parts[2] : ""
            );
        }

        logger.debug("No full name available from GitHub user");
        return null;
    }

    @Override
    public String extractUsername(OAuth2User user) {
        logger.debug("Extracting username from GitHub OAuth2 user");

        String username = user.getAttribute("login");
        logger.debug("Successfully extracted username from GitHub user: {}", username);
        return username;
    }

    // @Override
    // public String extractProfilePicture(OAuth2User user) {
    //     return user.getAttribute("avatar_url");
    // }
    @Override
    public String extractProviderId(OAuth2User user) {
        logger.debug("Extracting provider ID from GitHub OAuth2 user");

        Integer id = user.getAttribute("id");
        String providerId = id != null ? id.toString() : null;
        logger.debug("Successfully extracted provider ID from GitHub user");
        return providerId;
    }

    private String fetchPrimaryEmailFromGitHub(OAuth2UserRequest userRequest) {
        logger.debug("Fetching primary email from GitHub API");

        try {
            String accessToken = userRequest.getAccessToken().getTokenValue();

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));
            headers.set("User-Agent", "Spring-Boot-App");

            HttpEntity<String> entity = new HttpEntity<>(headers);
            RestTemplate restTemplate = new RestTemplate();

            ResponseEntity<Map[]> response = restTemplate.exchange(
                    "https://api.github.com/user/emails",
                    HttpMethod.GET,
                    entity,
                    Map[].class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                logger.debug("Successfully retrieved email list from GitHub API");

                String primaryEmail = Arrays.stream(response.getBody())
                        .filter(email -> Boolean.TRUE.equals(email.get("primary"))
                        && Boolean.TRUE.equals(email.get("verified")))
                        .map(email -> (String) email.get("email"))
                        .findFirst()
                        .orElse(null);

                if (primaryEmail != null) {
                    logger.info("Successfully fetched primary email from GitHub API");
                } else {
                    logger.warn("No primary verified email found in GitHub API response");
                }

                return primaryEmail;
            }

            logger.warn("Failed to fetch emails from GitHub API - HTTP {}", response.getStatusCode());
            return null;

        } catch (Exception e) {
            logger.error("Error fetching email from GitHub API: {}", e.getMessage(), e);
            return null;
        }
    }

    @Override
    public boolean isProviderActive() {
        logger.debug("Checking if GitHub OAuth2 provider is active: {}", isProviderActive);
        return isProviderActive;
    }
}
