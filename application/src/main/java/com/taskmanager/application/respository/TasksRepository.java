package com.taskmanager.application.respository;

import com.taskmanager.application.model.Tasks;
import org.springframework.data.jpa.repository.JpaRepository;


public interface TasksRepository extends JpaRepository<Tasks, Long>{

}
