package com.taskmanager.application.service;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.taskmanager.application.model.dto.ListTMDTO;
import com.taskmanager.application.model.dto.TaskDTO;
import com.taskmanager.application.model.entities.ListTM;
import com.taskmanager.application.model.entities.Task;
import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.respository.ListRepository;

import jakarta.transaction.Transactional;

@Service
public class ListService {

    @Autowired
    private ListRepository listRepository;

    @Autowired
    private AuthService authService;

    @Transactional
    public ListTM createList(ListTMDTO listDTO) {
        ListTM list = ListTMDTO.toEntity(listDTO);
        User user = authService.getCurrentUser();

        //task.setCreationDate(new Date());
        if (list.getUser() != null && authService.hasRole("ADMIN")) {
            return listRepository.save(list);
        } else {
            list.setUser(user);
            return listRepository.save(list);
        }
    }

    //Implement the rest of the methods as needed
}
