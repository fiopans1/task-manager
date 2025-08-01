package com.taskmanager.application.context;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Component;

import com.taskmanager.application.model.entities.AuthProvider;

import jakarta.annotation.PostConstruct;

@Component
public class ApplicationContextProvider {

    @Autowired
    private ApplicationContext applicationContext;

    @PostConstruct
    public void init() {
        AuthProvider.setApplicationContext(applicationContext);
    }
 
}
