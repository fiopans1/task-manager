package com.taskmanager.application.respository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.taskmanager.application.model.entities.ActionTask;
import com.taskmanager.application.model.entities.Task;

@Repository
public interface ActionTaskRepository extends JpaRepository<ActionTask, Long>{

    List<ActionTask> findAllByTask(Task task);
}
