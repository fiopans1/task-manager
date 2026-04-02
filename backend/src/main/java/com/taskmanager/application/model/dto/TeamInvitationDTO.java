package com.taskmanager.application.model.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.taskmanager.application.model.entities.InvitationStatus;
import com.taskmanager.application.model.entities.TeamInvitation;

import java.util.Date;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class TeamInvitationDTO {

    private Long id;
    private Long teamId;
    private String teamName;
    private String invitedEmail;
    private String invitedUsername;
    private String invitedByUsername;
    private InvitationStatus status;
    private String token;
    private Date createdDate;

    public TeamInvitationDTO() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public String getInvitedEmail() {
        return invitedEmail;
    }

    public void setInvitedEmail(String invitedEmail) {
        this.invitedEmail = invitedEmail;
    }

    public String getInvitedUsername() {
        return invitedUsername;
    }

    public void setInvitedUsername(String invitedUsername) {
        this.invitedUsername = invitedUsername;
    }

    public String getInvitedByUsername() {
        return invitedByUsername;
    }

    public void setInvitedByUsername(String invitedByUsername) {
        this.invitedByUsername = invitedByUsername;
    }

    public InvitationStatus getStatus() {
        return status;
    }

    public void setStatus(InvitationStatus status) {
        this.status = status;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Date getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Date createdDate) {
        this.createdDate = createdDate;
    }

    public static TeamInvitationDTO fromEntity(TeamInvitation invitation) {
        TeamInvitationDTO dto = new TeamInvitationDTO();
        dto.setId(invitation.getId());
        dto.setTeamId(invitation.getTeam().getId());
        dto.setTeamName(invitation.getTeam().getName());
        dto.setInvitedEmail(invitation.getInvitedEmail());
        dto.setInvitedUsername(invitation.getInvitedUsername());
        dto.setInvitedByUsername(invitation.getInvitedBy().getUsername());
        dto.setStatus(invitation.getStatus());
        dto.setToken(invitation.getToken());
        dto.setCreatedDate(invitation.getCreatedDate());
        return dto;
    }
}
