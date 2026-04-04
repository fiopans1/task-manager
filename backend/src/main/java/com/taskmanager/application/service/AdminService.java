package com.taskmanager.application.service;

import com.taskmanager.application.model.entities.AppConfig;
import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.model.exceptions.ResourceNotFoundException;
import com.taskmanager.application.respository.AppConfigRepository;
import com.taskmanager.application.respository.ListRepository;
import com.taskmanager.application.respository.TaskRepository;
import com.taskmanager.application.respository.TeamMemberRepository;
import com.taskmanager.application.respository.UserRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private static final Logger logger = LoggerFactory.getLogger(AdminService.class);

    private static final String FEATURE_PREFIX = "feature.";
    private static final String SYSTEM_MESSAGE_KEY = "system.message";
    private static final String SYSTEM_MESSAGE_ENABLED_KEY = "system.message.enabled";
    private static final String SYSTEM_MESSAGE_BEFORE_LOGIN_KEY = "system.message.beforeLogin";
    private static final String SYSTEM_MESSAGE_AFTER_LOGIN_KEY = "system.message.afterLogin";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ListRepository listRepository;

    @Autowired
    private TeamMemberRepository teamMemberRepository;

    @Autowired
    private AppConfigRepository appConfigRepository;

    // ===== USER MANAGEMENT =====

    @Transactional(readOnly = true)
    public List<Map<String, Object>> searchUsers(String query) {
        logger.info("Admin searching users with query: {}", query);
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }
        List<User> users = userRepository.searchUsers(query.trim());
        return users.stream().map(this::mapUserToAdminView).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getUserById(Long userId) throws ResourceNotFoundException {
        logger.info("Admin retrieving user with ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return mapUserToAdminView(user);
    }

    @Transactional
    public Map<String, Object> toggleUserBlock(Long userId) throws ResourceNotFoundException {
        logger.info("Admin toggling block status for user ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        user.setBlocked(!user.isBlocked());
        userRepository.save(user);
        logger.info("User {} is now {}", user.getUsername(), user.isBlocked() ? "blocked" : "unblocked");
        return mapUserToAdminView(user);
    }

    private Map<String, Object> mapUserToAdminView(User user) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("username", user.getUsername());
        map.put("email", user.getEmail());
        map.put("blocked", user.isBlocked());
        map.put("creationDate", user.getCreationDate());
        map.put("roles", user.getRoles().stream().map(r -> r.getName()).collect(Collectors.toList()));
        map.put("taskCount", taskRepository.countByUser(user));
        map.put("listCount", listRepository.countByUser(user));
        map.put("teamCount", teamMemberRepository.findAllByUser(user).size());
        return map;
    }

    // ===== FEATURE FLAGS =====

    @Transactional(readOnly = true)
    public Map<String, Boolean> getAllFeatureFlags() {
        logger.debug("Retrieving all feature flags");
        List<AppConfig> features = appConfigRepository.findByConfigKeyStartingWith(FEATURE_PREFIX);
        Map<String, Boolean> flags = new HashMap<>();
        for (AppConfig config : features) {
            String featureName = config.getConfigKey().substring(FEATURE_PREFIX.length());
            flags.put(featureName, "true".equalsIgnoreCase(config.getConfigValue()));
        }
        return flags;
    }

    @Transactional
    public Map<String, Boolean> updateFeatureFlag(String featureName, boolean enabled) {
        logger.info("Admin updating feature flag '{}' to {}", featureName, enabled);
        String key = FEATURE_PREFIX + featureName;
        AppConfig config = appConfigRepository.findByConfigKey(key)
                .orElseGet(() -> {
                    AppConfig newConfig = new AppConfig(key, String.valueOf(enabled));
                    return newConfig;
                });
        config.setConfigValue(String.valueOf(enabled));
        appConfigRepository.save(config);
        return getAllFeatureFlags();
    }

    // ===== SYSTEM MESSAGE =====

    @Transactional(readOnly = true)
    public Map<String, Object> getSystemMessage() {
        logger.debug("Retrieving system message");
        Map<String, Object> result = new HashMap<>();
        Optional<AppConfig> message = appConfigRepository.findByConfigKey(SYSTEM_MESSAGE_KEY);
        Optional<AppConfig> enabled = appConfigRepository.findByConfigKey(SYSTEM_MESSAGE_ENABLED_KEY);
        Optional<AppConfig> beforeLogin = appConfigRepository.findByConfigKey(SYSTEM_MESSAGE_BEFORE_LOGIN_KEY);
        Optional<AppConfig> afterLogin = appConfigRepository.findByConfigKey(SYSTEM_MESSAGE_AFTER_LOGIN_KEY);
        result.put("message", message.map(AppConfig::getConfigValue).orElse(""));
        result.put("enabled", enabled.map(c -> "true".equalsIgnoreCase(c.getConfigValue())).orElse(false));
        result.put("showBeforeLogin", beforeLogin.map(c -> "true".equalsIgnoreCase(c.getConfigValue())).orElse(false));
        result.put("showAfterLogin", afterLogin.map(c -> "true".equalsIgnoreCase(c.getConfigValue())).orElse(true));
        return result;
    }

    @Transactional
    public Map<String, Object> updateSystemMessage(String message, boolean enabled, boolean showBeforeLogin, boolean showAfterLogin) {
        logger.info("Admin updating system message, enabled: {}", enabled);
        AppConfig msgConfig = appConfigRepository.findByConfigKey(SYSTEM_MESSAGE_KEY)
                .orElseGet(() -> new AppConfig(SYSTEM_MESSAGE_KEY, ""));
        msgConfig.setConfigValue(message);
        appConfigRepository.save(msgConfig);

        AppConfig enabledConfig = appConfigRepository.findByConfigKey(SYSTEM_MESSAGE_ENABLED_KEY)
                .orElseGet(() -> new AppConfig(SYSTEM_MESSAGE_ENABLED_KEY, "false"));
        enabledConfig.setConfigValue(String.valueOf(enabled));
        appConfigRepository.save(enabledConfig);

        AppConfig beforeLoginConfig = appConfigRepository.findByConfigKey(SYSTEM_MESSAGE_BEFORE_LOGIN_KEY)
                .orElseGet(() -> new AppConfig(SYSTEM_MESSAGE_BEFORE_LOGIN_KEY, "false"));
        beforeLoginConfig.setConfigValue(String.valueOf(showBeforeLogin));
        appConfigRepository.save(beforeLoginConfig);

        AppConfig afterLoginConfig = appConfigRepository.findByConfigKey(SYSTEM_MESSAGE_AFTER_LOGIN_KEY)
                .orElseGet(() -> new AppConfig(SYSTEM_MESSAGE_AFTER_LOGIN_KEY, "true"));
        afterLoginConfig.setConfigValue(String.valueOf(showAfterLogin));
        appConfigRepository.save(afterLoginConfig);

        return getSystemMessage();
    }

    // ===== PUBLIC CONFIG (for all users) =====

    @Transactional(readOnly = true)
    public Map<String, Object> getPublicConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("features", getAllFeatureFlags());
        config.put("systemMessage", getSystemMessage());
        return config;
    }
}
