package com.taskmanager.application.controller;

import com.taskmanager.application.model.entities.Task;
import com.taskmanager.application.model.exceptions.NotPermissionException;
import com.taskmanager.application.model.exceptions.ResourceNotFoundException;
import com.taskmanager.application.service.TaskService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<Task> createTask(@RequestBody Task task) { //TO-DO: All ResponseEntity change and put correctly messages
        return ResponseEntity.ok().body(taskService.createTask(task));
    }

    @GetMapping("/my-tasks")
    public ResponseEntity<List<Task>> getAllTasksForUser() {
        return ResponseEntity.ok().body(taskService.findAllTasksForLoggedUser());
    }

    @PostMapping("/{id}/delete")
    public ResponseEntity<String> deleteTask(@PathVariable Long id) throws NotPermissionException, ResourceNotFoundException { //TO-DO: Change the expcetion to a custom exception
        taskService.deleteTaskById(id);
        return ResponseEntity.ok().body("Task deleted successfully");
    }
    



}
