package com.taskmanager.application.model.entities;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;

@Entity
public class ListTM {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String nameOfList;

    @Lob
    @Column(name = "description", nullable = false, length = 10000)
    private String descriptionOfList;

    @Column(nullable = false)
    private String color;

    @OneToMany(mappedBy = "list", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    private List<Task> listTasks = new ArrayList<>();

    @ManyToOne
    private User user;

    public ListTM() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNameOfList() {
        return nameOfList;
    }

    public void setNameOfList(String nameOfList) {
        this.nameOfList = nameOfList;
    }

    public String getDescriptionOfList() {
        return descriptionOfList;
    }

    public void setDescriptionOfList(String descriptionOfList) {
        this.descriptionOfList = descriptionOfList;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public List<Task> getListTasks() {
        return listTasks;
    }

    public void setListTasks(List<Task> listTasks) {
        this.listTasks = listTasks;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void addListTask(Task task) {
        listTasks.add(task);
        task.setList(this);
    }
}
