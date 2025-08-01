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
    public FullName(){

    }

    public FullName(String name, String surname1, String surname2) {
        this.name = name;
        this.surname1 = surname1;
        this.surname2 = surname2;
    }

    public String getFullName() {
        StringBuilder fullName = new StringBuilder();
        
        if (name != null && !name.isEmpty()) {
            fullName.append(name);
        }
        
        if (surname1 != null && !surname1.isEmpty()) {
            if (fullName.length() > 0) {
            fullName.append(" ");
            }
            fullName.append(surname1);
        }
        
        if (surname2 != null && !surname2.isEmpty()) {
            if (fullName.length() > 0) {
            fullName.append(" ");
            }
            fullName.append(surname2);
        }
        
        return fullName.toString();
    }

    public static FullName empty() {
        return new FullName("", "", "");
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (!(obj instanceof FullName)) return false;
        FullName other = (FullName) obj;
        return name.equals(other.name) && surname1.equals(other.surname1) && surname2.equals(other.surname2);
    }

    @Override
    public int hashCode() {
        int result = name.hashCode();
        result = 31 * result + surname1.hashCode();
        result = 31 * result + surname2.hashCode();
        return result;
    }

}
