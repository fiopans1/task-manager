package com.taskmanager.application.respository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.taskmanager.application.model.entities.ActionTask;

public interface ActionTaskRepository extends JpaRepository<ActionTask, Long>{

}
