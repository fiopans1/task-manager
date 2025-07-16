package com.taskmanager.application.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taskmanager.application.service.ListService;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.taskmanager.application.model.dto.ListElementDTO;
import com.taskmanager.application.model.dto.ListTMDTO;
import com.taskmanager.application.model.exceptions.NotPermissionException;
import com.taskmanager.application.model.exceptions.ResourceNotFoundException;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/lists")
public class ListRestController {

    @Autowired
    private ListService listService;

    @PostMapping("/create")
    public ResponseEntity<ListTMDTO> createList(@RequestBody ListTMDTO entity) {
        return ResponseEntity.ok().body(ListTMDTO.fromEntity(listService.createList(entity), false));
    }

    @GetMapping("/lists")
    public ResponseEntity<List<ListTMDTO>> getAllListForUser() {
        return ResponseEntity.ok().body(listService.findAllListsForLoggedUser()); //TO-DO: All ResponseEntity change and put correctly messages
    }

    @GetMapping("/getList/{id}")
    public ResponseEntity<ListTMDTO> getListWithElements(@PathVariable Long id) throws ResourceNotFoundException, NotPermissionException {
        return ResponseEntity.ok().body(listService.getListWithElementsById(id));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteList(@PathVariable Long id) throws NotPermissionException, ResourceNotFoundException {
        listService.deleteListById(id);
        return ResponseEntity.ok().body("List deleted successfully");
    }

    @PostMapping("/update/{id}")
    public ResponseEntity<ListTMDTO> updateList(@PathVariable Long id, @RequestBody ListTMDTO entity) throws ResourceNotFoundException, NotPermissionException {
        return ResponseEntity.ok().body(listService.updateList(id, entity));
    }

    //The id is the List ID, not the element ID
    @PostMapping("/addElement/{id}")
    public ResponseEntity<String> addElementToList(@PathVariable Long id, @RequestBody ListElementDTO elementDTO) throws ResourceNotFoundException, NotPermissionException {
        listService.addElementToList(id, elementDTO);
        return ResponseEntity.ok().body("Element added successfully");
    }

    @DeleteMapping("/deleteElement/{id}")
    public ResponseEntity<String> deleteElementFromList(@PathVariable Long id) throws NotPermissionException, ResourceNotFoundException {
        listService.deleteElement(id);
        return ResponseEntity.ok().body("Element deleted successfully");
    }
    @PostMapping("/updateElement/{id}")
    public ResponseEntity<ListElementDTO> updateElement(@PathVariable Long id, @RequestBody ListElementDTO elementDTO) throws ResourceNotFoundException, NotPermissionException {
        return ResponseEntity.ok().body(ListElementDTO.fromEntity(listService.updateElement(id, elementDTO)));
    }

}
