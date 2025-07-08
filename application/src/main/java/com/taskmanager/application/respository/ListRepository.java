package com.taskmanager.application.respository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.taskmanager.application.model.entities.ListTM;

@Repository
public interface ListRepository extends JpaRepository<ListTM, Long>{


}
