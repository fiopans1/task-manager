package com.taskmanager.application.respository;

import com.taskmanager.application.model.entities.AppConfig;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AppConfigRepository extends JpaRepository<AppConfig, Long> {

    Optional<AppConfig> findByConfigKey(String configKey);

    List<AppConfig> findByConfigKeyStartingWith(String prefix);
}
