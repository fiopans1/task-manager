package com.taskmanager.application.respository;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.taskmanager.application.model.entities.ListElement;


@Repository
public interface ListElementRepository extends JpaRepository<ListElement, Long> {

}
