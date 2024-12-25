package com.taskmanager.application.respository;

import com.taskmanager.application.model.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;






public interface UserRepository  extends JpaRepository<User, Long>{

    User findByUsername(String username);

    User findByEmail(String email);
}
