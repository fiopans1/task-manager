package com.taskmanager.application.model.dto;

import com.taskmanager.application.model.entities.ListTM;

public class ListTMDTO {

    private Long id;
    private String name;
    private String description;
    private String color;
    private String user;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }

    public static ListTMDTO fromEntity(ListTM list) {
        ListTMDTO dto = new ListTMDTO();
        dto.setId(list.getId());
        dto.setName(list.getNameOfList());
        dto.setDescription(list.getDescriptionOfList());
        dto.setColor(list.getColor());
        dto.setUser(list.getUser().getUsername());
        return dto;
    }

    public static ListTM toEntity(ListTMDTO listDTO) {
        ListTM entity = new ListTM();
        entity.setId(listDTO.getId());
        entity.setNameOfList(listDTO.getName());
        entity.setDescriptionOfList(listDTO.getDescription());
        entity.setColor(listDTO.getColor());
        return entity;
    }


}
