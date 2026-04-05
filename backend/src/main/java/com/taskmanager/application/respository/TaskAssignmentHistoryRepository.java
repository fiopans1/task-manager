package com.taskmanager.application.respository;

import com.taskmanager.application.model.entities.Task;
import com.taskmanager.application.model.entities.TaskAssignmentHistory;
import com.taskmanager.application.model.entities.Team;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskAssignmentHistoryRepository extends JpaRepository<TaskAssignmentHistory, Long> {

    List<TaskAssignmentHistory> findAllByTeamOrderByChangedDateDesc(Team team);

    Page<TaskAssignmentHistory> findAllByTeamOrderByChangedDateDesc(Team team, Pageable pageable);

    List<TaskAssignmentHistory> findAllByTaskOrderByChangedDateDesc(Task task);
}
