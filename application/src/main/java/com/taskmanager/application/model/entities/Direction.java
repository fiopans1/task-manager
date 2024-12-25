package com.taskmanager.application.model.entities;

import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class Direction {

    private String calle;

    private String village;

    private String town;

    private int numberDoor;

    private int postalCode;

    
}
