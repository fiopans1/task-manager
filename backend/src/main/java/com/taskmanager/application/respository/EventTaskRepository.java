package com.taskmanager.application.respository;

import java.util.Date;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.taskmanager.application.model.dto.EventTaskDTO;
import com.taskmanager.application.model.entities.EventTask;

@Repository
public interface EventTaskRepository extends JpaRepository<EventTask, Long> {

    @Query("SELECT new com.taskmanager.application.model.dto.EventTaskDTO(e.id, t.nameOfTask, e.startTime, e.endTime) "
            + "FROM EventTask e JOIN e.task t WHERE t.user.id = :userId")
    public List<EventTaskDTO> findAllEventsByUserId(@Param("userId") Long userId);

    @Query("SELECT new com.taskmanager.application.model.dto.EventTaskDTO(e.id, t.nameOfTask, e.startTime, e.endTime) "
            + "FROM EventTask e JOIN e.task t WHERE t.user.id = :userId AND (e.startTime >= :now OR e.endTime >= :now) ORDER BY e.startTime ASC")
    public List<EventTaskDTO> findUpcomingEventsByUserId(@Param("userId") Long userId, @Param("now") Date now, Pageable pageable);

}
