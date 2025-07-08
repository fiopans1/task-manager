package com.taskmanager.application.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taskmanager.application.service.ListService;

@RestController
@RequestMapping("/api/lists")
public class ListRestController {

    @Autowired
    private ListService listService;

    
}
