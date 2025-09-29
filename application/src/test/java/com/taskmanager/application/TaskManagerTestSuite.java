package com.taskmanager.application;

import org.junit.platform.suite.api.SelectClasses;
import org.junit.platform.suite.api.Suite;
import org.junit.platform.suite.api.SuiteDisplayName;

import com.taskmanager.application.controller.ListRestControllerTest;
import com.taskmanager.application.controller.TaskRestControllerTestNew;
import com.taskmanager.application.service.TaskServiceTest;

/**
 * Suite de pruebas para ejecutar todas las pruebas funcionales del proyecto.
 * Esta suite incluye todas las pruebas que sabemos que funcionan correctamente.
 */
@Suite
@SuiteDisplayName("TaskManager Test Suite")
@SelectClasses({
    // Controladores con la nueva implementación usando BaseControllerTest
    TaskRestControllerTestNew.class,
    ListRestControllerTest.class,
    // Servicios
    TaskServiceTest.class, // Añadir más clases de prueba a medida que se vayan implementando y validando
})
public class TaskManagerTestSuite {
    // La clase no necesita contener ningún código,
    // ya que JUnit 5 utiliza las anotaciones para configurar la suite
}
