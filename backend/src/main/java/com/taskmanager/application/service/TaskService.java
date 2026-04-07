package com.taskmanager.application.service;

import com.taskmanager.application.model.dto.EventTaskDTO;
import com.taskmanager.application.model.dto.TaskDTO;
import com.taskmanager.application.model.entities.ActionTask;
import com.taskmanager.application.model.entities.EventTask;
import com.taskmanager.application.model.entities.PriorityTask;
import com.taskmanager.application.model.entities.StateTask;
import com.taskmanager.application.model.entities.Task;
import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.model.exceptions.NotPermissionException;
import com.taskmanager.application.model.exceptions.ResourceNotFoundException;
import com.taskmanager.application.respository.ActionTaskRepository;
import com.taskmanager.application.respository.EventTaskRepository;
import com.taskmanager.application.respository.TaskRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.taskmanager.application.model.dto.ActionTaskDTO;
import com.taskmanager.application.model.dto.TaskResumeDTO;
import com.taskmanager.application.model.dto.TaskSummaryDTO;
import com.taskmanager.application.respository.UserRepository;

@Service
public class TaskService {

    private static final Logger logger = LoggerFactory.getLogger(TaskService.class);

    @Autowired
    private TaskRepository tasksRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private ActionTaskRepository actionTaskRepository;

    @Autowired
    private EventTaskRepository eventTaskRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MessageService messageService;

    /*This method, when the frontend is properly implemented, should check who is
     * logged in, and see if they are admin or not. If not admin, we only put the task with the user who created it,
     * if admin, we can put the task with the user assigned by the admin (in this case send the username).
     */
    @Transactional
    public Task createTask(TaskDTO taskDto) {
        logger.info("Creating task: {}", taskDto.getNameOfTask());

        validateEventDates(taskDto);

        Task task = TaskDTO.toEntity(taskDto);
        User user = authService.getCurrentUser();

        task.setCreationDate(new Date());
        if (task.getUser() != null && authService.hasRole("ROLE_ADMIN")) {
            logger.info("Admin creating task for user: {}", task.getUser().getUsername());
            Task savedTask = tasksRepository.save(task);
            logger.info("Successfully created task with ID: {} for user: {}", savedTask.getId(), task.getUser().getUsername());
            return savedTask;
        } else {
            task.setUser(user);
            logger.info("User {} creating task: {}", user.getUsername(), taskDto.getNameOfTask());
            Task savedTask = tasksRepository.save(task);
            logger.info("Successfully created task with ID: {} for user: {}", savedTask.getId(), user.getUsername());
            return savedTask;
        }
    }

