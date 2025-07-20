package com.taskmanager.application.model.dto;

import com.taskmanager.application.model.entities.ListElement;

public class ListElementDTO {

    private Long id;
    private String name;
    private String description;
    private boolean completed;
    private Long listId;

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

    public boolean isCompleted() {
        return completed;
    }
    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public Long getListId() {
        return listId;
    }    

    public void setListId(Long listId) {
        this.listId = listId;
    }

    public static ListElementDTO fromEntity(ListElement entity) {
        ListElementDTO dto = new ListElementDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getNameOfElement());
        dto.setDescription(entity.getDescriptionOfElement());
        dto.setListId(entity.getId());
        dto.setCompleted(entity.isCompleted());
        dto.setListId(entity.getListTM() != null ? entity.getListTM().getId() : null);
        return dto;
    }

    public static ListElement toEntity(ListElementDTO dto) {
        ListElement entity = new ListElement();
        if (dto.getId() != null) {
            entity.setId(dto.getId());
        }
        entity.setId(dto.getId());
        entity.setNameOfElement(dto.getName());
        entity.setDescriptionOfElement(dto.getDescription());
        entity.setCompleted(dto.isCompleted());
        return entity;
    }
}
