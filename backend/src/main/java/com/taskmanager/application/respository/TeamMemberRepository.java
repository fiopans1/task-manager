package com.taskmanager.application.respository;

import com.taskmanager.application.model.entities.Team;
import com.taskmanager.application.model.entities.TeamMember;
import com.taskmanager.application.model.entities.User;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {

    Optional<TeamMember> findByTeamAndUser(Team team, User user);

    List<TeamMember> findAllByTeam(Team team);

    List<TeamMember> findAllByUser(User user);

    boolean existsByTeamAndUser(Team team, User user);
}
