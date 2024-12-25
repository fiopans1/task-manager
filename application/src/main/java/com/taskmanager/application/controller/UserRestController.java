package com.taskmanager.application.controller;

import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.query.Param;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;




@RestController
@RequestMapping("/api/user/")
public class UserRestController {
    
    @Autowired
    private UserService userService;

    @PostMapping("/createUser")
    public User postMethodName(@Param("username") String username, @Param("password") String password, @Param("age") int age, @Param("email") String email) {
        User user = new User();
        user.setUsername(username);
        user.setPassword(password);
        user.setAge(age);
        user.setEmail(email);
        return userService.newUser(user);
    }
    

}
