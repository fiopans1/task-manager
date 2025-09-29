package com.taskmanager.application.controller.suites;

import org.junit.platform.suite.api.SelectClasses;
import org.junit.platform.suite.api.Suite;
import org.junit.platform.suite.api.SuiteDisplayName;

import com.taskmanager.application.controller.AuthRestControllerTest;

/**
 * Suite de pruebas para el controlador de autenticación
 */
@Suite
@SuiteDisplayName("Auth Rest Controller Test Suite")
@SelectClasses({
    AuthRestControllerTest.class
})
public class AuthRestControllerTestSuite {
    // La clase no necesita contener ningún código,
    // ya que JUnit 5 utiliza las anotaciones para configurar la suite
}
