package com.taskmanager.application.model.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import java.util.Date;


@Entity
public class EventTask {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Date startTime;

    private Date endTime;

    @OneToOne(mappedBy = "eventTask")
    private Task task;


    public Long getId() {
        return id;
    }
    public Date getEndTime() {
        return endTime;
    }
    public Date getStartTime() {
        return startTime;
    }
    public Task getTask() {
        return task;
    }
    public void setEndTime(Date endTime) {
        this.endTime = endTime;
    }
    public void setStartTime(Date startTime) {
        this.startTime = startTime;
    }
    public void setTask(Task task) {
        this.task = task;
    }
    public void setId(Long id) {
        this.id = id;
    }
}
