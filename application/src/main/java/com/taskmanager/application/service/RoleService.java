package com.taskmanager.application.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.taskmanager.application.model.entities.RoleOfUser;
import com.taskmanager.application.respository.RoleRepository;

@Service
public class RoleService {

    @Autowired
    private RoleRepository roleRepository;

    public void createRole(String name) {
        RoleOfUser newRole = new RoleOfUser();
        newRole.setName(name);
        roleRepository.save(newRole);
    }

    public void deleteRole(String name) {
        RoleOfUser role = roleRepository.findByName(name)
            .orElseThrow(() -> new IllegalArgumentException("Role not found: " + name));
        roleRepository.delete(role);
    }

}
