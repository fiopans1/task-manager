package com.taskmanager.application.controller.suites;

import org.junit.platform.suite.api.SelectClasses;
import org.junit.platform.suite.api.Suite;
import org.junit.platform.suite.api.SuiteDisplayName;

import com.taskmanager.application.controller.ListRestControllerTest;

/**
 * Suite de pruebas para el controlador de listas
 */
@Suite
@SuiteDisplayName("List Rest Controller Test Suite")
@SelectClasses({
    ListRestControllerTest.class
})
public class ListRestControllerTestSuite {
    // La clase no necesita contener ningún código,
    // ya que JUnit 5 utiliza las anotaciones para configurar la suite
}
