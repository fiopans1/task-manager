package com.taskmanager.application.controller;

import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.service.UserService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;




@RestController
@RequestMapping("/api/user/")
public class UserRestController {
    
    @Autowired
    private UserService userService;

    @GetMapping("/getUser")
    public ResponseEntity<List<User>> getMethodName() {
        return new ResponseEntity<>(userService.getAllUser(), null, 200);
    }
    

}
