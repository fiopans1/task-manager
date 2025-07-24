package com.taskmanager.application.model.entities;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;


@Entity
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(name="name", nullable = false)
    private String nameOfTask;

    @Lob
    @Column(name="description", nullable = false, length = 10000)
    private String descriptionOfTask;

    @Column(nullable = false)
    private StateTask state;
    
    private Date creationDate;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "event_id", nullable = true)
    private EventTask eventTask;

    @Column(nullable = false)
    private PriorityTask priority;

    @ManyToOne
    private User user;

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ActionTask> actions = new ArrayList<>();

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
    public EventTask getEventTask() {
        return eventTask;
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
    public void setEventTask(EventTask eventTask) {
        this.eventTask = eventTask;
        if (eventTask != null) {
            eventTask.setTask(this);
        }
    }
    public void setNameOfTask(String nameOfTask) {
        this.nameOfTask = nameOfTask;
    }
    public void setUser(User user) {
        this.user = user;
    }

}
