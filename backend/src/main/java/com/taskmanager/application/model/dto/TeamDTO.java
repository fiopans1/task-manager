package com.taskmanager.application.model.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.taskmanager.application.model.entities.Team;

import java.util.Date;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class TeamDTO {

    private Long id;
    private String name;
    private String description;
    private Date creationDate;
    private List<TeamMemberDTO> members;
    private int memberCount;

    public TeamDTO() {
    }

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

    public Date getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(Date creationDate) {
        this.creationDate = creationDate;
    }

    public List<TeamMemberDTO> getMembers() {
        return members;
    }

    public void setMembers(List<TeamMemberDTO> members) {
        this.members = members;
    }

    public int getMemberCount() {
        return memberCount;
    }

    public void setMemberCount(int memberCount) {
        this.memberCount = memberCount;
    }

    public static TeamDTO fromEntity(Team team, boolean includeMembers) {
        TeamDTO dto = new TeamDTO();
        dto.setId(team.getId());
        dto.setName(team.getName());
        dto.setDescription(team.getDescription());
        dto.setCreationDate(team.getCreationDate());
        dto.setMemberCount(team.getMembers() != null ? team.getMembers().size() : 0);
        if (includeMembers && team.getMembers() != null) {
            dto.setMembers(team.getMembers().stream()
                    .map(TeamMemberDTO::fromEntity)
                    .toList());
        }
        return dto;
    }
}
