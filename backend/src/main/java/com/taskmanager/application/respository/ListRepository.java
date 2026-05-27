package com.taskmanager.application.respository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.taskmanager.application.model.entities.ListTM;
import com.taskmanager.application.model.entities.User;

@Repository
public interface ListRepository extends JpaRepository<ListTM, Long> {

    List<ListTM> findAllByUser(User user);

    Page<ListTM> findAllByUser(User user, Pageable pageable);

    long countByUser(User user);

    @Query("SELECT l FROM ListTM l WHERE l.user = :user AND LOWER(l.nameOfList) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<ListTM> findByUserAndNameContaining(@Param("user") User user, @Param("name") String name, Pageable pageable);
}
