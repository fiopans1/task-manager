package com.taskmanager.application.model.entities;

import jakarta.persistence.Embeddable;

@Embeddable
public class FullName {
    
    private String name;

    private String surname1;

    private String surname2;

    public String getName() {
        return name;
    }
    public String getSurname1() {
        return surname1;
    }
    public void setName(String name) {
        this.name = name;
    }
    public void setSurname1(String surname1) {
        this.surname1 = surname1;
    }
    public String getSurname2() {
        return surname2;
    }
    public void setSurname2(String surname2) {
        this.surname2 = surname2;
    }

}
