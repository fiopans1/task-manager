package com.taskmanager.application.service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taskmanager.application.model.dto.TaskTimeEntryDTO;
import com.taskmanager.application.model.dto.TaskTimerStatusDTO;
import com.taskmanager.application.model.entities.ActionTask;
import com.taskmanager.application.model.entities.ActionType;
import com.taskmanager.application.model.entities.Task;
import com.taskmanager.application.model.entities.TaskTimeEntry;
import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.model.exceptions.NotPermissionException;
import com.taskmanager.application.model.exceptions.ResourceNotFoundException;
import com.taskmanager.application.respository.ActionTaskRepository;
import com.taskmanager.application.respository.TaskRepository;
import com.taskmanager.application.respository.TaskTimeEntryRepository;

@Service
public class TaskTimerService {

    private static final Logger logger = LoggerFactory.getLogger(TaskTimerService.class);

    @Autowired
    private TaskRepository tasksRepository;

    @Autowired
    private TaskTimeEntryRepository timeEntryRepository;

    @Autowired
    private ActionTaskRepository actionTaskRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private Clock clock;

    @Transactional(readOnly = true)
    public TaskTimerStatusDTO getStatus(Long taskId) throws ResourceNotFoundException, NotPermissionException {
        logger.debug("Retrieving timer status for task with ID: {}", taskId);

        Task task = getAuthorizedTask(taskId);
        TaskTimeEntry activeEntry = timeEntryRepository.findFirstByTaskAndActiveTrue(task).orElse(null);
        return buildStatus(task, activeEntry);
    }

    @Transactional
    public TaskTimerStatusDTO startTimer(Long taskId) throws ResourceNotFoundException, NotPermissionException {
        logger.info("Starting timer for task with ID: {}", taskId);

        Task task = getAuthorizedTask(taskId);
        TaskTimeEntry activeEntry = timeEntryRepository.findFirstByTaskAndActiveTrue(task).orElse(null);

        if (activeEntry != null) {
            logger.debug("Timer for task with ID: {} is already running", taskId);
            if (!task.isRunning()) {
                task.setRunning(true);
                tasksRepository.save(task);
            }
            return buildStatus(task, activeEntry);
        }

        User currentUser = getCurrentUserOrThrow();
        Date now = now();

        TaskTimeEntry entry = new TaskTimeEntry();
        entry.setTask(task);
        entry.setUser(currentUser);
        entry.setStartTime(now);
        entry.setActive(true);
        timeEntryRepository.save(entry);

        task.setRunning(true);
        tasksRepository.save(task);

        createTimerAction(task, "Timer started",
                "Time tracking started by @" + currentUser.getUsername(),
                ActionType.TIMER_STARTED, now, currentUser);

        logger.info("Timer started for task with ID: {} by user: {}", taskId, currentUser.getUsername());
        return buildStatus(task, entry);
    }

    @Transactional
    public TaskTimerStatusDTO stopTimer(Long taskId) throws ResourceNotFoundException, NotPermissionException {
        logger.info("Stopping timer for task with ID: {}", taskId);

        Task task = getAuthorizedTask(taskId);
        TaskTimeEntry activeEntry = timeEntryRepository.findFirstByTaskAndActiveTrue(task).orElse(null);

        if (activeEntry == null) {
            logger.debug("No running timer found for task with ID: {}", taskId);
            if (task.isRunning()) {
                task.setRunning(false);
                tasksRepository.save(task);
            }
            return buildStatus(task, null);
        }

        User currentUser = getCurrentUserOrThrow();
        Date now = now();
        long durationSeconds = calculateDuration(activeEntry.getStartTime(), now);

        activeEntry.setEndTime(now);
        activeEntry.setDurationSeconds(durationSeconds);
        activeEntry.setActive(false);
        timeEntryRepository.save(activeEntry);

        task.setTotalTimeSeconds(task.getTotalTimeSeconds() + durationSeconds);
        task.setRunning(false);
        tasksRepository.save(task);

        createTimerAction(task, "Timer stopped",
                "Tracked " + formatDuration(durationSeconds) + " by @" + currentUser.getUsername(),
                ActionType.TIMER_STOPPED, now, currentUser);

        logger.info("Timer stopped for task with ID: {}. Session duration: {} seconds", taskId, durationSeconds);
        return buildStatus(task, null);
    }

    @Transactional(readOnly = true)
    public Page<TaskTimeEntryDTO> getTimeEntries(Long taskId, Pageable pageable)
            throws ResourceNotFoundException, NotPermissionException {
        logger.debug("Retrieving time entries for task with ID: {}", taskId);

        Task task = getAuthorizedTask(taskId);
        return timeEntryRepository.findAllByTask(task, pageable).map(TaskTimeEntryDTO::fromEntity);
    }

    private Task getAuthorizedTask(Long taskId) throws ResourceNotFoundException, NotPermissionException {
        Task task = tasksRepository.findById(taskId)
                .orElseThrow(() -> {
                    logger.error("Task not found with ID: {}", taskId);
                    return new ResourceNotFoundException("Task not found with id " + taskId);
                });

        User currentUser = getCurrentUserOrThrow();
        if (!authService.hasRole("ROLE_ADMIN")
                && !task.getUser().getUsername().equals(currentUser.getUsername())) {
            logger.warn("Permission denied accessing timer for task with ID: {} for user: {}",
                    taskId, currentUser.getUsername());
            throw new NotPermissionException("You don't have permission to access the timer for this task");
        }

        return task;
    }

    private User getCurrentUserOrThrow() throws NotPermissionException {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new NotPermissionException("No authenticated user found");
        }
        return currentUser;
    }

    private TaskTimerStatusDTO buildStatus(Task task, TaskTimeEntry activeEntry) {
        TaskTimerStatusDTO status = new TaskTimerStatusDTO();
        status.setTaskId(task.getId());
        status.setTotalSeconds(task.getTotalTimeSeconds());
        status.setSessionsCount(timeEntryRepository.countByTask(task));

        if (activeEntry != null) {
            status.setRunning(true);
            status.setActiveEntry(TaskTimeEntryDTO.fromEntity(activeEntry));
            status.setActiveElapsedSeconds(calculateDuration(activeEntry.getStartTime(), now()));
        } else {
            status.setRunning(false);
            status.setActiveElapsedSeconds(0L);
        }

        return status;
    }

    private void createTimerAction(Task task, String name, String description, ActionType type,
            Date date, User user) {
        ActionTask action = new ActionTask();
        action.setActionName(name);
        action.setActionDescription(description);
        action.setActionType(type);
        action.setUser(user.getUsername());
        action.setActionDate(date);
        action.setTask(task);
        task.addAction(action);
        actionTaskRepository.save(action);
    }

    private long calculateDuration(Date startTime, Date endTime) {
        if (startTime == null || endTime == null) {
            return 0L;
        }
        long seconds = Duration.between(startTime.toInstant(), endTime.toInstant()).getSeconds();
        return Math.max(0L, seconds);
    }

    private Date now() {
        return Date.from(Instant.now(clock));
    }

    private String formatDuration(long totalSeconds) {
        long hours = totalSeconds / 3600;
        long minutes = (totalSeconds % 3600) / 60;
        long seconds = totalSeconds % 60;
        return String.format("%02d:%02d:%02d", hours, minutes, seconds);
    }
}
