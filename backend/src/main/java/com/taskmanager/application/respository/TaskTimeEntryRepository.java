package com.taskmanager.application.respository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.taskmanager.application.model.entities.Task;
import com.taskmanager.application.model.entities.TaskTimeEntry;

@Repository
public interface TaskTimeEntryRepository extends JpaRepository<TaskTimeEntry, Long> {

    Optional<TaskTimeEntry> findFirstByTaskAndActiveTrue(Task task);

    Page<TaskTimeEntry> findAllByTask(Task task, Pageable pageable);

    long countByTask(Task task);
}
