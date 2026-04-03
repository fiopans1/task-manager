package com.taskmanager.application.service;

import com.taskmanager.application.model.dto.ListTMDTO;
import com.taskmanager.application.model.dto.TaskDTO;
import com.taskmanager.application.model.dto.TeamDTO;
import com.taskmanager.application.model.entities.AppConfig;
import com.taskmanager.application.model.entities.ListTM;
import com.taskmanager.application.model.entities.Task;
import com.taskmanager.application.model.entities.Team;
import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.model.exceptions.ResourceNotFoundException;
import com.taskmanager.application.respository.AppConfigRepository;
import com.taskmanager.application.respository.ListRepository;
import com.taskmanager.application.respository.TaskRepository;
import com.taskmanager.application.respository.TeamMemberRepository;
import com.taskmanager.application.respository.TeamRepository;
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
    private TeamRepository teamRepository;

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

    // ===== USER TASKS =====

    @Transactional(readOnly = true)
    public List<TaskDTO> getUserTasks(Long userId) throws ResourceNotFoundException {
        logger.info("Admin retrieving tasks for user ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        List<Task> tasks = taskRepository.findAllByUser(user);
        return tasks.stream().map(TaskDTO::fromEntity).collect(Collectors.toList());
    }

    @Transactional
    public TaskDTO updateUserTask(Long userId, Long taskId, TaskDTO taskDTO) throws ResourceNotFoundException {
        logger.info("Admin updating task {} for user {}", taskId, userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));
        if (!task.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Task does not belong to user");
        }
        if (taskDTO.getNameOfTask() != null) task.setNameOfTask(taskDTO.getNameOfTask());
        if (taskDTO.getDescriptionOfTask() != null) task.setDescriptionOfTask(taskDTO.getDescriptionOfTask());
        if (taskDTO.getState() != null) task.setState(taskDTO.getState());
        if (taskDTO.getPriority() != null) task.setPriority(taskDTO.getPriority());
        return TaskDTO.fromEntity(taskRepository.save(task));
    }

    @Transactional
    public void deleteUserTask(Long userId, Long taskId) throws ResourceNotFoundException {
        logger.info("Admin deleting task {} for user {}", taskId, userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));
        if (!task.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Task does not belong to user");
        }
        taskRepository.delete(task);
    }

    // ===== USER LISTS =====

    @Transactional(readOnly = true)
    public List<ListTMDTO> getUserLists(Long userId) throws ResourceNotFoundException {
        logger.info("Admin retrieving lists for user ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        List<ListTM> lists = listRepository.findAllByUser(user);
        return lists.stream().map(l -> ListTMDTO.fromEntity(l, false)).collect(Collectors.toList());
    }

    @Transactional
    public void deleteUserList(Long userId, Long listId) throws ResourceNotFoundException {
        logger.info("Admin deleting list {} for user {}", listId, userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        ListTM list = listRepository.findById(listId)
                .orElseThrow(() -> new ResourceNotFoundException("List not found with id: " + listId));
        if (!list.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("List does not belong to user");
        }
        for (Task task : list.getListTasks()) {
            task.setList(null);
        }
        listRepository.delete(list);
    }

    // ===== USER TEAMS =====

    @Transactional(readOnly = true)
    public List<TeamDTO> getUserTeams(Long userId) throws ResourceNotFoundException {
        logger.info("Admin retrieving teams for user ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        List<Team> teams = teamRepository.findAllByMemberUser(user);
        return teams.stream().map(t -> TeamDTO.fromEntity(t, false)).collect(Collectors.toList());
    }

    @Transactional
    public TeamDTO updateTeam(Long teamId, TeamDTO teamDTO) throws ResourceNotFoundException {
        logger.info("Admin updating team {}", teamId);
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + teamId));
        if (teamDTO.getName() != null) team.setName(teamDTO.getName());
        if (teamDTO.getDescription() != null) team.setDescription(teamDTO.getDescription());
        return TeamDTO.fromEntity(teamRepository.save(team), false);
    }

    @Transactional
    public void deleteTeam(Long teamId) throws ResourceNotFoundException {
        logger.info("Admin deleting team {}", teamId);
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + teamId));
        teamRepository.delete(team);
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

    // ===== PUBLIC CONFIG (for all authenticated users) =====

    @Transactional(readOnly = true)
    public Map<String, Object> getPublicConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("features", getAllFeatureFlags());
        config.put("systemMessage", getSystemMessage());
        return config;
    }
}
