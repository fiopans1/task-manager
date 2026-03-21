package com.taskmanager.application.respository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.taskmanager.application.model.entities.ListTM;
import com.taskmanager.application.model.entities.User;

@Repository
public interface ListRepository extends JpaRepository<ListTM, Long>{

    List<ListTM> findAllByUser(User user);
}
