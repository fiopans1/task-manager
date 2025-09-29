package com.taskmanager.application.controller.suites;

import org.junit.platform.suite.api.SelectClasses;
import org.junit.platform.suite.api.Suite;
import org.junit.platform.suite.api.SuiteDisplayName;

import com.taskmanager.application.controller.SecuredEndpointTest;

/**
 * Suite de pruebas para endpoints protegidos y autenticación
 */
@Suite
@SuiteDisplayName("Security Test Suite")
@SelectClasses({
    SecuredEndpointTest.class
})
public class SecurityTestSuite {
    // La clase no necesita contener ningún código,
    // ya que JUnit 5 utiliza las anotaciones para configurar la suite
}
