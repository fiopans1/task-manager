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
import org.springframework.stereotype.Service;

import com.taskmanager.application.model.dto.ActionTaskDTO;

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

    /*Este metodo cuando esté el front bien implementado lo que tiene que hacer es comprobar quien esta
     * logueada, y ver si es admin o no, si no es admin solo ponemos la tarea con el usuario que la creó,
     * si es admin podemos poner la tarea con el usuario que asigna el admin (en este caso mandar el username).
     */
    @Transactional
    public Task createTask(TaskDTO taskDto) {
        logger.info("Creating task: {}", taskDto.getNameOfTask());

        Task task = TaskDTO.toEntity(taskDto);
        User user = authService.getCurrentUser();

        task.setCreationDate(new Date());
        if (task.getUser() != null && authService.hasRole("ADMIN")) {
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

        Task taskToUpdate = tasksRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("Task not found with ID: {}", id);
                    return new ResourceNotFoundException("Task not found with id " + id);
                });
        
        if (authService.hasRole("ADMIN") || taskToUpdate.getUser().getUsername().equals(authService.getCurrentUsername())) {
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
            throw new NotPermissionException("You don't have permission to update this task");
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
    public List<Task> findAllTasksByUser(User user) {
        logger.info("Finding all tasks for user: {}", user.getUsername());
        
        List<Task> tasks = tasksRepository.findAllByUser(user);
        logger.debug("Found {} tasks for user: {}", tasks.size(), user.getUsername());
        
        return tasks;
    }

    @Transactional
    public void deleteTask(Task task) {
        logger.info("Attempting to delete task with ID: {}", task.getId());
        
        if (authService.hasRole("ADMIN") || task.getUser().getUsername().equals(authService.getCurrentUsername())) {
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
                    return new ResourceNotFoundException("Task not found with id " + id);
                });
        
        if (authService.hasRole("ADMIN") || task.getUser().getUsername().equals(authService.getCurrentUsername())) {
            logger.debug("Permission granted for deleting task ID: {}", id);
            tasksRepository.deleteById(id);
            logger.info("Successfully deleted task with ID: {}", id);
        } else {
            logger.warn("Permission denied deleting task with ID: {} for user: {}", id, authService.getCurrentUsername());
            throw new NotPermissionException("You don't have permission to delete this task");
        }
    }

    @Transactional(readOnly = true)
    public Task getTaskById(Long id) throws ResourceNotFoundException, NotPermissionException {
        logger.info("Retrieving task with ID: {}", id);
        
        Task task = tasksRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("Task not found with ID: {}", id);
                    return new ResourceNotFoundException("Task not found with id " + id);
                });
        
        if (authService.hasRole("ADMIN") || task.getUser().getUsername().equals(authService.getCurrentUsername())) {
            logger.debug("Permission granted for accessing task ID: {}", id);
            logger.info("Successfully retrieved task with ID: {}", id);
            return task;
        } else {
            logger.warn("Permission denied accessing task with ID: {} for user: {}", id, authService.getCurrentUsername());
            throw new NotPermissionException("You don't have permission to see this task");
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
                return new ResourceNotFoundException("Task not found with id " + taskId);
            });

        if (!authService.hasRole("ADMIN") && !task.getUser().getUsername().equals(authService.getCurrentUsername())) {
            logger.warn("Permission denied adding action to task with ID: {} for user: {}", taskId, authService.getCurrentUsername());
            throw new NotPermissionException("You don't have permission to add actions to this task");
        }

        logger.debug("Permission granted for adding action to task ID: {}", taskId);
        ActionTask newAction = ActionTaskDTO.toEntity(actionTask);
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
                    return new ResourceNotFoundException("Task not found with id " + taskId);
                });

        if (!authService.hasRole("ADMIN") && !task.getUser().getUsername().equals(authService.getCurrentUsername())) {
            logger.warn("Permission denied accessing actions for task with ID: {} for user: {}", taskId, authService.getCurrentUsername());
            throw new NotPermissionException("You don't have permission to see the actions for this task");
        }

        logger.debug("Permission granted for accessing actions for task ID: {}", taskId);
        List<ActionTask> actions = actionTaskRepository.findAllByTask(task);
        logger.info("Successfully retrieved {} actions for task with ID: {}", actions.size(), taskId);
        return actions;
    }

    @Transactional
    public void deleteActionFromTask(Long taskId, Long actionId) throws ResourceNotFoundException, NotPermissionException {
        logger.info("Deleting action with ID: {} from task with ID: {}", actionId, taskId);

        Task task = tasksRepository.findById(taskId)
                .orElseThrow(() -> {
                    logger.error("Task not found with ID: {}", taskId);
                    return new ResourceNotFoundException("Task not found with id " + taskId);
                });

        if (!authService.hasRole("ADMIN") && !task.getUser().getUsername().equals(authService.getCurrentUsername())) {
            logger.warn("Permission denied deleting action from task with ID: {} for user: {}", taskId, authService.getCurrentUsername());
            throw new NotPermissionException("You don't have permission to delete actions from this task");
        }

        logger.debug("Permission granted for deleting action from task ID: {}", taskId);
        ActionTask action = actionTaskRepository.findById(actionId)
                .orElseThrow(() -> {
                    logger.error("Action not found with ID: {}", actionId);
                    return new ResourceNotFoundException("Action not found with id " + actionId);
                });

        if (!action.getTask().equals(task)) {
            logger.warn("Action with ID: {} does not belong to task with ID: {}", actionId, taskId);
            throw new NotPermissionException("You don't have permission to delete this action");
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
                    return new ResourceNotFoundException("Task not found with id " + taskId);
                });

        if (!authService.hasRole("ADMIN") && !task.getUser().getUsername().equals(authService.getCurrentUsername())) {
            logger.warn("Permission denied updating action from task with ID: {} for user: {}", taskId, authService.getCurrentUsername());
            throw new NotPermissionException("You don't have permission to update actions from this task");
        }

        logger.debug("Permission granted for updating action from task ID: {}", taskId);
        ActionTask action = actionTaskRepository.findById(actionId)
                .orElseThrow(() -> {
                    logger.error("Action not found with ID: {}", actionId);
                    return new ResourceNotFoundException("Action not found with id " + actionId);
                });

        if (!action.getTask().equals(task)) {
            logger.warn("Action with ID: {} does not belong to task with ID: {}", actionId, taskId);
            throw new NotPermissionException("You don't have permission to update this action");
        }

        action.setActionName(actionTaskDTO.getActionName());
        action.setActionDescription(actionTaskDTO.getActionDescription());
        
        ActionTask updatedAction = actionTaskRepository.save(action);
        logger.info("Successfully updated action with ID: {} from task with ID: {}", actionId, taskId);
        return updatedAction;
    }

}
