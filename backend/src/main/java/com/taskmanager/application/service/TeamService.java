package com.taskmanager.application.service;

import com.taskmanager.application.model.dto.TaskAssignmentHistoryDTO;
import com.taskmanager.application.model.dto.TaskDTO;
import com.taskmanager.application.model.dto.TeamDashboardDTO;
import com.taskmanager.application.model.dto.TeamDTO;
import com.taskmanager.application.model.dto.TeamInvitationDTO;
import com.taskmanager.application.model.dto.TeamMemberDTO;
import com.taskmanager.application.model.entities.ActionTask;
import com.taskmanager.application.model.entities.ActionType;
import com.taskmanager.application.model.entities.InvitationStatus;
import com.taskmanager.application.model.entities.PriorityTask;
import com.taskmanager.application.model.entities.StateTask;
import com.taskmanager.application.model.entities.Task;
import com.taskmanager.application.model.entities.TaskAssignmentHistory;
import com.taskmanager.application.model.entities.Team;
import com.taskmanager.application.model.entities.TeamInvitation;
import com.taskmanager.application.model.entities.TeamMember;
import com.taskmanager.application.model.entities.TeamRole;
import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.model.exceptions.NotPermissionException;
import com.taskmanager.application.model.exceptions.ResourceNotFoundException;
import com.taskmanager.application.respository.ActionTaskRepository;
import com.taskmanager.application.respository.TaskAssignmentHistoryRepository;
import com.taskmanager.application.respository.TaskRepository;
import com.taskmanager.application.respository.TeamInvitationRepository;
import com.taskmanager.application.respository.TeamMemberRepository;
import com.taskmanager.application.respository.TeamRepository;
import com.taskmanager.application.respository.UserRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class TeamService {

    private static final Logger logger = LoggerFactory.getLogger(TeamService.class);

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private TeamMemberRepository teamMemberRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private TaskAssignmentHistoryRepository assignmentHistoryRepository;

    @Autowired
    private ActionTaskRepository actionTaskRepository;

    @Autowired
    private TeamInvitationRepository invitationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthService authService;

    // ===== TEAM CRUD =====

    @Transactional
    public TeamDTO createTeam(TeamDTO teamDTO) {
        logger.info("Creating team: {}", teamDTO.getName());
        User currentUser = authService.getCurrentUser();

        Team team = new Team();
        team.setName(teamDTO.getName());
        team.setDescription(teamDTO.getDescription());
        team.setCreationDate(new Date());

        team = teamRepository.save(team);

        // Add creator as ADMIN
        TeamMember member = new TeamMember();
        member.setUser(currentUser);
        member.setRole(TeamRole.ADMIN);
        member.setJoinedDate(new Date());
        team.addMember(member);
        teamMemberRepository.save(member);

        logger.info("Team created with ID: {} by user: {}", team.getId(), currentUser.getUsername());
        return TeamDTO.fromEntity(team, true);
    }

    @Transactional(readOnly = true)
    public List<TeamDTO> getTeamsForCurrentUser() {
        User currentUser = authService.getCurrentUser();
        List<Team> teams = teamRepository.findAllByMemberUser(currentUser);
        return teams.stream()
                .map(t -> TeamDTO.fromEntity(t, false))
                .toList();
    }

    @Transactional(readOnly = true)
    public TeamDTO getTeamById(Long teamId) throws ResourceNotFoundException, NotPermissionException {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id " + teamId));
        validateMembership(team);
        return TeamDTO.fromEntity(team, true);
    }

    @Transactional
    public TeamDTO updateTeam(Long teamId, TeamDTO teamDTO) throws ResourceNotFoundException, NotPermissionException {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id " + teamId));
        validateAdminRole(team);

        team.setName(teamDTO.getName());
        team.setDescription(teamDTO.getDescription());
        team = teamRepository.save(team);

        logger.info("Team updated with ID: {}", teamId);
        return TeamDTO.fromEntity(team, true);
    }

    @Transactional
    public void deleteTeam(Long teamId) throws ResourceNotFoundException, NotPermissionException {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id " + teamId));
        validateAdminRole(team);

        // Remove team reference from tasks
        List<Task> teamTasks = taskRepository.findAllByTeam(team);
        for (Task task : teamTasks) {
            task.setTeam(null);
        }
        taskRepository.saveAll(teamTasks);

        teamRepository.delete(team);
        logger.info("Team deleted with ID: {}", teamId);
    }

    // ===== MEMBER MANAGEMENT =====

    @Transactional
    public TeamMemberDTO addMemberByUsername(Long teamId, String username, TeamRole role)
            throws ResourceNotFoundException, NotPermissionException {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id " + teamId));
        validateAdminRole(team);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        if (teamMemberRepository.existsByTeamAndUser(team, user)) {
            throw new NotPermissionException("User is already a member of this team");
        }

        TeamMember member = new TeamMember();
        member.setUser(user);
        member.setRole(role != null ? role : TeamRole.MEMBER);
        member.setJoinedDate(new Date());
        team.addMember(member);
        teamMemberRepository.save(member);

        logger.info("Member {} added to team {} with role {}", username, teamId, member.getRole());
        return TeamMemberDTO.fromEntity(member);
    }

    @Transactional
    public void removeMember(Long teamId, Long memberId) throws ResourceNotFoundException, NotPermissionException {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id " + teamId));
        validateAdminRole(team);

        TeamMember member = teamMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with id " + memberId));

        if (!member.getTeam().getId().equals(teamId)) {
            throw new NotPermissionException("Member does not belong to this team");
        }

        // Prevent removing the last admin
        if (member.getRole() == TeamRole.ADMIN) {
            long adminCount = team.getMembers().stream()
                    .filter(m -> m.getRole() == TeamRole.ADMIN)
                    .count();
            if (adminCount <= 1) {
                throw new NotPermissionException("Cannot remove the last admin from the team");
            }
        }

        // Remove team reference from this member's tasks
        List<Task> memberTasks = taskRepository.findAllByTeamAndUser(team, member.getUser());
        for (Task task : memberTasks) {
            task.setTeam(null);
        }
        taskRepository.saveAll(memberTasks);

        team.removeMember(member);
        teamMemberRepository.delete(member);
        logger.info("Member {} removed from team {}", memberId, teamId);
    }

    @Transactional
    public void leaveTeam(Long teamId) throws ResourceNotFoundException, NotPermissionException {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id " + teamId));
        User currentUser = authService.getCurrentUser();

        TeamMember member = teamMemberRepository.findByTeamAndUser(team, currentUser)
                .orElseThrow(() -> new NotPermissionException("You are not a member of this team"));

        // Prevent the last admin from leaving
        if (member.getRole() == TeamRole.ADMIN) {
            long adminCount = team.getMembers().stream()
                    .filter(m -> m.getRole() == TeamRole.ADMIN)
                    .count();
            if (adminCount <= 1) {
                throw new NotPermissionException("Cannot leave the team as the last admin. Promote another member first.");
            }
        }

        // Remove team reference from this member's tasks
        List<Task> memberTasks = taskRepository.findAllByTeamAndUser(team, currentUser);
        for (Task task : memberTasks) {
            task.setTeam(null);
        }
        taskRepository.saveAll(memberTasks);

        team.removeMember(member);
        teamMemberRepository.delete(member);
        logger.info("User {} left team {}", currentUser.getUsername(), teamId);
    }

    @Transactional
    public TeamMemberDTO updateMemberRole(Long teamId, Long memberId, TeamRole newRole)
            throws ResourceNotFoundException, NotPermissionException {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id " + teamId));
        validateAdminRole(team);

        TeamMember member = teamMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with id " + memberId));

        if (!member.getTeam().getId().equals(teamId)) {
            throw new NotPermissionException("Member does not belong to this team");
        }

        // Prevent demoting the last admin
        if (member.getRole() == TeamRole.ADMIN && newRole == TeamRole.MEMBER) {
            long adminCount = team.getMembers().stream()
                    .filter(m -> m.getRole() == TeamRole.ADMIN)
                    .count();
            if (adminCount <= 1) {
                throw new NotPermissionException("Cannot demote the last admin");
            }
        }

        member.setRole(newRole);
        teamMemberRepository.save(member);
        logger.info("Member {} role updated to {} in team {}", memberId, newRole, teamId);
        return TeamMemberDTO.fromEntity(member);
    }

    // ===== TASK ASSIGNMENT =====

    @Transactional
    public TaskDTO assignTask(Long teamId, Long taskId, String targetUsername)
            throws ResourceNotFoundException, NotPermissionException {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id " + teamId));
        User currentUser = authService.getCurrentUser();
        TeamMember currentMember = validateMembership(team);

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id " + taskId));

        User targetUser = userRepository.findByUsername(targetUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + targetUsername));

        // Validate target is a team member
        if (!teamMemberRepository.existsByTeamAndUser(team, targetUser)) {
            throw new NotPermissionException("Target user is not a member of this team");
        }

        // RBAC: Only ADMIN can reassign tasks of other members
        if (currentMember.getRole() != TeamRole.ADMIN) {
            // Members can only assign tasks to themselves
            if (!targetUser.getId().equals(currentUser.getId())) {
                throw new NotPermissionException("Only team admins can assign tasks to other members");
            }
            // Members can only reassign their own tasks
            if (!task.getUser().getId().equals(currentUser.getId())) {
                throw new NotPermissionException("You can only reassign your own tasks");
            }
        }

        // Record assignment history
        User previousUser = task.getUser();
        TaskAssignmentHistory history = new TaskAssignmentHistory();
        history.setTask(task);
        history.setFromUser(previousUser);
        history.setToUser(targetUser);
        history.setChangedBy(currentUser);
        history.setTeam(team);
        history.setChangedDate(new Date());
        assignmentHistoryRepository.save(history);

        // Remove from list if in one (task is moving to another user)
        if (task.getList() != null) {
            task.setList(null);
        }

        // Change task ownership — task now belongs to the target user
        task.setUser(targetUser);
        task.setTeam(team);
        task = taskRepository.save(task);

        // Create action comment recording the reassignment
        ActionTask action = new ActionTask();
        action.setActionName("Task Reassigned");
        if (previousUser != null) {
            action.setActionDescription("Task reassigned from @" + previousUser.getUsername()
                    + " to @" + targetUser.getUsername()
                    + " by @" + currentUser.getUsername()
                    + " in team " + team.getName());
        } else {
            action.setActionDescription("Task assigned to @" + targetUser.getUsername()
                    + " by @" + currentUser.getUsername()
                    + " in team " + team.getName());
        }
        action.setActionType(ActionType.COMMENT);
        action.setUser(currentUser.getUsername());
        action.setTask(task);
        action.setActionDate(new Date());
        actionTaskRepository.save(action);

        logger.info("Task {} assigned to {} in team {} by {}",
                taskId, targetUsername, teamId, currentUser.getUsername());
        return TaskDTO.fromEntity(task);
    }

    @Transactional
    public TaskDTO addTaskToTeam(Long teamId, Long taskId)
            throws ResourceNotFoundException, NotPermissionException {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id " + teamId));
        validateMembership(team);

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id " + taskId));

        User currentUser = authService.getCurrentUser();
        // Only task owner can add their task to a team
        if (!task.getUser().getId().equals(currentUser.getId())) {
            throw new NotPermissionException("You can only add your own tasks to a team");
        }

        task.setTeam(team);
        task = taskRepository.save(task);

        // Record initial assignment
        TaskAssignmentHistory history = new TaskAssignmentHistory();
        history.setTask(task);
        history.setFromUser(null);
        history.setToUser(currentUser);
        history.setChangedBy(currentUser);
        history.setTeam(team);
        history.setChangedDate(new Date());
        assignmentHistoryRepository.save(history);

        // Create action comment recording the task addition
        ActionTask action = new ActionTask();
        action.setActionName("Task Added to Team");
        action.setActionDescription("Task added to team " + team.getName()
                + " by @" + currentUser.getUsername());
        action.setActionType(ActionType.COMMENT);
        action.setUser(currentUser.getUsername());
        action.setTask(task);
        action.setActionDate(new Date());
        actionTaskRepository.save(action);

        logger.info("Task {} added to team {} by {}", taskId, teamId, currentUser.getUsername());
        return TaskDTO.fromEntity(task);
    }

    // ===== TEAM DASHBOARD =====

    @Transactional(readOnly = true)
    public TeamDashboardDTO getTeamDashboard(Long teamId) throws ResourceNotFoundException, NotPermissionException {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id " + teamId));
        validateMembership(team);

        TeamDashboardDTO dashboard = new TeamDashboardDTO();
        dashboard.setTeamId(team.getId());
        dashboard.setTeamName(team.getName());

        // Get members with pending task counts
        List<TeamMemberDTO> memberDTOs = team.getMembers().stream().map(member -> {
            TeamMemberDTO dto = TeamMemberDTO.fromEntity(member);
            long pending = taskRepository.countPendingByTeamAndUser(team, member.getUser(),
                    Arrays.asList(StateTask.COMPLETED, StateTask.CANCELLED));
            dto.setPendingTasks(pending);
            return dto;
        }).toList();
        dashboard.setMembers(memberDTOs);

        dashboard.setTotalTasks(taskRepository.countByTeam(team));
        dashboard.setCompletedTasks(taskRepository.countByTeamAndState(team, StateTask.COMPLETED));
        dashboard.setInProgressTasks(taskRepository.countByTeamAndState(team, StateTask.IN_PROGRESS));
        long newTasks = taskRepository.countByTeamAndState(team, StateTask.NEW);
        long pausedTasks = taskRepository.countByTeamAndState(team, StateTask.PAUSSED);
        dashboard.setPendingTasks(newTasks + pausedTasks);

        return dashboard;
    }

    // ===== FILTERED TASKS =====

    @Transactional(readOnly = true)
    public List<TaskDTO> getTeamTasksFiltered(Long teamId, String ownerUsername,
                                              StateTask state, PriorityTask priority)
            throws ResourceNotFoundException, NotPermissionException {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id " + teamId));
        TeamMember currentMember = validateMembership(team);

        User ownerUser = null;
        if (ownerUsername != null && !ownerUsername.isEmpty()) {
            if (currentMember.getRole() != TeamRole.ADMIN) {
                // Members can only see their own tasks
                User currentUser = authService.getCurrentUser();
                if (!ownerUsername.equals(currentUser.getUsername())) {
                    throw new NotPermissionException("You can only filter your own tasks");
                }
            }
            ownerUser = userRepository.findByUsername(ownerUsername)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + ownerUsername));
        } else if (currentMember.getRole() != TeamRole.ADMIN) {
            // Non-admins without owner filter should only see their own tasks
            ownerUser = authService.getCurrentUser();
        }

        List<Task> tasks = taskRepository.findTeamTasksFiltered(team, ownerUser, state, priority);
        return tasks.stream().map(TaskDTO::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public List<TaskDTO> getTeamTasks(Long teamId) throws ResourceNotFoundException, NotPermissionException {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id " + teamId));
        TeamMember currentMember = validateMembership(team);

        List<Task> tasks;
        if (currentMember.getRole() == TeamRole.ADMIN) {
            tasks = taskRepository.findAllByTeam(team);
        } else {
            // Non-admins only see their own tasks
            User currentUser = authService.getCurrentUser();
            tasks = taskRepository.findAllByTeamAndUser(team, currentUser);
        }
        return tasks.stream().map(TaskDTO::fromEntity).toList();
    }

    // ===== ASSIGNMENT HISTORY =====

    @Transactional(readOnly = true)
    public List<TaskAssignmentHistoryDTO> getAssignmentHistory(Long teamId)
            throws ResourceNotFoundException, NotPermissionException {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id " + teamId));
        validateAdminRole(team);

        return assignmentHistoryRepository.findAllByTeamOrderByChangedDateDesc(team)
                .stream()
                .map(TaskAssignmentHistoryDTO::fromEntity)
                .toList();
    }

    // ===== INVITATIONS =====

    @Transactional
    public TeamInvitationDTO createInvitationByUsername(Long teamId, String username)
            throws ResourceNotFoundException, NotPermissionException {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id " + teamId));
        validateAdminRole(team);

        User currentUser = authService.getCurrentUser();

        User targetUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        // Check if user is already a member
        if (teamMemberRepository.existsByTeamAndUser(team, targetUser)) {
            throw new RuntimeException("User is already a member of this team");
        }

        TeamInvitation invitation = new TeamInvitation();
        invitation.setTeam(team);
        invitation.setInvitedUsername(username);
        invitation.setInvitedEmail(targetUser.getEmail());
        invitation.setInvitedBy(currentUser);
        invitation.setStatus(InvitationStatus.PENDING);
        invitation.setToken(UUID.randomUUID().toString());
        invitation.setCreatedDate(new Date());
        invitation = invitationRepository.save(invitation);

        logger.info("Invitation created for user {} to team {} by {}", username, teamId, currentUser.getUsername());
        return TeamInvitationDTO.fromEntity(invitation);
    }

    @Transactional(readOnly = true)
    public List<TeamInvitationDTO> getTeamInvitations(Long teamId)
            throws ResourceNotFoundException, NotPermissionException {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id " + teamId));
        validateAdminRole(team);

        return invitationRepository.findAllByTeamAndStatus(team, InvitationStatus.PENDING).stream()
                .map(TeamInvitationDTO::fromEntity)
                .toList();
    }

    @Transactional
    public void cancelInvitation(Long teamId, Long invitationId)
            throws ResourceNotFoundException, NotPermissionException {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id " + teamId));
        validateAdminRole(team);

        TeamInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found with id " + invitationId));

        if (!invitation.getTeam().getId().equals(teamId)) {
            throw new NotPermissionException("Invitation does not belong to this team");
        }

        invitationRepository.delete(invitation);
        logger.info("Invitation {} cancelled in team {} by admin", invitationId, teamId);
    }

    @Transactional(readOnly = true)
    public List<TeamInvitationDTO> getMyPendingInvitations() {
        User currentUser = authService.getCurrentUser();
        // Find invitations by username or email
        List<TeamInvitation> byUsername = invitationRepository
                .findAllByInvitedUsernameAndStatus(currentUser.getUsername(), InvitationStatus.PENDING);
        List<TeamInvitation> byEmail = invitationRepository
                .findAllByInvitedEmailAndStatus(currentUser.getEmail(), InvitationStatus.PENDING);

        // Merge and deduplicate
        Set<Long> seen = new HashSet<>();
        List<TeamInvitation> all = new ArrayList<>();
        for (TeamInvitation inv : byUsername) {
            if (seen.add(inv.getId())) all.add(inv);
        }
        for (TeamInvitation inv : byEmail) {
            if (seen.add(inv.getId())) all.add(inv);
        }

        return all.stream()
                .map(TeamInvitationDTO::fromEntity)
                .toList();
    }

    @Transactional
    public TeamDTO respondToInvitation(String token, boolean accept)
            throws ResourceNotFoundException {
        TeamInvitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new RuntimeException("Invitation has already been responded to");
        }

        User currentUser = authService.getCurrentUser();
        invitation.setRespondedDate(new Date());

        if (accept) {
            invitation.setStatus(InvitationStatus.ACCEPTED);

            // Add user to team
            if (!teamMemberRepository.existsByTeamAndUser(invitation.getTeam(), currentUser)) {
                TeamMember member = new TeamMember();
                member.setUser(currentUser);
                member.setRole(TeamRole.MEMBER);
                member.setJoinedDate(new Date());
                invitation.getTeam().addMember(member);
                teamMemberRepository.save(member);
            }

            logger.info("User {} accepted invitation to team {}", currentUser.getUsername(), invitation.getTeam().getId());
        } else {
            invitation.setStatus(InvitationStatus.REJECTED);
            logger.info("User {} rejected invitation to team {}", currentUser.getUsername(), invitation.getTeam().getId());
        }

        invitationRepository.save(invitation);
        return TeamDTO.fromEntity(invitation.getTeam(), true);
    }

    // ===== MENTIONS =====

    @Transactional(readOnly = true)
    public List<TeamMemberDTO> getTeamMembersForMention(Long teamId)
            throws ResourceNotFoundException, NotPermissionException {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id " + teamId));
        validateMembership(team);

        return team.getMembers().stream()
                .map(TeamMemberDTO::fromEntity)
                .toList();
    }

    // ===== RBAC HELPERS =====

    private TeamMember validateMembership(Team team) throws NotPermissionException {
        User currentUser = authService.getCurrentUser();
        return teamMemberRepository.findByTeamAndUser(team, currentUser)
                .orElseThrow(() -> new NotPermissionException("You are not a member of this team"));
    }

    private TeamMember validateAdminRole(Team team) throws NotPermissionException {
        // Global ADMIN role bypasses team membership check — they can manage any team
        if (authService.hasRole("ROLE_ADMIN")) {
            User currentUser = authService.getCurrentUser();
            // Return actual membership if exists, otherwise return null (global admin not in team)
            return teamMemberRepository.findByTeamAndUser(team, currentUser).orElse(null);
        }
        TeamMember member = validateMembership(team);
        if (member.getRole() != TeamRole.ADMIN) {
            throw new NotPermissionException("Only team admins can perform this action");
        }
        return member;
    }

    @Transactional(readOnly = true)
    public boolean isCurrentUserAdminOfTeam(Long teamId) {
        try {
            Team team = teamRepository.findById(teamId).orElse(null);
            if (team == null) return false;
            User currentUser = authService.getCurrentUser();
            return teamMemberRepository.findByTeamAndUser(team, currentUser)
                    .map(m -> m.getRole() == TeamRole.ADMIN)
                    .orElse(false);
        } catch (Exception e) {
            return false;
        }
    }

    // ===== ADMIN: Get team summaries for a specific user =====

    @Transactional(readOnly = true)
    public List<TeamDTO> getTeamSummariesByUserId(Long userId) throws ResourceNotFoundException, NotPermissionException {
        if (!authService.hasRole("ROLE_ADMIN")) {
            throw new NotPermissionException("Only admins can view other users' teams");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        List<Team> teams = teamRepository.findAllByMemberUser(user);
        return teams.stream().map(t -> TeamDTO.fromEntity(t, false)).toList();
    }
}
