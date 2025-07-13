package com.taskmanager.application.model.dto;

import com.taskmanager.application.model.entities.ListTM;

public class ListTMDTO {

    private Long id;
    private String nameOfList;
    private String descriptionOfList;
    private String color;
    private String user;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDescriptionOfList() {
        return descriptionOfList;
    }
    public String getNameOfList() {
        return nameOfList;
    }
    public void setNameOfList(String nameOfList) {
        this.nameOfList = nameOfList;
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

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }

    public static ListTMDTO fromEntity(ListTM list) {
        ListTMDTO dto = new ListTMDTO();
        dto.setId(list.getId());
        dto.setNameOfList(list.getNameOfList());
        dto.setDescriptionOfList(list.getDescriptionOfList());
        dto.setColor(list.getColor());
        dto.setUser(list.getUser().getUsername());
        return dto;
    }

    public static ListTM toEntity(ListTMDTO listDTO) {
        ListTM entity = new ListTM();
        if (listDTO.getId() != null) {
            entity.setId(listDTO.getId());
        }
        entity.setNameOfList(listDTO.getNameOfList());
        entity.setDescriptionOfList(listDTO.getDescriptionOfList());
        entity.setColor(listDTO.getColor());
        return entity;
    }


}
