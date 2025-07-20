package com.taskmanager.application.model.dto;

import java.util.List;
import java.util.stream.Collectors;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.taskmanager.application.model.entities.ListElement;
import com.taskmanager.application.model.entities.ListTM;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ListTMDTO {

    private Long id;
    private String nameOfList;
    private String descriptionOfList;
    private String color;
    private String user;
    private List<ListElementDTO> listElements;
    private int totalElements = 0;
    private int completedElements = 0;

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

    public List<ListElementDTO> getListElements() {
        return listElements;
    }

    public void setListElements(List<ListElementDTO> listElements) {
        this.listElements = listElements;
    }

    public int getTotalElements() {
        return totalElements;
    }

    public void setTotalElements(int totalElements) {
        this.totalElements = totalElements;
    }

    public int getCompletedElements() {
        return completedElements;
    }

    public void setCompletedElements(int completedElements) {
        this.completedElements = completedElements;
    }

    public static ListTMDTO fromEntity(ListTM list, boolean includeElements) {
        ListTMDTO dto = new ListTMDTO();
        dto.setId(list.getId());
        dto.setNameOfList(list.getNameOfList());
        dto.setDescriptionOfList(list.getDescriptionOfList());
        dto.setColor(list.getColor());
        dto.setUser(list.getUser().getUsername());
        dto.setTotalElements(list.getListElements().size());
        dto.setCompletedElements((int) list.getListElements().stream().filter(ListElement::isCompleted).count());
        if (includeElements) {
            dto.setListElements(list.getListElements().stream().map(element -> ListElementDTO.fromEntity(element)).toList());
        }
        return dto;
    }

    public static ListTM toEntity(ListTMDTO listDTO, boolean includeElements) {
        ListTM entity = new ListTM();
        if (listDTO.getId() != null) {
            entity.setId(listDTO.getId());
        }
        entity.setNameOfList(listDTO.getNameOfList());
        entity.setDescriptionOfList(listDTO.getDescriptionOfList());
        entity.setColor(listDTO.getColor());
        if (includeElements && listDTO.getListElements() != null) {
            entity.setListElements(listDTO.getListElements().stream().map(ListElementDTO::toEntity).toList());
        }
        return entity;
    }

}
