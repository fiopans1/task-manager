package com.taskmanager.application.model.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class HomeSummaryDTO {

    private List<TaskDTO> recentTasks;
    private List<EventTaskDTO> nextEvents;
    private long totalTasks;
    private long totalLists;

    public HomeSummaryDTO() {
    }

    public List<TaskDTO> getRecentTasks() {
        return recentTasks;
    }

    public void setRecentTasks(List<TaskDTO> recentTasks) {
        this.recentTasks = recentTasks;
    }

    public List<EventTaskDTO> getNextEvents() {
        return nextEvents;
    }

    public void setNextEvents(List<EventTaskDTO> nextEvents) {
        this.nextEvents = nextEvents;
    }

    public long getTotalTasks() {
        return totalTasks;
    }

    public void setTotalTasks(long totalTasks) {
        this.totalTasks = totalTasks;
    }

    public long getTotalLists() {
        return totalLists;
    }

    public void setTotalLists(long totalLists) {
        this.totalLists = totalLists;
    }
}