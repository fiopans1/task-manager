package com.taskmanager.application.model.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import java.util.Date;

@Entity
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(name="name", nullable = false)
    private String nameOfTask;

    @Column(name="description", nullable = false)
    private String descriptionOfTask;

    @Column(nullable = false)
    private StateTask state;
    
    private Date creationDate;

    private Date eventDate;

    @Column(nullable = false)
    private PriorityTask priority;

    @ManyToOne
    private User user;

    public Task() {
    }

    public Date getCreationDate() {
        return creationDate;
    }
    public String getDescriptionOfTask() {
        return descriptionOfTask;
    }
    public Long getId() {
        return id;
    }
    public Date getEventDate() {
        return eventDate;
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
    public User getUser() {
        return user;
    }
    // vscode mark as error when I call this method, I implement, but when compile not be problem
    public void setState(StateTask state) {
        this.state = state;
    }
    public void setPriority(PriorityTask priority) {
        this.priority = priority;
    }
    public void setCreationDate(Date creationDate) {
        this.creationDate = creationDate;
    }
    public void setDescriptionOfTask(String descriptionOfTask) {
        this.descriptionOfTask = descriptionOfTask;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public void setEventDate(Date eventDate) {
        this.eventDate = eventDate;
    }
    public void setNameOfTask(String nameOfTask) {
        this.nameOfTask = nameOfTask;
    }
    public void setUser(User user) {
        this.user = user;
    }

}
