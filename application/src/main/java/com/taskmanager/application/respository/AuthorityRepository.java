package com.taskmanager.application.respository;


import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.taskmanager.application.model.entities.AuthorityOfRole;

@Repository
public interface AuthorityRepository extends JpaRepository<AuthorityOfRole, Long> {
    Optional<AuthorityOfRole> findByName(String name);

}
