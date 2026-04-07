package com.taskmanager.application.controller;

import com.taskmanager.application.model.dto.TaskAssignmentHistoryDTO;
import com.taskmanager.application.model.dto.TaskDTO;
import com.taskmanager.application.model.dto.TeamDashboardDTO;
import com.taskmanager.application.model.dto.TeamDTO;
import com.taskmanager.application.model.dto.TeamInvitationDTO;
import com.taskmanager.application.model.dto.TeamMemberDTO;
import com.taskmanager.application.model.entities.PriorityTask;
import com.taskmanager.application.model.entities.StateTask;
import com.taskmanager.application.model.entities.TeamRole;
import com.taskmanager.application.model.exceptions.NotPermissionException;
import com.taskmanager.application.model.exceptions.ResourceNotFoundException;
import com.taskmanager.application.service.MessageService;
import com.taskmanager.application.service.TeamService;

import jakarta.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teams")
public class TeamRestController {

    private static final Logger logger = LoggerFactory.getLogger(TeamRestController.class);

    @Autowired
    private TeamService teamService;

    @Autowired
    private MessageService messageService;

    // ===== TEAM CRUD =====

    @PostMapping("/create")
    public ResponseEntity<TeamDTO> createTeam(@Valid @RequestBody TeamDTO teamDTO) {
        logger.info("Creating team: {}", teamDTO.getName());
        TeamDTO created = teamService.createTeam(teamDTO);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/my-teams")
    public ResponseEntity<List<TeamDTO>> getMyTeams() {
        logger.debug("Retrieving teams for current user");
        List<TeamDTO> teams = teamService.getTeamsForCurrentUser();
        return ResponseEntity.ok(teams);
    }

    @GetMapping("/my-teams/paged")
    public ResponseEntity<Page<TeamDTO>> getMyTeamsPaged(@PageableDefault(size = 50) Pageable pageable) {
        logger.debug("Retrieving paged teams for current user, page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());
        Page<TeamDTO> teams = teamService.getTeamsForCurrentUser(pageable);
        return ResponseEntity.ok(teams);
    }

    @GetMapping("/{teamId}")
    public ResponseEntity<TeamDTO> getTeamById(@PathVariable Long teamId)
            throws ResourceNotFoundException, NotPermissionException {
        logger.debug("Retrieving team with ID: {}", teamId);
        TeamDTO team = teamService.getTeamById(teamId);
        return ResponseEntity.ok(team);
    }

    @PutMapping("/{teamId}")
    public ResponseEntity<TeamDTO> updateTeam(@PathVariable Long teamId, @Valid @RequestBody TeamDTO teamDTO)
            throws ResourceNotFoundException, NotPermissionException {
        logger.info("Updating team with ID: {}", teamId);
        TeamDTO updated = teamService.updateTeam(teamId, teamDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{teamId}")
    public ResponseEntity<String> deleteTeam(@PathVariable Long teamId)
            throws ResourceNotFoundException, NotPermissionException {
        logger.info("Deleting team with ID: {}", teamId);
        teamService.deleteTeam(teamId);
        return ResponseEntity.ok(messageService.getMessage("team.deleted.success"));
    }

    // ===== MEMBER MANAGEMENT =====

    @DeleteMapping("/{teamId}/members/{memberId}")
    public ResponseEntity<String> removeMember(@PathVariable Long teamId, @PathVariable Long memberId)
            throws ResourceNotFoundException, NotPermissionException {
        logger.info("Removing member {} from team {}", memberId, teamId);
        teamService.removeMember(teamId, memberId);
        return ResponseEntity.ok(messageService.getMessage("team.member.removed.success"));
    }

    @PostMapping("/{teamId}/leave")
    public ResponseEntity<String> leaveTeam(@PathVariable Long teamId)
            throws ResourceNotFoundException, NotPermissionException {
        logger.info("User leaving team {}", teamId);
        teamService.leaveTeam(teamId);
        return ResponseEntity.ok(messageService.getMessage("team.left.success"));
    }

    @PutMapping("/{teamId}/members/{memberId}/role")
    public ResponseEntity<TeamMemberDTO> updateMemberRole(@PathVariable Long teamId, @PathVariable Long memberId,
                                                           @RequestBody Map<String, String> body)
            throws ResourceNotFoundException, NotPermissionException {
        String roleStr = body.get("role");
        if (roleStr == null || roleStr.trim().isEmpty()) {
            throw new IllegalArgumentException(messageService.getMessage("team.role.required"));
        }
        TeamRole newRole = TeamRole.valueOf(roleStr);
        logger.info("Updating member {} role to {} in team {}", memberId, newRole, teamId);
        TeamMemberDTO updated = teamService.updateMemberRole(teamId, memberId, newRole);
        return ResponseEntity.ok(updated);
    }

    // ===== TASK ASSIGNMENT =====

    @PostMapping("/{teamId}/tasks/{taskId}/assign")
    public ResponseEntity<TaskDTO> assignTask(@PathVariable Long teamId, @PathVariable Long taskId,
                                               @RequestBody Map<String, String> body)
            throws ResourceNotFoundException, NotPermissionException {
        String targetUsername = body.get("username");
        if (targetUsername == null || targetUsername.trim().isEmpty()) {
            throw new IllegalArgumentException(messageService.getMessage("team.username.required.assignment"));
        }
        logger.info("Assigning task {} to {} in team {}", taskId, targetUsername, teamId);
        TaskDTO task = teamService.assignTask(teamId, taskId, targetUsername);
        return ResponseEntity.ok(task);
    }

    @PostMapping("/{teamId}/tasks/{taskId}/add")
    public ResponseEntity<TaskDTO> addTaskToTeam(@PathVariable Long teamId, @PathVariable Long taskId)
            throws ResourceNotFoundException, NotPermissionException {
        logger.info("Adding task {} to team {}", taskId, teamId);
        TaskDTO task = teamService.addTaskToTeam(teamId, taskId);
        return ResponseEntity.ok(task);
    }

    // ===== DASHBOARD =====

    @GetMapping("/{teamId}/dashboard")
    public ResponseEntity<TeamDashboardDTO> getTeamDashboard(@PathVariable Long teamId)
            throws ResourceNotFoundException, NotPermissionException {
        logger.debug("Retrieving dashboard for team {}", teamId);
        TeamDashboardDTO dashboard = teamService.getTeamDashboard(teamId);
        return ResponseEntity.ok(dashboard);
    }

    // ===== FILTERED TASKS =====

    @GetMapping("/{teamId}/tasks")
    public ResponseEntity<List<TaskDTO>> getTeamTasks(
            @PathVariable Long teamId,
            @RequestParam(required = false) String member,
            @RequestParam(required = false) StateTask state,
            @RequestParam(required = false) PriorityTask priority)
            throws ResourceNotFoundException, NotPermissionException {
        logger.debug("Retrieving filtered tasks for team {}", teamId);
        if (member != null || state != null || priority != null) {
            List<TaskDTO> tasks = teamService.getTeamTasksFiltered(teamId, member, state, priority);
            return ResponseEntity.ok(tasks);
        }
        List<TaskDTO> tasks = teamService.getTeamTasks(teamId);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{teamId}/tasks/paged")
    public ResponseEntity<Page<TaskDTO>> getTeamTasksPaged(
            @PathVariable Long teamId,
            @RequestParam(required = false) String member,
            @RequestParam(required = false) StateTask state,
            @RequestParam(required = false) PriorityTask priority,
            @PageableDefault(size = 50) Pageable pageable)
            throws ResourceNotFoundException, NotPermissionException {
        logger.debug("Retrieving paged filtered tasks for team {}", teamId);
        if (member != null || state != null || priority != null) {
            return ResponseEntity.ok(teamService.getTeamTasksFiltered(teamId, member, state, priority, pageable));
        }
        return ResponseEntity.ok(teamService.getTeamTasks(teamId, pageable));
    }

    // ===== ASSIGNMENT HISTORY =====

    @GetMapping("/{teamId}/assignment-history")
    public ResponseEntity<List<TaskAssignmentHistoryDTO>> getAssignmentHistory(@PathVariable Long teamId)
            throws ResourceNotFoundException, NotPermissionException {
        logger.debug("Retrieving assignment history for team {}", teamId);
        List<TaskAssignmentHistoryDTO> history = teamService.getAssignmentHistory(teamId);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/{teamId}/assignment-history/paged")
    public ResponseEntity<Page<TaskAssignmentHistoryDTO>> getAssignmentHistoryPaged(
            @PathVariable Long teamId,
            @PageableDefault(size = 50) Pageable pageable)
            throws ResourceNotFoundException, NotPermissionException {
        logger.debug("Retrieving paged assignment history for team {}", teamId);
        return ResponseEntity.ok(teamService.getAssignmentHistory(teamId, pageable));
    }

    // ===== INVITATIONS =====

    @PostMapping("/{teamId}/invitations")
    public ResponseEntity<TeamInvitationDTO> createInvitation(@PathVariable Long teamId,
                                                               @RequestBody Map<String, String> body)
            throws ResourceNotFoundException, NotPermissionException {
        String username = body.get("username");
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException(messageService.getMessage("team.username.required"));
        }
        logger.info("Creating invitation for {} to team {}", username, teamId);
        TeamInvitationDTO invitation = teamService.createInvitationByUsername(teamId, username);
        return ResponseEntity.ok(invitation);
    }

    @GetMapping("/{teamId}/invitations")
    public ResponseEntity<List<TeamInvitationDTO>> getTeamInvitations(@PathVariable Long teamId)
            throws ResourceNotFoundException, NotPermissionException {
        logger.debug("Retrieving invitations for team {}", teamId);
        List<TeamInvitationDTO> invitations = teamService.getTeamInvitations(teamId);
        return ResponseEntity.ok(invitations);
    }

    @DeleteMapping("/{teamId}/invitations/{invitationId}")
    public ResponseEntity<String> cancelInvitation(@PathVariable Long teamId, @PathVariable Long invitationId)
            throws ResourceNotFoundException, NotPermissionException {
        logger.info("Cancelling invitation {} in team {}", invitationId, teamId);
        teamService.cancelInvitation(teamId, invitationId);
        return ResponseEntity.ok(messageService.getMessage("team.invitation.cancelled.success"));
    }

    @GetMapping("/invitations/pending")
    public ResponseEntity<List<TeamInvitationDTO>> getMyPendingInvitations() {
        logger.debug("Retrieving pending invitations for current user");
        List<TeamInvitationDTO> invitations = teamService.getMyPendingInvitations();
        return ResponseEntity.ok(invitations);
    }

    @PostMapping("/invitations/{token}/respond")
    public ResponseEntity<TeamDTO> respondToInvitation(@PathVariable String token,
                                                        @RequestBody Map<String, Boolean> body)
            throws ResourceNotFoundException {
        boolean accept = body.getOrDefault("accept", false);
        logger.info("Responding to invitation {} - accept: {}", token, accept);
        TeamDTO team = teamService.respondToInvitation(token, accept);
        return ResponseEntity.ok(team);
    }

    // ===== MENTIONS =====

    @GetMapping("/{teamId}/members/mentions")
    public ResponseEntity<List<TeamMemberDTO>> getMembersForMention(@PathVariable Long teamId)
            throws ResourceNotFoundException, NotPermissionException {
        logger.debug("Retrieving members for mention in team {}", teamId);
        List<TeamMemberDTO> members = teamService.getTeamMembersForMention(teamId);
        return ResponseEntity.ok(members);
    }

    // ===== ADMIN CHECK =====

    @GetMapping("/{teamId}/is-admin")
    public ResponseEntity<Map<String, Boolean>> isCurrentUserAdmin(@PathVariable Long teamId) {
        boolean isAdmin = teamService.isCurrentUserAdminOfTeam(teamId);
        return ResponseEntity.ok(Map.of("isAdmin", isAdmin));
    }

    // ===== ADMIN: Get team summaries for a specific user =====

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TeamDTO>> getTeamsByUserId(@PathVariable Long userId)
            throws ResourceNotFoundException, NotPermissionException {
        logger.debug("Admin retrieving team summaries for user ID: {}", userId);
        List<TeamDTO> teams = teamService.getTeamSummariesByUserId(userId);
        return ResponseEntity.ok(teams);
    }

    @GetMapping("/user/{userId}/paged")
    public ResponseEntity<Page<TeamDTO>> getTeamsByUserIdPaged(
            @PathVariable Long userId,
            @PageableDefault(size = 50) Pageable pageable)
            throws ResourceNotFoundException, NotPermissionException {
        logger.debug("Admin retrieving paged team summaries for user ID: {}", userId);
        return ResponseEntity.ok(teamService.getTeamSummariesByUserId(userId, pageable));
    }
}
