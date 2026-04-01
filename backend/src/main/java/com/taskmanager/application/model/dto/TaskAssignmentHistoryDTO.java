package com.taskmanager.application.model.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.taskmanager.application.model.entities.TaskAssignmentHistory;

import java.util.Date;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class TaskAssignmentHistoryDTO {

    private Long id;
    private Long taskId;
    private String taskName;
    private String fromUsername;
    private String toUsername;
    private String changedByUsername;
    private Date changedDate;

    public TaskAssignmentHistoryDTO() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public String getTaskName() {
        return taskName;
    }

    public void setTaskName(String taskName) {
        this.taskName = taskName;
    }

    public String getFromUsername() {
        return fromUsername;
    }

    public void setFromUsername(String fromUsername) {
        this.fromUsername = fromUsername;
    }

    public String getToUsername() {
        return toUsername;
    }

    public void setToUsername(String toUsername) {
        this.toUsername = toUsername;
    }

    public String getChangedByUsername() {
        return changedByUsername;
    }

    public void setChangedByUsername(String changedByUsername) {
        this.changedByUsername = changedByUsername;
    }

    public Date getChangedDate() {
        return changedDate;
    }

    public void setChangedDate(Date changedDate) {
        this.changedDate = changedDate;
    }

    public static TaskAssignmentHistoryDTO fromEntity(TaskAssignmentHistory history) {
        TaskAssignmentHistoryDTO dto = new TaskAssignmentHistoryDTO();
        dto.setId(history.getId());
        dto.setTaskId(history.getTask().getId());
        dto.setTaskName(history.getTask().getNameOfTask());
        if (history.getFromUser() != null) {
            dto.setFromUsername(history.getFromUser().getUsername());
        }
        dto.setToUsername(history.getToUser().getUsername());
        dto.setChangedByUsername(history.getChangedBy().getUsername());
        dto.setChangedDate(history.getChangedDate());
        return dto;
    }
}
