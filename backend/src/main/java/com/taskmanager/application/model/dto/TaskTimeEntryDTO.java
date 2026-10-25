package com.taskmanager.application.model.dto;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.taskmanager.application.model.entities.TaskTimeEntry;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class TaskTimeEntryDTO {

    private Long id;
    private Long taskId;
    private Date startTime;
    private Date endTime;
    private Long durationSeconds;
    private boolean active;
    private String user;

    public TaskTimeEntryDTO() {
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

    public Date getStartTime() {
        return startTime;
    }

    public void setStartTime(Date startTime) {
        this.startTime = startTime;
    }

    public Date getEndTime() {
        return endTime;
    }

    public void setEndTime(Date endTime) {
        this.endTime = endTime;
    }

    public Long getDurationSeconds() {
        return durationSeconds;
    }

    public void setDurationSeconds(Long durationSeconds) {
        this.durationSeconds = durationSeconds;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }

    public static TaskTimeEntryDTO fromEntity(TaskTimeEntry entry) {
        TaskTimeEntryDTO dto = new TaskTimeEntryDTO();
        dto.setId(entry.getId());
        dto.setTaskId(entry.getTask().getId());
        dto.setStartTime(entry.getStartTime());
        dto.setEndTime(entry.getEndTime());
        dto.setDurationSeconds(entry.getDurationSeconds());
        dto.setActive(entry.isActive());
        if (entry.getUser() != null) {
            dto.setUser(entry.getUser().getUsername());
        }
        return dto;
    }
}
