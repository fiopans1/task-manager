package com.taskmanager.application.respository;

import com.taskmanager.application.model.entities.InvitationStatus;
import com.taskmanager.application.model.entities.Team;
import com.taskmanager.application.model.entities.TeamInvitation;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TeamInvitationRepository extends JpaRepository<TeamInvitation, Long> {

    List<TeamInvitation> findAllByTeam(Team team);

    List<TeamInvitation> findAllByInvitedEmailAndStatus(String email, InvitationStatus status);

    List<TeamInvitation> findAllByInvitedUsernameAndStatus(String username, InvitationStatus status);

    List<TeamInvitation> findAllByTeamAndStatus(Team team, InvitationStatus status);

    Optional<TeamInvitation> findByToken(String token);
}
