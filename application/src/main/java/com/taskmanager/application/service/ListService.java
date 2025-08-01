package com.taskmanager.application.service;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.taskmanager.application.model.dto.ListElementDTO;
import com.taskmanager.application.model.dto.ListTMDTO;
import com.taskmanager.application.model.dto.TaskDTO;
import com.taskmanager.application.model.entities.EventTask;
import com.taskmanager.application.model.entities.ListElement;
import com.taskmanager.application.model.entities.ListTM;
import com.taskmanager.application.model.entities.Task;
import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.model.exceptions.NotPermissionException;
import com.taskmanager.application.model.exceptions.ResourceNotFoundException;
import com.taskmanager.application.respository.ListElementRepository;
import com.taskmanager.application.respository.ListRepository;

import org.springframework.transaction.annotation.Transactional;

@Service
public class ListService {

    @Autowired
    private ListRepository listRepository;

    @Autowired
    private ListElementRepository listElementRepository;

    @Autowired
    private AuthService authService;

    @Transactional
    public ListTM createList(ListTMDTO listDTO) {
        ListTM list = ListTMDTO.toEntity(listDTO, false);
        User user = authService.getCurrentUser();

        if (list.getUser() != null && authService.hasRole("ADMIN")) {
            return listRepository.save(list);
        } else {
            list.setUser(user);
            return listRepository.save(list);
        }
    }

    @Transactional(readOnly = true)
    public List<ListTMDTO> findAllListsForLoggedUser() {
        User user = authService.getCurrentUser();
        List<ListTM> list = listRepository.findAllByUser(user);
        return list.stream().map(l -> ListTMDTO.fromEntity(l, false)).toList();
    }

    @Transactional
    public void deleteListById(Long id) throws NotPermissionException, ResourceNotFoundException {
        ListTM list = listRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id " + id));
        if (authService.hasRole("ADMIN") || list.getUser().getUsername().equals(authService.getCurrentUsername())) {
            listRepository.deleteById(id);
        } else {
            throw new NotPermissionException("You don't have permission to delete this task");
        }
    }

    @Transactional
    public ListTMDTO updateList(Long id, ListTMDTO list) throws ResourceNotFoundException, NotPermissionException {
        ListTM listToUpdate = listRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("List not found with id " + id));
        if (authService.hasRole("ADMIN") || listToUpdate.getUser().getUsername().equals(authService.getCurrentUsername())) {
            listToUpdate.setColor(list.getColor());
            listToUpdate.setNameOfList(list.getNameOfList());
            listToUpdate.setDescriptionOfList(list.getDescriptionOfList());

            return ListTMDTO.fromEntity(listRepository.save(listToUpdate), false);
        } else {
            throw new NotPermissionException("You don't have permission to update this task");
        }
    }

    @Transactional(readOnly = true)
    public ListTMDTO getListWithElementsById(Long id) throws ResourceNotFoundException, NotPermissionException {
        ListTM list = listRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("List not found with id " + id));

        if (authService.hasRole("ADMIN") || list.getUser().getUsername().equals(authService.getCurrentUsername())) {
            return ListTMDTO.fromEntity(list, true);
        } else {
            throw new NotPermissionException("You don't have permission to view this list");
        }
    }

    @Transactional
    public ListElement addElementToList(Long listId, ListElementDTO elementDTO) throws ResourceNotFoundException, NotPermissionException {
        ListTM list = listRepository.findById(listId)
                .orElseThrow(() -> new ResourceNotFoundException("List not found with id " + listId));
        if (authService.hasRole("ADMIN") || list.getUser().getUsername().equals(authService.getCurrentUsername())) {
            ListElement element = ListElementDTO.toEntity(elementDTO);
            element.setListTM(list);
            return listElementRepository.save(element);
        } else {
            throw new NotPermissionException("You don't have permission to add elements to this list");
        }
    }

    @Transactional
    public ListElement updateElement(Long id, ListElementDTO elementDTO) throws ResourceNotFoundException, NotPermissionException {
        ListElement element = listElementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Element not found with id " + id));
        ListTM list = element.getListTM();

        if (authService.hasRole("ADMIN") || list.getUser().getUsername().equals(authService.getCurrentUsername())) {
            element.setNameOfElement(elementDTO.getName());
            element.setDescriptionOfElement(elementDTO.getDescription());
            element.setCompleted(elementDTO.isCompleted());
            return listElementRepository.save(element);
        } else {
            throw new NotPermissionException("You don't have permission to update this element");
        }
    }

    @Transactional
    public void deleteElement(Long id) throws ResourceNotFoundException, NotPermissionException {
        ListElement element = listElementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Element not found with id " + id));
        ListTM list = element.getListTM();
        if (authService.hasRole("ADMIN") || list.getUser().getUsername().equals(authService.getCurrentUsername())) {
            listElementRepository.deleteById(id);
        } else {
            throw new NotPermissionException("You don't have permission to delete this element");
        }
    }
}
