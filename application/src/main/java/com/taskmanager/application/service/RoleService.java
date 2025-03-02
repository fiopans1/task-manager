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

    public void updateRole(String oldName, String newName) {
        RoleOfUser role = roleRepository.findByName(oldName)
            .orElseThrow(() -> new IllegalArgumentException("Role not found: " + oldName));
        role.setName(newName);
        roleRepository.save(role);
    }

    public RoleOfUser getRole(String name) {
        return roleRepository.findByName(name)
            .orElseThrow(() -> new IllegalArgumentException("Role not found: " + name));
    }

    public boolean existsBasicRole(){
        return roleRepository.existsByName("BASIC");
    }

    public RoleOfUser getBasicRole(){
        return roleRepository.findByName("BASIC")
            .orElseThrow(() -> new IllegalArgumentException("Role not found: BASIC"));
    }

}
