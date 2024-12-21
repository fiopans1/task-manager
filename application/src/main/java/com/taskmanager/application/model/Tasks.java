package com.taskmanager.application.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import java.util.Date;
import lombok.Data;





@Entity
@Data
public class Tasks {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(name="name")
    private String nameOfTask;

    @Column(name="description")
    private String descriptionOfTask;

    private StateTask completed;
    
    private Date creationDate;

    private Date limitDate;

    private PriorityTask priority;

    @ManyToOne
    private User user;

    public Tasks(){}

}
