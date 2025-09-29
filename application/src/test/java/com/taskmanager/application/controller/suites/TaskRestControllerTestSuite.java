package com.taskmanager.application.controller.suites;

import org.junit.platform.suite.api.SelectClasses;
import org.junit.platform.suite.api.Suite;
import org.junit.platform.suite.api.SuiteDisplayName;

import com.taskmanager.application.controller.TaskRestControllerTestNew;

/**
 * Suite de pruebas para el controlador de tareas
 */
@Suite
@SuiteDisplayName("Task Rest Controller Test Suite")
@SelectClasses({
    TaskRestControllerTestNew.class
})
public class TaskRestControllerTestSuite {
    // La clase no necesita contener ningún código,
    // ya que JUnit 5 utiliza las anotaciones para configurar la suite
}
