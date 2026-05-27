package com.taskmanager.application.respository;

import com.taskmanager.application.model.entities.Team;
import com.taskmanager.application.model.entities.User;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {

    @Query("SELECT DISTINCT t FROM Team t JOIN t.members m WHERE m.user = :user")
    List<Team> findAllByMemberUser(@Param("user") User user);

    @Query("SELECT DISTINCT t FROM Team t JOIN t.members m WHERE m.user = :user")
    Page<Team> findAllByMemberUser(@Param("user") User user, Pageable pageable);

    @Query("SELECT DISTINCT t FROM Team t JOIN t.members m WHERE m.user = :user AND LOWER(t.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<Team> findByMemberUserAndNameContaining(@Param("user") User user, @Param("name") String name, Pageable pageable);
}
