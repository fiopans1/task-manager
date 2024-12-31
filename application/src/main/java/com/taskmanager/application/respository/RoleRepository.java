package com.taskmanager.application.respository;

import com.taskmanager.application.model.entities.RoleOfUser;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;



@Repository
public interface RoleRepository extends JpaRepository<RoleOfUser, Long> {
    Optional<RoleOfUser> findByName(String name);

}
