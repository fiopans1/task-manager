package com.taskmanager.application.controller;

import com.taskmanager.application.model.dto.LoginDTO;
import com.taskmanager.application.model.dto.ResponseDTO;
import com.taskmanager.application.model.entities.FullName;
import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.service.AuthService;
import java.util.HashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;




@RestController
@RequestMapping("/auth")
public class AuthRestController {

    @Autowired
    private AuthService authService;


    @PostMapping("/login")
    public ResponseEntity<HashMap<String,String>> login(@RequestBody LoginDTO login) throws Exception {
        HashMap<String,String> response = authService.login(login);
        if(response.get("token") == null){
            return ResponseEntity.badRequest().body(response);
        }else{
            return ResponseEntity.ok(response);
        }
    }
    
    @PostMapping("/register")
    public ResponseEntity<ResponseDTO> register(@RequestBody User user) throws Exception {
        return ResponseEntity.created(null).body(authService.register(user));
    }
    
}
