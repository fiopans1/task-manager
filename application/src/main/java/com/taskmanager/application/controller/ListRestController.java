package com.taskmanager.application.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taskmanager.application.service.ListService;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.taskmanager.application.model.dto.ListElementDTO;
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

    @PostMapping("/create")
    public ResponseEntity<ListTMDTO> createList(@RequestBody ListTMDTO entity) {
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
            return ResponseEntity.ok().body("List deleted successfully");
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
    public ResponseEntity<ListTMDTO> updateList(@PathVariable Long id, @RequestBody ListTMDTO entity) throws ResourceNotFoundException, NotPermissionException {
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
    @PostMapping("/addElement/{id}")
    public ResponseEntity<String> addElementToList(@PathVariable Long id, @RequestBody ListElementDTO elementDTO) throws ResourceNotFoundException, NotPermissionException {
        logger.info("Adding element to list with ID: {}", id);

        try {
            listService.addElementToList(id, elementDTO);
            logger.info("Successfully added element to list with ID: {}", id);
            return ResponseEntity.ok().body("Element added successfully");
        } catch (ResourceNotFoundException e) {
            logger.warn("List not found when adding element to list ID: {}", id);
            throw e;
        } catch (NotPermissionException e) {
            logger.warn("Permission denied adding element to list ID: {}", id);
            throw e;
        } catch (Exception e) {
            logger.error("Error adding element to list ID: {}", id, e);
            throw e;
        }
    }

    @DeleteMapping("/deleteElement/{id}")
    public ResponseEntity<String> deleteElementFromList(@PathVariable Long id) throws NotPermissionException, ResourceNotFoundException {
        logger.info("Deleting element with ID: {}", id);

        try {
            listService.deleteElement(id);
            logger.info("Successfully deleted element with ID: {}", id);
            return ResponseEntity.ok().body("Element deleted successfully");
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

    @PostMapping("/updateElement/{id}")
    public ResponseEntity<ListElementDTO> updateElement(@PathVariable Long id, @RequestBody ListElementDTO elementDTO) throws ResourceNotFoundException, NotPermissionException {
        logger.info("Updating element with ID: {}", id);

        try {
            ListElementDTO updatedElement = ListElementDTO.fromEntity(listService.updateElement(id, elementDTO));
            logger.info("Successfully updated element with ID: {}", id);
            return ResponseEntity.ok().body(updatedElement);
        } catch (ResourceNotFoundException e) {
            logger.warn("Element not found for update with ID: {}", id);
            throw e;
        } catch (NotPermissionException e) {
            logger.warn("Permission denied updating element with ID: {}", id);
            throw e;
        } catch (Exception e) {
            logger.error("Error updating element with ID: {}", id, e);
            throw e;
        }
    }

}
