package com.taskmanager.application.model.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;

@Entity
public class ListElement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="name", nullable = false)
    private String nameOfElement;
    
    @Lob
    @Column(name="description", nullable = false, length = 10000)
    private String descriptionOfElement;

    private boolean completed;

    @ManyToOne(fetch=FetchType.LAZY)
    private ListTM listTM;

    public ListElement() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNameOfElement() {
        return nameOfElement;
    }

    public void setNameOfElement(String nameOfElement) {
        this.nameOfElement = nameOfElement;
    }

    public String getDescriptionOfElement() {
        return descriptionOfElement;
    }

    public void setDescriptionOfElement(String descriptionOfElement) {
        this.descriptionOfElement = descriptionOfElement;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }
    
    public void setListTM(ListTM listTM) {
        this.listTM = listTM;
    }
    
    public ListTM getListTM() {
        return listTM;
    }

    public boolean isCompleted() {
        return completed;
    }
    

}
