package com.taskmanager.application.model.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class TaskTimerStatusDTO {

    private Long taskId;
    private boolean running;
    private TaskTimeEntryDTO activeEntry;
    private long activeElapsedSeconds;
    private long totalSeconds;
    private long sessionsCount;

    public TaskTimerStatusDTO() {
    }

    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public boolean isRunning() {
        return running;
    }

    public void setRunning(boolean running) {
        this.running = running;
    }

    public TaskTimeEntryDTO getActiveEntry() {
        return activeEntry;
    }

    public void setActiveEntry(TaskTimeEntryDTO activeEntry) {
        this.activeEntry = activeEntry;
    }

    public long getActiveElapsedSeconds() {
        return activeElapsedSeconds;
    }

    public void setActiveElapsedSeconds(long activeElapsedSeconds) {
        this.activeElapsedSeconds = activeElapsedSeconds;
    }

    public long getTotalSeconds() {
        return totalSeconds;
    }

    public void setTotalSeconds(long totalSeconds) {
        this.totalSeconds = totalSeconds;
    }

    public long getSessionsCount() {
        return sessionsCount;
    }

    public void setSessionsCount(long sessionsCount) {
        this.sessionsCount = sessionsCount;
    }
}
