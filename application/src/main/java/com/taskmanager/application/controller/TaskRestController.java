package com.taskmanager.application.controller;

import com.taskmanager.application.model.dto.ActionTaskDTO;
import com.taskmanager.application.model.dto.EventTaskDTO;
import com.taskmanager.application.model.dto.TaskDTO;
import com.taskmanager.application.model.entities.ActionTask;
import com.taskmanager.application.model.exceptions.NotPermissionException;
import com.taskmanager.application.model.exceptions.ResourceNotFoundException;
import com.taskmanager.application.service.TaskService;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tasks")
public class TaskRestController {

    private static final Logger logger = LoggerFactory.getLogger(TaskRestController.class);

    @Autowired
    private TaskService taskService;

    @PostMapping("/create")
    public ResponseEntity<TaskDTO> createTask(@RequestBody TaskDTO task) { //TO-DO: All ResponseEntity change and put correctly messages
        logger.info("Creating new task: {}", task.getNameOfTask());

        try {
            TaskDTO createdTask = TaskDTO.fromEntity(taskService.createTask(task));
            logger.info("Task created successfully with ID: {}", createdTask.getId());
            return ResponseEntity.ok().body(createdTask);
        } catch (Exception e) {
            logger.error("Error creating task: {}", task.getNameOfTask(), e);
            throw e;
        }
    }

