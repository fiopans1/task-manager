package com.taskmanager.application.service;

import com.taskmanager.application.model.entities.PriorityTask;
import com.taskmanager.application.model.entities.StateTask;
import com.taskmanager.application.model.entities.Task;
import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.model.exceptions.ResourceNotFoundException;
import com.taskmanager.application.respository.TaskRepository;

import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TaskService {

    @Autowired
    private TaskRepository tasksRepository;

    /*Este metodo cuando esté el front bien implementado lo que tiene que hacer es comprobar quien esta
     * logueada, y ver si es admin o no, si no es admin solo ponemos la tarea con el usuario que la creó,
     * si es admin podemos poner la tarea con el usuario que asigna el admin (en este caso mandar el username).
    */
    @Transactional
    public Task createTask(Task task) {
        return tasksRepository.save(task);
    }

    /*En esta y en la siguiente comprobar si el usuario logueado tiene permisos de administrador, sino que solo
    deje borrar tareas que sean de él */    
    @Transactional
    public void deleteTask(Task task) {
        tasksRepository.delete(task);
    }
    @Transactional
    public void deleteTaskById(Long id) {
        tasksRepository.deleteById(id);
    }

    public Task getTaskById(Long id) {
        return tasksRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id " + id));
    }

    @Transactional(readOnly = true)
    public List<Task> findAllTasksByUser(User user) {
        return tasksRepository.findAllByUser(user);
    }

    @Transactional
    public Task changeStateTasks(Long id, StateTask state) {
        Task task = getTaskById(id);
        task.setState(state);
        return tasksRepository.save(task);
    }

    @Transactional
    public void changePriorityTask(Long id, PriorityTask priority) {
        Task task = getTaskById(id);
        task.setPriority(priority);
        tasksRepository.save(task);
    }
}