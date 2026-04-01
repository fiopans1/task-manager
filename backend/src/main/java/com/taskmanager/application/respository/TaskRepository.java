package com.taskmanager.application.respository;

import com.taskmanager.application.model.entities.Task;
import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.model.entities.Team;
import com.taskmanager.application.model.entities.StateTask;
import com.taskmanager.application.model.entities.PriorityTask;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.taskmanager.application.model.dto.TaskResumeDTO;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findAllByUser(User user);

    @Query("SELECT new com.taskmanager.application.model.dto.TaskResumeDTO(t.id, t.nameOfTask) "
            + "FROM Task t "
            + "WHERE t.user.id = :userId AND t.list IS NULL")
    List<TaskResumeDTO> findTasksResumeWithoutListByUserId(@Param("userId") Long userId);

    List<Task> findTop5ByUserOrderByCreationDateDesc(User user);

    long countByUser(User user);

    List<Task> findAllByTeam(Team team);

    @Query("SELECT t FROM Task t WHERE t.team = :team AND t.assignedTo = :user")
    List<Task> findAllByTeamAndAssignedTo(@Param("team") Team team, @Param("user") User user);

    @Query("SELECT t FROM Task t WHERE t.team = :team "
            + "AND (:assignedTo IS NULL OR t.assignedTo = :assignedTo) "
            + "AND (:state IS NULL OR t.state = :state) "
            + "AND (:priority IS NULL OR t.priority = :priority)")
    List<Task> findTeamTasksFiltered(
            @Param("team") Team team,
            @Param("assignedTo") User assignedTo,
            @Param("state") StateTask state,
            @Param("priority") PriorityTask priority);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.team = :team AND t.assignedTo = :user AND t.state NOT IN (:excludedStates)")
    long countPendingByTeamAndAssignedTo(@Param("team") Team team, @Param("user") User user, @Param("excludedStates") List<StateTask> excludedStates);

    long countByTeam(Team team);

    long countByTeamAndState(Team team, StateTask state);
}