    @GetMapping("/tasks")
    public ResponseEntity<List<TaskDTO>> getAllTasksForUser() {
        logger.debug("Retrieving all tasks for logged user");

        try {
            List<TaskDTO> tasks = taskService.findAllTasksForLoggedUser();
            logger.debug("Retrieved {} tasks for logged user", tasks.size());
            return ResponseEntity.ok().body(tasks); //TO-DO: All ResponseEntity change and put correctly messages
        } catch (Exception e) {
            logger.error("Error retrieving tasks for logged user", e);
            throw e;
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskDTO> getTaskById(@PathVariable Long id) throws ResourceNotFoundException, NotPermissionException { //TO-DO: Change the expcetion to a custom exception
        logger.debug("Retrieving task by ID: {}", id);

        try {
            TaskDTO task = TaskDTO.fromEntity(taskService.getTaskById(id));
            logger.debug("Retrieved task: {} for ID: {}", task.getNameOfTask(), id);
            return ResponseEntity.ok().body(task);
        } catch (ResourceNotFoundException | NotPermissionException e) {
            logger.warn("Task access denied or not found for ID: {}", id, e);
            throw e;
        } catch (Exception e) {
            logger.error("Error retrieving task by ID: {}", id, e);
            throw e;
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteTask(@PathVariable Long id) throws NotPermissionException, ResourceNotFoundException { //TO-DO: Change the expcetion to a custom exception
        logger.info("Deleting task with ID: {}", id);

        try {
            taskService.deleteTaskById(id);
            logger.info("Task deleted successfully with ID: {}", id);
            return ResponseEntity.ok().body("Task deleted successfully");
        } catch (NotPermissionException | ResourceNotFoundException e) {
            logger.warn("Failed to delete task with ID: {} - {}", id, e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error deleting task with ID: {}", id, e);
            throw e;
        }
    }

    @PostMapping("/update/{id}")
    public ResponseEntity<TaskDTO> updateTask(@PathVariable Long id, @RequestBody TaskDTO task) throws ResourceNotFoundException, NotPermissionException { //TO-DO: Change the expcetion to a custom exception
        logger.info("Updating task with ID: {}", id);

        try {
            TaskDTO updatedTask = TaskDTO.fromEntity(taskService.updateTask(id, task));
            logger.info("Task updated successfully with ID: {}", id);
            return ResponseEntity.ok().body(updatedTask);
        } catch (ResourceNotFoundException | NotPermissionException e) {
            logger.warn("Failed to update task with ID: {} - {}", id, e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error updating task with ID: {}", id, e);
            throw e;
        }
    }

    @GetMapping("/events/get")
    public ResponseEntity<List<EventTaskDTO>> getAllEventsForUser() {
        logger.debug("Retrieving all events for logged user");

        try {
            List<EventTaskDTO> events = taskService.getAllEventsForCurrentUser();
            logger.debug("Retrieved {} events for logged user", events.size());
            return ResponseEntity.ok().body(events); //TO-DO: All ResponseEntity change and put correctly messages
        } catch (Exception e) {
            logger.error("Error retrieving events for logged user", e);
            throw e;
        }
    }

    // ===== ACTION ENDPOINTS =====

    @PostMapping("/{taskId}/actions")
    public ResponseEntity<ActionTaskDTO> addActionToTask(@PathVariable Long taskId, @RequestBody ActionTaskDTO actionTaskDTO) 
            throws ResourceNotFoundException, NotPermissionException {
        logger.info("Adding action to task with ID: {}", taskId);

        try {
            ActionTask newAction = taskService.addActionToTask(taskId, actionTaskDTO);
            logger.info("Action added successfully to task with ID: {}", taskId);
            return ResponseEntity.ok().body(ActionTaskDTO.fromEntity(newAction));
        } catch (ResourceNotFoundException | NotPermissionException e) {
            logger.warn("Failed to add action to task with ID: {} - {}", taskId, e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error adding action to task with ID: {}", taskId, e);
            throw e;
        }
    }

    @GetMapping("/{taskId}/actions")
    public ResponseEntity<List<ActionTaskDTO>> getAllActionsForTask(@PathVariable Long taskId) 
            throws ResourceNotFoundException, NotPermissionException {
        logger.debug("Retrieving all actions for task with ID: {}", taskId);

        try {
            List<ActionTask> actions = taskService.getAllActionsForTask(taskId);
            logger.debug("Retrieved {} actions for task with ID: {}", actions.size(), taskId);
            return ResponseEntity.ok().body(actions.stream()
                    .map(ActionTaskDTO::fromEntity)
                    .toList());
        } catch (ResourceNotFoundException | NotPermissionException e) {
            logger.warn("Failed to retrieve actions for task with ID: {} - {}", taskId, e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error retrieving actions for task with ID: {}", taskId, e);
            throw e;
        }
    }

    @PutMapping("/{taskId}/actions/{actionId}")
    public ResponseEntity<ActionTaskDTO> updateActionTask(@PathVariable Long taskId, @PathVariable Long actionId, 
            @RequestBody ActionTaskDTO actionTaskDTO) throws ResourceNotFoundException, NotPermissionException {
        logger.info("Updating action with ID: {} for task with ID: {}", actionId, taskId);

        try {
            ActionTask updatedAction = taskService.updateActionTask(taskId, actionId, actionTaskDTO);
            logger.info("Action updated successfully with ID: {} for task with ID: {}", actionId, taskId);
            return ResponseEntity.ok().body(ActionTaskDTO.fromEntity(updatedAction));
        } catch (ResourceNotFoundException | NotPermissionException e) {
            logger.warn("Failed to update action with ID: {} for task with ID: {} - {}", actionId, taskId, e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error updating action with ID: {} for task with ID: {}", actionId, taskId, e);
            throw e;
        }
    }

    @DeleteMapping("/{taskId}/actions/{actionId}")
    public ResponseEntity<String> deleteActionFromTask(@PathVariable Long taskId, @PathVariable Long actionId) 
            throws ResourceNotFoundException, NotPermissionException {
        logger.info("Deleting action with ID: {} from task with ID: {}", actionId, taskId);

        try {
            taskService.deleteActionFromTask(taskId, actionId);
            logger.info("Action deleted successfully with ID: {} from task with ID: {}", actionId, taskId);
            return ResponseEntity.ok().body("Action deleted successfully");
        } catch (ResourceNotFoundException | NotPermissionException e) {
            logger.warn("Failed to delete action with ID: {} from task with ID: {} - {}", actionId, taskId, e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error deleting action with ID: {} from task with ID: {}", actionId, taskId, e);
            throw e;
        }
    }

}