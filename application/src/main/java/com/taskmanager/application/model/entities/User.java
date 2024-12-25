package com.taskmanager.application.model.entities;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.Date;
import java.util.List;



/**
 *
 * @author fiopans1
 */

@Entity
@Table(name="USER")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String username;

    private String password;

    private int age;

    @Column(unique = true)
    private String email;

    private Date creationDate;

    @OneToMany(mappedBy = "user" , cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Task> tasksForUser;

    @Embedded
    private Direction direction;

    public User(){}

    public int getAge() {
        return age;
    }
    public Date getCreationDate() {
        return creationDate;
    }
    public Direction getDirection() {
        return direction;
    }
    public String getEmail() {
        return email;
    }
    public Long getId() {
        return id;
    }
    public String getPassword() {
        return password;
    }
    public List<Task> getTasksForUser() {
        return tasksForUser;
    }
    public String getUsername() {
        return username;
    }
    public void setAge(int age) {
        this.age = age;
    }
    public void setCreationDate(Date creationDate) {
        this.creationDate = creationDate;
    }
    public void setDirection(Direction direction) {
        this.direction = direction;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    public void setTasksForUser(List<Task> tasksForUser) {
        this.tasksForUser = tasksForUser;
    }
    public void setUsername(String username) {
        this.username = username;
    }







}
