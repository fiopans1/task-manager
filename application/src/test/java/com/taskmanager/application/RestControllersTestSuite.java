package com.taskmanager.application;

import org.junit.platform.suite.api.SelectClasses;
import org.junit.platform.suite.api.Suite;
import org.junit.platform.suite.api.SuiteDisplayName;

import com.taskmanager.application.controller.suites.AuthRestControllerTestSuite;
import com.taskmanager.application.controller.suites.ListRestControllerTestSuite;
import com.taskmanager.application.controller.suites.SecurityTestSuite;
import com.taskmanager.application.controller.suites.TaskRestControllerTestSuite;

/**
 * Suite principal de pruebas para todos los controladores REST
 */
@Suite
@SuiteDisplayName("REST Controllers Test Suite")
@SelectClasses({
    AuthRestControllerTestSuite.class,
    ListRestControllerTestSuite.class,
    TaskRestControllerTestSuite.class,
    SecurityTestSuite.class
})
public class RestControllersTestSuite {
    // La clase no necesita contener ningún código,
    // ya que JUnit 5 utiliza las anotaciones para configurar la suite
}
