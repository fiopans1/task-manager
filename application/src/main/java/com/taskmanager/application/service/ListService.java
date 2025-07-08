package com.taskmanager.application.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.taskmanager.application.respository.ListRepository;

@Service
public class ListService {

    @Autowired
    private ListRepository listRepository;
    
}
