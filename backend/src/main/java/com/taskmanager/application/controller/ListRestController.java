package com.taskmanager.application.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taskmanager.application.service.ListService;
import com.taskmanager.application.service.MessageService;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.taskmanager.application.model.dto.ListTMDTO;
import com.taskmanager.application.model.exceptions.NotPermissionException;
import com.taskmanager.application.model.exceptions.ResourceNotFoundException;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/lists")
public class ListRestController {

    private static final Logger logger = LoggerFactory.getLogger(ListRestController.class);

    @Autowired
    private ListService listService;

    @Autowired
    private MessageService messageService;

    @PostMapping("/create")
    public ResponseEntity<ListTMDTO> createList(@Valid @RequestBody ListTMDTO entity) {
        logger.info("Creating new list: {}", entity.getNameOfList());

        try {
            ListTMDTO createdList = ListTMDTO.fromEntity(listService.createList(entity), false);
            logger.info("List created successfully with ID: {}", createdList.getId());
            return ResponseEntity.ok().body(createdList);
        } catch (Exception e) {
            logger.error("Error creating list: {}", entity.getNameOfList(), e);
            throw e;
        }
    }

    @GetMapping("/lists")
    public ResponseEntity<List<ListTMDTO>> getAllListForUser() {
        logger.debug("Retrieving all lists for logged user");

        try {
            List<ListTMDTO> lists = listService.findAllListsForLoggedUser();
            logger.debug("Retrieved {} lists for logged user", lists.size());
            return ResponseEntity.ok().body(lists); //TO-DO: All ResponseEntity change and put correctly messages
        } catch (Exception e) {
            logger.error("Error retrieving lists for logged user", e);
            throw e;
        }
    }

    @GetMapping("/lists/paged")
    public ResponseEntity<Page<ListTMDTO>> getAllListForUserPaged(@PageableDefault(size = 50) Pageable pageable) {
        logger.debug("Retrieving paged lists for logged user, page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());
        Page<ListTMDTO> lists = listService.findAllListsForLoggedUser(pageable);
        return ResponseEntity.ok(lists);
    }

    @GetMapping("/getList/{id}")
    public ResponseEntity<ListTMDTO> getListWithElements(@PathVariable Long id) throws ResourceNotFoundException, NotPermissionException {
        logger.info("Retrieving list with elements for ID: {}", id);

        try {
            ListTMDTO listWithElements = listService.getListWithElementsById(id);
            logger.info("Successfully retrieved list with ID: {}", id);
            return ResponseEntity.ok().body(listWithElements);
        } catch (ResourceNotFoundException e) {
            logger.warn("List not found with ID: {}", id);
            throw e;
        } catch (NotPermissionException e) {
            logger.warn("Permission denied accessing list with ID: {}", id);
            throw e;
        } catch (Exception e) {
            logger.error("Error retrieving list with ID: {}", id, e);
            throw e;
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteList(@PathVariable Long id) throws NotPermissionException, ResourceNotFoundException {
        logger.info("Deleting list with ID: {}", id);

        try {
            listService.deleteListById(id);
            logger.info("Successfully deleted list with ID: {}", id);
            return ResponseEntity.ok().body(messageService.getMessage("list.deleted.success"));
        } catch (ResourceNotFoundException e) {
            logger.warn("List not found for deletion with ID: {}", id);
            throw e;
        } catch (NotPermissionException e) {
            logger.warn("Permission denied deleting list with ID: {}", id);
            throw e;
        } catch (Exception e) {
            logger.error("Error deleting list with ID: {}", id, e);
            throw e;
        }
    }

    @PostMapping("/update/{id}")
    public ResponseEntity<ListTMDTO> updateList(@PathVariable Long id, @Valid @RequestBody ListTMDTO entity) throws ResourceNotFoundException, NotPermissionException {
        logger.info("Updating list with ID: {}", id);

        try {
            ListTMDTO updatedList = listService.updateList(id, entity);
            logger.info("Successfully updated list with ID: {}", id);
            return ResponseEntity.ok().body(updatedList);
        } catch (ResourceNotFoundException e) {
            logger.warn("List not found for update with ID: {}", id);
            throw e;
        } catch (NotPermissionException e) {
            logger.warn("Permission denied updating list with ID: {}", id);
            throw e;
        } catch (Exception e) {
            logger.error("Error updating list with ID: {}", id, e);
            throw e;
        }
    }

    //The id is the List ID, not the element ID
    @PostMapping("/addTasksToList/{id}")
    public ResponseEntity<String> addTasksToList(@PathVariable Long id, @RequestBody List<Long> tasksListId) throws ResourceNotFoundException, NotPermissionException {
        logger.info("Adding tasks to list with ID: {}", id);

        try {
            listService.addTasksToList(id, tasksListId);
            logger.info("Successfully added tasks to list with ID: {}", id);
            return ResponseEntity.ok().body(messageService.getMessage("list.tasks.added.success"));
        } catch (ResourceNotFoundException e) {
            logger.warn("List not found when adding tasks to list ID: {}", id);
            throw e;
        } catch (NotPermissionException e) {
            logger.warn("Permission denied adding tasks to list ID: {}", id);
            throw e;
        } catch (Exception e) {
            logger.error("Error adding tasks to list ID: {}", id, e);
            throw e;
        }
    }

    @DeleteMapping("/deleteTaskFromList/{id}")
    public ResponseEntity<String> deleteTaskFromList(@PathVariable Long id) throws NotPermissionException, ResourceNotFoundException {
        logger.info("Deleting task with ID: {}", id);

        try {
            listService.deleteTaskFromList(id);
            logger.info("Successfully deleted task with ID: {}", id);
            return ResponseEntity.ok().body(messageService.getMessage("list.task.deleted.success"));
        } catch (ResourceNotFoundException e) {
            logger.warn("Element not found for deletion with ID: {}", id);
            throw e;
        } catch (NotPermissionException e) {
            logger.warn("Permission denied deleting element with ID: {}", id);
            throw e;
        } catch (Exception e) {
            logger.error("Error deleting element with ID: {}", id, e);
            throw e;
        }
    }

    // ===== ADMIN: Get list summaries for a specific user =====

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ListTMDTO>> getListsByUserId(@PathVariable Long userId) throws ResourceNotFoundException, NotPermissionException {
        logger.debug("Admin retrieving list summaries for user ID: {}", userId);
        List<ListTMDTO> lists = listService.getListSummariesByUserId(userId);
        return ResponseEntity.ok(lists);
    }

    @GetMapping("/user/{userId}/paged")
    public ResponseEntity<Page<ListTMDTO>> getListsByUserIdPaged(
            @PathVariable Long userId,
            @PageableDefault(size = 50) Pageable pageable) throws ResourceNotFoundException, NotPermissionException {
        logger.debug("Admin retrieving paged list summaries for user ID: {}", userId);
        return ResponseEntity.ok(listService.getListSummariesByUserId(userId, pageable));
    }

}
