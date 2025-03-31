package com.taskmanager.application.controller;

import com.taskmanager.application.model.dto.EventTaskDTO;
import com.taskmanager.application.model.dto.TaskDTO;
import com.taskmanager.application.model.entities.Task;
import com.taskmanager.application.model.exceptions.NotPermissionException;
import com.taskmanager.application.model.exceptions.ResourceNotFoundException;
import com.taskmanager.application.service.TaskService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;



@RestController
@RequestMapping("/api/tasks")
public class TaskRestController {


    @Autowired
    private TaskService taskService;

    @PostMapping("/create")
    public ResponseEntity<TaskDTO> createTask(@RequestBody TaskDTO task) { //TO-DO: All ResponseEntity change and put correctly messages
        return ResponseEntity.ok().body(TaskDTO.fromEntity(taskService.createTask(task)));
    }

    @GetMapping("/tasks")
    public ResponseEntity<List<TaskDTO>> getAllTasksForUser() {
        return ResponseEntity.ok().body(taskService.findAllTasksForLoggedUser()); //TO-DO: All ResponseEntity change and put correctly messages
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteTask(@PathVariable Long id) throws NotPermissionException, ResourceNotFoundException { //TO-DO: Change the expcetion to a custom exception
        taskService.deleteTaskById(id);
        return ResponseEntity.ok().body("Task deleted successfully");
    }

    @PostMapping("/update/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @RequestBody TaskDTO task) throws ResourceNotFoundException, NotPermissionException { //TO-DO: Change the expcetion to a custom exception
        return ResponseEntity.ok().body(taskService.updateTask(id, task));
    }
    

    @GetMapping("/events/get")
    public ResponseEntity<List<EventTaskDTO>> getAllEventsForUser() {
        return ResponseEntity.ok().body(taskService.getAllEventsForCurrentUser()); //TO-DO: All ResponseEntity change and put correctly messages
    }



}
