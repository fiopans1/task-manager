package com.taskmanager.application.respository;

import com.taskmanager.application.model.entities.AuthSession;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuthSessionRepository extends JpaRepository<AuthSession, Long> {

    Optional<AuthSession> findBySessionIdentifier(String sessionIdentifier);
}
