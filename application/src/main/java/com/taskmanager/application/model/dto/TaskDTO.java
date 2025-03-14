package com.taskmanager.application.model.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.taskmanager.application.model.entities.EventTask;
import com.taskmanager.application.model.entities.PriorityTask;
import com.taskmanager.application.model.entities.StateTask;
import com.taskmanager.application.model.entities.Task;


@JsonInclude(JsonInclude.Include.NON_NULL)
public class TaskDTO {

    private Long id;
    private String nameOfTask;
    private String descriptionOfTask;
    private StateTask state;
    private String user;
    private PriorityTask priority;
    private EventTask eventTask;

    public TaskDTO() {
    }

    public String getDescriptionOfTask() {
        return descriptionOfTask;
    }
    public Long getId() {
        return id;
    }
    public String getNameOfTask() {
        return nameOfTask;
    }
    public PriorityTask getPriority() {
        return priority;
    }
    public StateTask getState() {
        return state;
    }
    public String getUser() {
        return user;
    }
    public EventTask getEventTask() {
        return eventTask;
    }
    public void setDescriptionOfTask(String descriptionOfTask) {
        this.descriptionOfTask = descriptionOfTask;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public void setNameOfTask(String nameOfTask) {
        this.nameOfTask = nameOfTask;
    }
    public void setPriority(PriorityTask priority) {
        this.priority = priority;
    }
    public void setState(StateTask state) {
        this.state = state;
    }
    public void setEventTask(EventTask eventTask) {
        this.eventTask = eventTask;
    }
    public void setUser(String user) {
        this.user = user;
    }
    public static TaskDTO fromEntity(Task task) {
        TaskDTO taskDTO = new TaskDTO();
        taskDTO.setId(task.getId());
        taskDTO.setNameOfTask(task.getNameOfTask());
        taskDTO.setDescriptionOfTask(task.getDescriptionOfTask());
        taskDTO.setState(task.getState());
        taskDTO.setUser(task.getUser().getUsername());
        taskDTO.setPriority(task.getPriority());
        taskDTO.setEventTask(task.getEventTask());
        return taskDTO;
    }

    public static Task toEntity(TaskDTO taskDTO) {
        Task task = new Task();
        task.setId(taskDTO.getId());
        task.setNameOfTask(taskDTO.getNameOfTask());
        task.setDescriptionOfTask(taskDTO.getDescriptionOfTask());
        task.setState(taskDTO.getState());
        task.setPriority(taskDTO.getPriority());
        task.setEventTask(taskDTO.getEventTask());
        return task;
    }
    

}
