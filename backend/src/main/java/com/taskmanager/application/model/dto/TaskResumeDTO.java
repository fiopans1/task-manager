package com.taskmanager.application.model.dto;

public class TaskResumeDTO {

    private Long id;
    private String nameOfTask;

    public TaskResumeDTO() {
    }

    public TaskResumeDTO(Long id, String nameOfTask) {
        this.id = id;
        this.nameOfTask = nameOfTask;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNameOfTask() {
        return nameOfTask;
    }

    public void setNameOfTask(String nameOfTask) {
        this.nameOfTask = nameOfTask;
    }
}
