package com.taskmanager.application.service;

import com.taskmanager.application.model.entities.PriorityTask;
import com.taskmanager.application.model.entities.StateTask;
import com.taskmanager.application.model.entities.Task;
import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.model.exceptions.ResourceNotFoundException;
import com.taskmanager.application.respository.TaskRepository;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TaskService {

    @Autowired
    private TaskRepository tasksRepository;

    public Task createTask(Task task) {
        return tasksRepository.save(task);
    }

    public void deleteTask(Task task) {
        tasksRepository.delete(task);
    }

    public void deleteTaskById(Long id) {
        tasksRepository.deleteById(id);
    }

    public Task getTaskById(Long id) {
        return tasksRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id " + id));
    }
    public List<Task> findAllTasksByUserId(User user) {
        return tasksRepository.findAllByUser(user);
    }

    public Task changeStateTasks(Long id, StateTask state) {
        Task task = getTaskById(id);
        task.setState(state);
        return tasksRepository.save(task);
    }

    public void changePriorityTask(Long id, PriorityTask priority) {
        Task task = getTaskById(id);
        task.setPriority(priority);
        tasksRepository.save(task);
    }
}