package com.taskmanager.application.respository;

import com.taskmanager.application.model.entities.AuthSession;
import com.taskmanager.application.model.entities.RefreshToken;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenIdentifier(String tokenIdentifier);

    List<RefreshToken> findBySession(AuthSession session);
}
