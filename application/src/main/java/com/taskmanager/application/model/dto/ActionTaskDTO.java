package com.taskmanager.application.model.dto;

import java.sql.Date;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.taskmanager.application.model.entities.ActionTask;
import com.taskmanager.application.model.entities.ActionType;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ActionTaskDTO {
    private Long id;
    private String actionName;
    private String actionDescription;
    private ActionType actionType;
    private String user;
    private Date actionDate;
    private Long taskId;

    

    public String getActionName() {
        return actionName;
    }

    public String getActionDescription() {
        return actionDescription;
    }

    public ActionType getActionType() {
        return actionType;
    }

    public String getUser() {
        return user;
    }

    public Date getActionDate() {
        return actionDate;
    }

    public Long getTaskId() {
        return taskId;
    }

    public void setActionName(String actionName) {
        this.actionName = actionName;
    }

    public void setActionDescription(String actionDescription) {
        this.actionDescription = actionDescription;
    }

    public void setActionType(ActionType actionType) {
        this.actionType = actionType;
    }

    public void setUser(String user) {
        this.user = user;
    }

    public void setActionDate(Date actionDate) {
        this.actionDate = actionDate;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public static ActionTask toEntity(ActionTaskDTO dto) {
        ActionTask actionTask = new ActionTask();
        if(dto.getId() != null){
            actionTask.setId(dto.getId());
        }
        actionTask.setActionName(dto.getActionName());
        actionTask.setActionDescription(dto.getActionDescription());
        actionTask.setActionType(dto.getActionType());
        if(dto.getUser() != null){
            actionTask.setUser(dto.getUser());
        }
        if(dto.getActionDate() != null){
            actionTask.setActionDate(dto.getActionDate());
        }
        return actionTask;
    }

    public static ActionTaskDTO fromEntity(ActionTask actionTask) {
        ActionTaskDTO dto = new ActionTaskDTO();
        dto.setId(actionTask.getId());
        dto.setActionName(actionTask.getActionName());
        dto.setActionDescription(actionTask.getActionDescription());
        dto.setActionType(actionTask.getActionType());
        dto.setUser(actionTask.getUser());
        dto.setActionDate(actionTask.getActionDate());
        dto.setTaskId(actionTask.getTask().getId());
        return dto;
    }

}
