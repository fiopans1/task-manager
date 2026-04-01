package com.taskmanager.application.respository;

import com.taskmanager.application.model.entities.Team;
import com.taskmanager.application.model.entities.User;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {

    @Query("SELECT DISTINCT t FROM Team t JOIN t.members m WHERE m.user = :user")
    List<Team> findAllByMemberUser(@Param("user") User user);
}
