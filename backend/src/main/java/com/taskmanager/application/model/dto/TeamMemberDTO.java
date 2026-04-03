package com.taskmanager.application.model.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.taskmanager.application.model.entities.TeamMember;
import com.taskmanager.application.model.entities.TeamRole;

import java.util.Date;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class TeamMemberDTO {

    private Long id;
    private Long userId;
    private String username;
    private String email;
    private TeamRole role;
    private Date joinedDate;
    private long pendingTasks;

    public TeamMemberDTO() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public TeamRole getRole() {
        return role;
    }

    public void setRole(TeamRole role) {
        this.role = role;
    }

    public Date getJoinedDate() {
        return joinedDate;
    }

    public void setJoinedDate(Date joinedDate) {
        this.joinedDate = joinedDate;
    }

    public long getPendingTasks() {
        return pendingTasks;
    }

    public void setPendingTasks(long pendingTasks) {
        this.pendingTasks = pendingTasks;
    }

    public static TeamMemberDTO fromEntity(TeamMember member) {
        TeamMemberDTO dto = new TeamMemberDTO();
        dto.setId(member.getId());
        dto.setUserId(member.getUser().getId());
        dto.setUsername(member.getUser().getUsername());
        dto.setEmail(member.getUser().getEmail());
        dto.setRole(member.getRole());
        dto.setJoinedDate(member.getJoinedDate());
        return dto;
    }
}
