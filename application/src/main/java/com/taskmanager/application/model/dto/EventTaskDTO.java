package com.taskmanager.application.model.dto;

import java.util.Date;

public class EventTaskDTO {

    private Long id;
    private String nameOfTask;
    private Date startTime;
    private Date endTime;


    public EventTaskDTO() {
    }

    public EventTaskDTO(Long id, String nameOfTask, Date startTime, Date endTime) {
        this.id = id;
        this.nameOfTask = nameOfTask;
        this.startTime = startTime;
        this.endTime = endTime;
    }
    
    public Long getId() {
        return id;
    }
    public String getNameOfTask() {
        return nameOfTask;
    }
    public Date getStartTime() {
        return startTime;
    }
    public Date getEndTime() {
        return endTime;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public void setNameOfTask(String nameOfTask) {
        this.nameOfTask = nameOfTask;
    }
    public void setStartTime(Date startTime) {
        this.startTime = startTime;
    }
    public void setEndTime(Date endTime) {
        this.endTime = endTime;
    }
}

