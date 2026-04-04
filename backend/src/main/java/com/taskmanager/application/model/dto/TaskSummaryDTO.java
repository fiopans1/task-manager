package com.taskmanager.application.model.dto;

import com.taskmanager.application.model.entities.PriorityTask;
import com.taskmanager.application.model.entities.StateTask;
import com.taskmanager.application.model.entities.Task;

/**
 * Lightweight DTO for listing tasks in admin panel.
 * Only includes fields needed for the summary table, not full task details.
 */
public class TaskSummaryDTO {

    private Long id;
    private String nameOfTask;
    private StateTask state;
    private PriorityTask priority;
    private String listName;
    private String teamName;

    public TaskSummaryDTO() {
    }

    public TaskSummaryDTO(Long id, String nameOfTask, StateTask state, PriorityTask priority, String listName, String teamName) {
        this.id = id;
        this.nameOfTask = nameOfTask;
        this.state = state;
        this.priority = priority;
        this.listName = listName;
        this.teamName = teamName;
    }

    public static TaskSummaryDTO fromEntity(Task task) {
        TaskSummaryDTO dto = new TaskSummaryDTO();
        dto.setId(task.getId());
        dto.setNameOfTask(task.getNameOfTask());
        dto.setState(task.getState());
        dto.setPriority(task.getPriority());
        if (task.getList() != null) {
            dto.setListName(task.getList().getNameOfList());
        }
        if (task.getTeam() != null) {
            dto.setTeamName(task.getTeam().getName());
        }
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNameOfTask() {
        return nameOfTask;
    }

    public void setNameOfTask(String nameOfTask) {
        this.nameOfTask = nameOfTask;
    }

    public StateTask getState() {
        return state;
    }

    public void setState(StateTask state) {
        this.state = state;
    }

    public PriorityTask getPriority() {
        return priority;
    }

    public void setPriority(PriorityTask priority) {
        this.priority = priority;
    }

    public String getListName() {
        return listName;
    }

    public void setListName(String listName) {
        this.listName = listName;
    }

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }
}
