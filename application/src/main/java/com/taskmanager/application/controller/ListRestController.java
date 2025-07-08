package com.taskmanager.application.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taskmanager.application.service.ListService;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.taskmanager.application.model.dto.ListTMDTO;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;



@RestController
@RequestMapping("/api/lists")
public class ListRestController {

    @Autowired
    private ListService listService;

    @PostMapping("/create")
    public ResponseEntity<ListTMDTO> createList(@RequestBody ListTMDTO entity) {
        return null;
    }

    @GetMapping("/lists")
    public ResponseEntity<List<ListTMDTO>> getAllListForUser() {
        return null;
    }

    //TODO: This method will be return a list with all the elements of the list
    @GetMapping("/{id}")
    public String getMethodName(@PathVariable Long id) {
        return null;
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteList(@PathVariable Long id) {
        return null;
    }

    @PostMapping("/update/{id}")
    public ResponseEntity<ListTMDTO> updateList(@PathVariable Long id, @RequestBody ListTMDTO entity) {
        return null;
    }
    
    
    


    
}
