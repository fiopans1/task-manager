package com.taskmanager.application.respository;

import com.taskmanager.application.model.entities.Task;
import com.taskmanager.application.model.entities.User;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.taskmanager.application.model.dto.TaskResumeDTO;





@Repository
public interface TaskRepository extends JpaRepository<Task, Long>{

    List<Task> findAllByUser(User user);

    @Query("SELECT new com.taskmanager.application.model.dto.TaskResumeDTO(t.id, t.nameOfTask) " +
           "FROM Task t " +
           "WHERE t.user.id = :userId AND t.list IS NULL")
    List<TaskResumeDTO> findTasksResumeWithoutListByUserId(Long userId);
}
