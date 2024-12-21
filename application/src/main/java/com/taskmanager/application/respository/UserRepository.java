package com.taskmanager.application.respository;

import com.taskmanager.application.model.User;
import org.springframework.data.jpa.repository.JpaRepository;


public interface UserRepository  extends JpaRepository<User, Long>{

}
