package com.taskmanager.application.model.dto;

public class TaskResumeDTO {

    private Long id;
    private String nameOfTask;
    private Long listId;

    public TaskResumeDTO() {
    }

    public TaskResumeDTO(Long id, String nameOfTask, Long listId) {
        this.id = id;
        this.nameOfTask = nameOfTask;
        this.listId = listId;
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

    public Long getListId() {
        return listId;
    }

    public void setListId(Long listId) {
        this.listId = listId;
    }
}
