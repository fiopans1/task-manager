package com.taskmanager.application.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.taskmanager.application.model.entities.RoleOfUser;
import com.taskmanager.application.respository.RoleRepository;

@Service
public class RoleService {

    private static final Logger logger = LoggerFactory.getLogger(RoleService.class);

    @Autowired
    private RoleRepository roleRepository;

    public void createRole(String name) {
        logger.info("Creating role with name: {}", name);
        try {
            RoleOfUser newRole = new RoleOfUser();
            newRole.setName(name);
            roleRepository.save(newRole);
            logger.info("Successfully created role: {}", name);
        } catch (Exception e) {
            logger.error("Error creating role: {}", name, e);
            throw e;
        }
    }

    public void deleteRole(String name) {
        logger.info("Deleting role with name: {}", name);
        try {
            RoleOfUser role = roleRepository.findByName(name)
                    .orElseThrow(() -> new IllegalArgumentException("Role not found: " + name));
            roleRepository.delete(role);
            logger.info("Successfully deleted role: {}", name);
        } catch (IllegalArgumentException e) {
            logger.warn("Role not found for deletion: {}", name);
            throw e;
        } catch (Exception e) {
            logger.error("Error deleting role: {}", name, e);
            throw e;
        }
    }

    public void updateRole(String oldName, String newName) {
        logger.info("Updating role from '{}' to '{}'", oldName, newName);
        try {
            RoleOfUser role = roleRepository.findByName(oldName)
                    .orElseThrow(() -> new IllegalArgumentException("Role not found: " + oldName));
            role.setName(newName);
            roleRepository.save(role);
            logger.info("Successfully updated role from '{}' to '{}'", oldName, newName);
        } catch (IllegalArgumentException e) {
            logger.warn("Role not found for update: {}", oldName);
            throw e;
        } catch (Exception e) {
            logger.error("Error updating role from '{}' to '{}'", oldName, newName, e);
            throw e;
        }
    }

    public RoleOfUser getRole(String name) {
        logger.debug("Retrieving role with name: {}", name);
        try {
            RoleOfUser role = roleRepository.findByName(name)
                    .orElseThrow(() -> new IllegalArgumentException("Role not found: " + name));
            logger.debug("Successfully retrieved role: {}", name);
            return role;
        } catch (IllegalArgumentException e) {
            logger.warn("Role not found: {}", name);
            throw e;
        } catch (Exception e) {
            logger.error("Error retrieving role: {}", name, e);
            throw e;
        }
    }

    public boolean existsBasicRole() {
        logger.debug("Checking if BASIC role exists");
        boolean exists = roleRepository.existsByName("BASIC");
        logger.debug("BASIC role exists: {}", exists);
        return exists;
    }

    public RoleOfUser getBasicRole() {
        logger.debug("Retrieving BASIC role");
        try {
            RoleOfUser basicRole = roleRepository.findByName("BASIC")
                    .orElseThrow(() -> new IllegalArgumentException("Role not found: BASIC"));
            logger.debug("Successfully retrieved BASIC role");
            return basicRole;
        } catch (IllegalArgumentException e) {
            logger.warn("BASIC role not found");
            throw e;
        } catch (Exception e) {
            logger.error("Error retrieving BASIC role", e);
            throw e;
        }
    }

}
