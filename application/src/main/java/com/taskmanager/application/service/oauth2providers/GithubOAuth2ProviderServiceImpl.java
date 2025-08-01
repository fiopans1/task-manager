package com.taskmanager.application.service.oauth2providers;

import java.util.Arrays;
import java.util.Map;

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

    @Override
    public String extractEmail(OAuth2User user, OAuth2UserRequest userRequest) {
        String email = user.getAttribute("email");

        // Si el email es null, intentar obtenerlo de la API de emails
        if (email == null || email.isEmpty()) {
            String notification_email = user.getAttribute("notification_email");
            if (notification_email != null && !notification_email.isEmpty()) {
                return notification_email;
            }
            return fetchPrimaryEmailFromGitHub(userRequest);
        }

        return email;
    }

    @Override
    public FullName extractFullName(OAuth2User user) {
        String name = user.getAttribute("name");
        if (name != null && !name.isEmpty()) {
            String[] parts = name.split("\\s+");
            return new FullName(
                    parts.length > 0 ? parts[0] : "",
                    parts.length > 1 ? parts[1] : "",
                    parts.length > 2 ? parts[2] : ""
            );
        }
        return null;
    }

    @Override
    public String extractUsername(OAuth2User user) {
        return user.getAttribute("login");
    }

    // @Override
    // public String extractProfilePicture(OAuth2User user) {
    //     return user.getAttribute("avatar_url");
    // }
    @Override
    public String extractProviderId(OAuth2User user) {
        Integer id = user.getAttribute("id");
        return id != null ? id.toString() : null;
    }

    private String fetchPrimaryEmailFromGitHub(OAuth2UserRequest userRequest) {
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
                return Arrays.stream(response.getBody())
                        .filter(email -> Boolean.TRUE.equals(email.get("primary"))
                        && Boolean.TRUE.equals(email.get("verified")))
                        .map(email -> (String) email.get("email"))
                        .findFirst()
                        .orElse(null);
            }

            return null;

        } catch (Exception e) {
            System.err.println("Error fetching email from GitHub: " + e.getMessage());
            return null;
        }
    }
}