    @Transactional
    public Task updateTask(Long id, TaskDTO task) throws ResourceNotFoundException, NotPermissionException {
        logger.info("Updating task with ID: {}", id);

        validateEventDates(task);

        Task taskToUpdate = tasksRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("Task not found with ID: {}", id);
                    return new ResourceNotFoundException(messageService.getMessage("task.not.found", id));
                });

        if (authService.hasRole("ROLE_ADMIN") || taskToUpdate.getUser().getUsername().equals(authService.getCurrentUsername())) {
            logger.debug("Permission granted for updating task ID: {}", id);

            taskToUpdate.setNameOfTask(task.getNameOfTask());
            taskToUpdate.setDescriptionOfTask(task.getDescriptionOfTask());
            taskToUpdate.setPriority(task.getPriority());
            taskToUpdate.setState(task.getState());

            if (task.isEvent()) {
                logger.debug("Task ID: {} is being updated as an event", id);
                if (taskToUpdate.getEventTask() != null) {
                    taskToUpdate.getEventTask().setStartTime(task.getStartDate());
                    taskToUpdate.getEventTask().setEndTime(task.getEndDate());
                } else {
                    EventTask event = new EventTask();
                    event.setStartTime(task.getStartDate());
                    event.setEndTime(task.getEndDate());
                    taskToUpdate.setEventTask(event);
                }
            } else {
                logger.debug("Task ID: {} event properties removed", id);
                taskToUpdate.setEventTask(null);
            }

            Task savedTask = tasksRepository.save(taskToUpdate);
            logger.info("Successfully updated task with ID: {}", id);
            return savedTask;
        } else {
            logger.warn("Permission denied updating task with ID: {} for user: {}", id, authService.getCurrentUsername());
            throw new NotPermissionException(messageService.getMessage("task.no.permission.update"));
        }
    }

    @Transactional(readOnly = true)
    public List<TaskDTO> findAllTasksForLoggedUser() {
        logger.info("Finding all tasks for logged user");

        User user = authService.getCurrentUser();
        logger.debug("Current user: {}", user.getUsername());

        List<Task> list = tasksRepository.findAllByUser(user);
        logger.debug("Found {} tasks for user: {}", list.size(), user.getUsername());

        List<TaskDTO> result = list.stream().map(task -> TaskDTO.fromEntity(task)).toList();
        logger.info("Successfully retrieved {} tasks for user: {}", result.size(), user.getUsername());

        return result;
    }

    @Transactional(readOnly = true)
    public Page<TaskDTO> findAllTasksForLoggedUser(Pageable pageable) {
        User user = authService.getCurrentUser();
        Page<Task> page = tasksRepository.findAllByUser(user, pageable);
        return page.map(TaskDTO::fromEntity);
    }

    @Transactional(readOnly = true)
    public List<Task> findAllTasksByUser(User user) {
        logger.info("Finding all tasks for user: {}", user.getUsername());

        List<Task> tasks = tasksRepository.findAllByUser(user);
        logger.debug("Found {} tasks for user: {}", tasks.size(), user.getUsername());

        return tasks;
    }

    @Transactional
    public void deleteTask(Task task) {
        logger.info("Attempting to delete task with ID: {}", task.getId());

        if (authService.hasRole("ROLE_ADMIN") || task.getUser().getUsername().equals(authService.getCurrentUsername())) {
            logger.debug("Permission granted for deleting task ID: {}", task.getId());
            tasksRepository.delete(task);
            logger.info("Successfully deleted task with ID: {}", task.getId());
        } else {
            logger.warn("Permission denied deleting task with ID: {} for user: {}", task.getId(), authService.getCurrentUsername());
        }
    }

    @Transactional
    public void deleteTaskById(Long id) throws NotPermissionException, ResourceNotFoundException {
        logger.info("Attempting to delete task with ID: {}", id);

        Task task = tasksRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("Task not found with ID: {}", id);
                    return new ResourceNotFoundException(messageService.getMessage("task.not.found", id));
                });

        if (authService.hasRole("ROLE_ADMIN") || task.getUser().getUsername().equals(authService.getCurrentUsername())) {
            logger.debug("Permission granted for deleting task ID: {}", id);
            tasksRepository.deleteById(id);
            logger.info("Successfully deleted task with ID: {}", id);
        } else {
            logger.warn("Permission denied deleting task with ID: {} for user: {}", id, authService.getCurrentUsername());
            throw new NotPermissionException(messageService.getMessage("task.no.permission.delete"));
        }
    }

    @Transactional(readOnly = true)
    public Task getTaskById(Long id) throws ResourceNotFoundException, NotPermissionException {
        logger.info("Retrieving task with ID: {}", id);

        Task task = tasksRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("Task not found with ID: {}", id);
                    return new ResourceNotFoundException(messageService.getMessage("task.not.found", id));
                });

        if (authService.hasRole("ROLE_ADMIN") || task.getUser().getUsername().equals(authService.getCurrentUsername())) {
            logger.debug("Permission granted for accessing task ID: {}", id);
            logger.info("Successfully retrieved task with ID: {}", id);
            return task;
        } else {
            logger.warn("Permission denied accessing task with ID: {} for user: {}", id, authService.getCurrentUsername());
            throw new NotPermissionException(messageService.getMessage("task.no.permission.view"));
        }
    }

    @Transactional(readOnly = true)
    public List<EventTaskDTO> getAllEventsForCurrentUser() {
        logger.info("Retrieving all events for current user");

        User user = authService.getCurrentUser();
        logger.debug("Current user: {}", user.getUsername());

        List<EventTaskDTO> events = eventTaskRepository.findAllEventsByUserId(user.getId());
        logger.debug("Found {} events for user: {}", events.size(), user.getUsername());
        logger.info("Successfully retrieved {} events for user: {}", events.size(), user.getUsername());

        return events;
    }

    @Transactional
    public ActionTask addActionToTask(Long taskId, ActionTaskDTO actionTask) throws ResourceNotFoundException, NotPermissionException {

        logger.info("Adding action to task with ID: {}", taskId);

        Task task = tasksRepository.findById(taskId)
                .orElseThrow(() -> {
                    logger.error("Task not found with ID: {}", taskId);
                    return new ResourceNotFoundException(messageService.getMessage("task.not.found", taskId));
                });

        if (!authService.hasRole("ROLE_ADMIN") && !task.getUser().getUsername().equals(authService.getCurrentUsername())) {
            logger.warn("Permission denied adding action to task with ID: {} for user: {}", taskId, authService.getCurrentUsername());
            throw new NotPermissionException(messageService.getMessage("task.no.permission.add.action"));
        }

        logger.debug("Permission granted for adding action to task ID: {}", taskId);
        ActionTask newAction = ActionTaskDTO.toEntity(actionTask);
        newAction.setUser(task.getUser().getUsername());
        newAction.setActionDate(new Date());
        task.addAction(newAction);
        ActionTask toReturn = actionTaskRepository.save(newAction);
        logger.info("Successfully added action to task with ID: {}", taskId);
        return toReturn;
    }

    @Transactional(readOnly = true)
    public List<ActionTask> getAllActionsForTask(Long taskId) throws ResourceNotFoundException, NotPermissionException {
        logger.info("Retrieving all actions for task with ID: {}", taskId);

        Task task = tasksRepository.findById(taskId)
                .orElseThrow(() -> {
                    logger.error("Task not found with ID: {}", taskId);
                    return new ResourceNotFoundException(messageService.getMessage("task.not.found", taskId));
                });

        if (!authService.hasRole("ROLE_ADMIN") && !task.getUser().getUsername().equals(authService.getCurrentUsername())) {
            logger.warn("Permission denied accessing actions for task with ID: {} for user: {}", taskId, authService.getCurrentUsername());
            throw new NotPermissionException(messageService.getMessage("task.no.permission.view.actions"));
        }

        logger.debug("Permission granted for accessing actions for task ID: {}", taskId);
        List<ActionTask> actions = actionTaskRepository.findAllByTask(task);
        logger.info("Successfully retrieved {} actions for task with ID: {}", actions.size(), taskId);
        return actions;
    }

    @Transactional(readOnly = true)
    public Page<ActionTask> getAllActionsForTask(Long taskId, Pageable pageable) throws ResourceNotFoundException, NotPermissionException {
        Task task = tasksRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException(messageService.getMessage("task.not.found", taskId)));

        if (!authService.hasRole("ROLE_ADMIN") && !task.getUser().getUsername().equals(authService.getCurrentUsername())) {
            throw new NotPermissionException(messageService.getMessage("task.no.permission.view.actions"));
        }

        return actionTaskRepository.findAllByTask(task, pageable);
    }

    @Transactional
    public void deleteActionFromTask(Long taskId, Long actionId) throws ResourceNotFoundException, NotPermissionException {
        logger.info("Deleting action with ID: {} from task with ID: {}", actionId, taskId);

        Task task = tasksRepository.findById(taskId)
                .orElseThrow(() -> {
                    logger.error("Task not found with ID: {}", taskId);
                    return new ResourceNotFoundException(messageService.getMessage("task.not.found", taskId));
                });

        if (!authService.hasRole("ROLE_ADMIN") && !task.getUser().getUsername().equals(authService.getCurrentUsername())) {
            logger.warn("Permission denied deleting action from task with ID: {} for user: {}", taskId, authService.getCurrentUsername());
            throw new NotPermissionException(messageService.getMessage("task.no.permission.delete.actions"));
        }

        logger.debug("Permission granted for deleting action from task ID: {}", taskId);
        ActionTask action = actionTaskRepository.findById(actionId)
                .orElseThrow(() -> {
                    logger.error("Action not found with ID: {}", actionId);
                    return new ResourceNotFoundException(messageService.getMessage("action.not.found", actionId));
                });

        if (!action.getTask().equals(task)) {
            logger.warn("Action with ID: {} does not belong to task with ID: {}", actionId, taskId);
            throw new NotPermissionException(messageService.getMessage("task.no.permission.delete.action"));
        }

        actionTaskRepository.delete(action);
        logger.info("Successfully deleted action with ID: {} from task with ID: {}", actionId, taskId);
    }

    @Transactional
    public ActionTask updateActionTask(Long taskId, Long actionId, ActionTaskDTO actionTaskDTO) throws ResourceNotFoundException, NotPermissionException {
        logger.info("Updating action with ID: {} from task with ID: {}", actionId, taskId);

        Task task = tasksRepository.findById(taskId)
                .orElseThrow(() -> {
                    logger.error("Task not found with ID: {}", taskId);
                    return new ResourceNotFoundException(messageService.getMessage("task.not.found", taskId));
                });

        if (!authService.hasRole("ROLE_ADMIN") && !task.getUser().getUsername().equals(authService.getCurrentUsername())) {
            logger.warn("Permission denied updating action from task with ID: {} for user: {}", taskId, authService.getCurrentUsername());
            throw new NotPermissionException(messageService.getMessage("task.no.permission.update.actions"));
        }

        logger.debug("Permission granted for updating action from task ID: {}", taskId);
        ActionTask action = actionTaskRepository.findById(actionId)
                .orElseThrow(() -> {
                    logger.error("Action not found with ID: {}", actionId);
                    return new ResourceNotFoundException(messageService.getMessage("action.not.found", actionId));
                });

        if (!action.getTask().equals(task)) {
            logger.warn("Action with ID: {} does not belong to task with ID: {}", actionId, taskId);
            throw new NotPermissionException(messageService.getMessage("task.no.permission.update.action"));
        }

        action.setActionName(actionTaskDTO.getActionName());
        action.setActionDescription(actionTaskDTO.getActionDescription());

        ActionTask updatedAction = actionTaskRepository.save(action);
        logger.info("Successfully updated action with ID: {} from task with ID: {}", actionId, taskId);
        return updatedAction;
    }

    @Transactional(readOnly = true)
    public List<TaskResumeDTO> getTasksResumeWithoutList(){
        logger.info("Retrieving task resumes without list for current user");

        User user = authService.getCurrentUser();
        logger.debug("Current user: {}", user.getUsername());

        List<TaskResumeDTO> tasksResume = tasksRepository.findTasksResumeWithoutListByUserId(user.getId());
        logger.info("Successfully retrieved {} task resumes without list for user: {}", tasksResume.size(), user.getUsername());

        return tasksResume;
    }

    private void validateEventDates(TaskDTO taskDto) {
        if (taskDto.isEvent()) {
            if (taskDto.getStartDate() == null) {
                throw new IllegalArgumentException(messageService.getMessage("task.event.start.date.required"));
            }
            if (taskDto.getEndDate() == null) {
                throw new IllegalArgumentException(messageService.getMessage("task.event.end.date.required"));
            }
            if (taskDto.getEndDate().before(taskDto.getStartDate())) {
                throw new IllegalArgumentException(messageService.getMessage("task.event.end.before.start"));
            }
        }
    }

    // ===== ADMIN: Get task summaries for a specific user =====

    @Transactional(readOnly = true)
    public List<TaskSummaryDTO> getTaskSummariesByUserId(Long userId) throws ResourceNotFoundException, NotPermissionException {
        if (!authService.hasRole("ROLE_ADMIN")) {
            throw new NotPermissionException(messageService.getMessage("task.admin.only.view"));
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(messageService.getMessage("user.not.found.id", userId)));
        List<Task> tasks = tasksRepository.findAllByUser(user);
        return tasks.stream().map(TaskSummaryDTO::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public Page<TaskSummaryDTO> getTaskSummariesByUserId(Long userId, Pageable pageable) throws ResourceNotFoundException, NotPermissionException {
        if (!authService.hasRole("ROLE_ADMIN")) {
            throw new NotPermissionException(messageService.getMessage("task.admin.only.view"));
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(messageService.getMessage("user.not.found.id", userId)));
        return tasksRepository.findAllByUser(user, pageable).map(TaskSummaryDTO::fromEntity);
    }

}
