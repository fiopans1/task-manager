package com.taskmanager.application.respository;

import com.taskmanager.application.model.entities.Task;
import com.taskmanager.application.model.entities.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;






public interface TaskRepository extends JpaRepository<Task, Long>{

    List<Task> findAllByUser(User user);
}
