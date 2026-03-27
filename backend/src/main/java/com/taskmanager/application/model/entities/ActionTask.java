package com.taskmanager.application.model.entities;



import java.util.Date;

import org.hibernate.annotations.ManyToAny;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class ActionTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String actionName;
    private String actionDescription;
    private ActionType actionType;
    private String user;
    
    @ManyToOne(fetch=FetchType.LAZY)
    private Task task;
    
    private Date actionDate;

    public ActionTask() {
    }

    public Long getId() {
        return id;
    }

    public String getActionName() {
        return actionName;
    }

    public String getActionDescription() {
        return actionDescription;
    }

    public ActionType getActionType() {
        return actionType;
    }

    public String getUser() {
        return user;
    }

    public Task getTask() {
        return task;
    }

    public Date getActionDate() {
        return actionDate;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setActionName(String actionName) {
        this.actionName = actionName;
    }

    public void setActionDescription(String actionDescription) {
        this.actionDescription = actionDescription;
    }

    public void setActionType(ActionType actionType) {
        this.actionType = actionType;
    }

    public void setUser(String user) {
        this.user = user;
    }

    public void setTask(Task task) {
        this.task = task;
    }

    public void setActionDate(Date actionDate) {
        this.actionDate = actionDate;
    }
}
