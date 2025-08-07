package com.taskmanager.application.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.taskmanager.application.model.dto.ListElementDTO;
import com.taskmanager.application.model.dto.ListTMDTO;
import com.taskmanager.application.model.entities.ListElement;
import com.taskmanager.application.model.entities.ListTM;
import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.model.exceptions.NotPermissionException;
import com.taskmanager.application.model.exceptions.ResourceNotFoundException;
import com.taskmanager.application.respository.ListElementRepository;
import com.taskmanager.application.respository.ListRepository;

import org.springframework.transaction.annotation.Transactional;

@Service
public class ListService {

    private static final Logger logger = LoggerFactory.getLogger(ListService.class);

    @Autowired
    private ListRepository listRepository;

    @Autowired
    private ListElementRepository listElementRepository;

    @Autowired
    private AuthService authService;

    @Transactional
    public ListTM createList(ListTMDTO listDTO) {
        logger.info("Creating list: {}", listDTO.getNameOfList());

        ListTM list = ListTMDTO.toEntity(listDTO, false);
        User user = authService.getCurrentUser();

        if (list.getUser() != null && authService.hasRole("ADMIN")) {
            logger.info("Admin creating list for user: {}", list.getUser().getUsername());
            return listRepository.save(list);
        } else {
            list.setUser(user);
            logger.info("User {} creating list: {}", user.getUsername(), listDTO.getNameOfList());
            return listRepository.save(list);
        }
    }

    @Transactional(readOnly = true)
    public List<ListTMDTO> findAllListsForLoggedUser() {
        User user = authService.getCurrentUser();
        logger.debug("Retrieving all lists for user: {}", user.getUsername());

        List<ListTM> list = listRepository.findAllByUser(user);
        logger.debug("Found {} lists for user: {}", list.size(), user.getUsername());

        return list.stream().map(l -> ListTMDTO.fromEntity(l, false)).toList();
    }

    @Transactional
    public void deleteListById(Long id) throws NotPermissionException, ResourceNotFoundException {
        logger.info("Deleting list with ID: {}", id);

        ListTM list = listRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id " + id));
        if (authService.hasRole("ADMIN") || list.getUser().getUsername().equals(authService.getCurrentUsername())) {
            listRepository.deleteById(id);
            logger.info("Successfully deleted list with ID: {}", id);
        } else {
            logger.warn("Permission denied deleting list with ID: {} for user: {}", id, authService.getCurrentUsername());
            throw new NotPermissionException("You don't have permission to delete this task");
        }
    }

    @Transactional
    public ListTMDTO updateList(Long id, ListTMDTO list) throws ResourceNotFoundException, NotPermissionException {
        logger.info("Updating list with ID: {}", id);

        ListTM listToUpdate = listRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("List not found with id " + id));

        if (authService.hasRole("ADMIN") || listToUpdate.getUser().getUsername().equals(authService.getCurrentUsername())) {
            logger.debug("User authorized to update list ID: {}", id);
            listToUpdate.setColor(list.getColor());
            listToUpdate.setNameOfList(list.getNameOfList());
            listToUpdate.setDescriptionOfList(list.getDescriptionOfList());

            ListTMDTO updatedList = ListTMDTO.fromEntity(listRepository.save(listToUpdate), false);
            logger.info("Successfully updated list with ID: {}", id);
            return updatedList;
        } else {
            logger.warn("Permission denied updating list with ID: {} for user: {}", id, authService.getCurrentUsername());
            throw new NotPermissionException("You don't have permission to update this task");
        }
    }

    @Transactional(readOnly = true)
    public ListTMDTO getListWithElementsById(Long id) throws ResourceNotFoundException, NotPermissionException {
        logger.info("Retrieving list with elements for ID: {}", id);

        ListTM list = listRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("List not found with id " + id));

        if (authService.hasRole("ADMIN") || list.getUser().getUsername().equals(authService.getCurrentUsername())) {
            logger.debug("User authorized to view list with ID: {}", id);
            ListTMDTO result = ListTMDTO.fromEntity(list, true);
            logger.info("Successfully retrieved list with elements for ID: {}", id);
            return result;
        } else {
            logger.warn("Permission denied viewing list with ID: {} for user: {}", id, authService.getCurrentUsername());
            throw new NotPermissionException("You don't have permission to view this list");
        }
    }

    @Transactional
    public ListElement addElementToList(Long listId, ListElementDTO elementDTO) throws ResourceNotFoundException, NotPermissionException {
        logger.info("Adding element to list with ID: {}", listId);

        ListTM list = listRepository.findById(listId)
                .orElseThrow(() -> new ResourceNotFoundException("List not found with id " + listId));

        if (authService.hasRole("ADMIN") || list.getUser().getUsername().equals(authService.getCurrentUsername())) {
            logger.debug("User authorized to add element to list ID: {}", listId);
            ListElement element = ListElementDTO.toEntity(elementDTO);
            element.setListTM(list);
            ListElement savedElement = listElementRepository.save(element);
            logger.info("Successfully added element to list ID: {}", listId);
            return savedElement;
        } else {
            logger.warn("Permission denied adding element to list ID: {} for user: {}", listId, authService.getCurrentUsername());
            throw new NotPermissionException("You don't have permission to add elements to this list");
        }
    }

    @Transactional
    public ListElement updateElement(Long id, ListElementDTO elementDTO) throws ResourceNotFoundException, NotPermissionException {
        logger.info("Updating element with ID: {}", id);

        ListElement element = listElementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Element not found with id " + id));
        ListTM list = element.getListTM();

        if (authService.hasRole("ADMIN") || list.getUser().getUsername().equals(authService.getCurrentUsername())) {
            logger.debug("User authorized to update element ID: {}", id);
            element.setNameOfElement(elementDTO.getName());
            element.setDescriptionOfElement(elementDTO.getDescription());
            element.setCompleted(elementDTO.isCompleted());
            ListElement updatedElement = listElementRepository.save(element);
            logger.info("Successfully updated element with ID: {}", id);
            return updatedElement;
        } else {
            logger.warn("Permission denied updating element with ID: {} for user: {}", id, authService.getCurrentUsername());
            throw new NotPermissionException("You don't have permission to update this element");
        }
    }

    @Transactional
    public void deleteElement(Long id) throws ResourceNotFoundException, NotPermissionException {
        logger.info("Deleting element with ID: {}", id);

        ListElement element = listElementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Element not found with id " + id));
        ListTM list = element.getListTM();

        if (authService.hasRole("ADMIN") || list.getUser().getUsername().equals(authService.getCurrentUsername())) {
            logger.debug("User authorized to delete element ID: {}", id);
            listElementRepository.deleteById(id);
            logger.info("Successfully deleted element with ID: {}", id);
        } else {
            logger.warn("Permission denied deleting element with ID: {} for user: {}", id, authService.getCurrentUsername());
            throw new NotPermissionException("You don't have permission to delete this element");
        }
    }
}
