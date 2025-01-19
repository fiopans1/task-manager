package com.taskmanager.application.service;

import com.taskmanager.application.model.entities.PriorityTask;
import com.taskmanager.application.model.entities.StateTask;
import com.taskmanager.application.model.entities.Task;
import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.model.exceptions.NotPermissionException;
import com.taskmanager.application.model.exceptions.ResourceNotFoundException;
import com.taskmanager.application.respository.TaskRepository;

import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TaskService {

    @Autowired
    private TaskRepository tasksRepository;
    
    @Autowired
    private AuthService authService;

    /*Este metodo cuando esté el front bien implementado lo que tiene que hacer es comprobar quien esta
     * logueada, y ver si es admin o no, si no es admin solo ponemos la tarea con el usuario que la creó,
     * si es admin podemos poner la tarea con el usuario que asigna el admin (en este caso mandar el username).
    */
    @Transactional
    public Task createTask(Task task) {
        User user = authService.getCurrentUser();

        task.setCreationDate(new Date());
        if(task.getUser()!=null && authService.hasRole("ADMIN")){
            return tasksRepository.save(task);
        }else{
            task.setUser(user);
            return tasksRepository.save(task);
        }
    }

    @Transactional(readOnly = true)
    public List<Task> findAllTasksForLoggedUser(){
        User user = authService.getCurrentUser();
        return tasksRepository.findAllByUser(user);
    }

    @Transactional(readOnly = true)
    public List<Task> findAllTasksByUser(User user) {
        return tasksRepository.findAllByUser(user);
    }
   
    @Transactional
    public void deleteTask(Task task) {
        if(authService.hasRole("ADMIN") || task.getUser().getUsername().equals(authService.getCurrentUsername())){
            tasksRepository.delete(task);
        }
    }
    @Transactional
    public void deleteTaskById(Long id) throws NotPermissionException, ResourceNotFoundException {
        Task task = tasksRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id " + id));
        if(authService.hasRole("ADMIN") || task.getUser().getUsername().equals(authService.getCurrentUsername())){
            tasksRepository.deleteById(id);
        }else{
            throw new NotPermissionException("You don't have permission to delete this task");
        }
    }

    public Task getTaskById(Long id) throws ResourceNotFoundException {
        return tasksRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id " + id));
    }



}