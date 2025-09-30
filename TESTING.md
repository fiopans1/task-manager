# Testing Guide for Task Manager

This document describes how to run and write tests for the Task Manager application.

## Table of Contents

- [Overview](#overview)
- [Backend Tests (Java/Spring Boot)](#backend-tests-javaspring-boot)
- [Frontend Tests (React/Jest)](#frontend-tests-reactjest)
- [Test Coverage](#test-coverage)
- [Writing New Tests](#writing-new-tests)

## Overview

The Task Manager application has comprehensive test suites for both backend and frontend components:

- **Backend**: JUnit 5, Mockito, Spring Boot Test
- **Frontend**: Jest, React Testing Library

## Backend Tests (Java/Spring Boot)

### Running Backend Tests

```bash
cd application
./mvnw test
```

### Running Specific Test Classes

```bash
./mvnw test -Dtest=AuthServiceTest
./mvnw test -Dtest=TaskServiceTest
```

### Running Tests with Coverage

```bash
./mvnw clean test jacoco:report
```

The coverage report will be generated in `target/site/jacoco/index.html`

### Backend Test Structure

```
application/src/test/java/
├── controller/           # REST Controller tests
│   ├── AuthRestControllerTest.java
│   ├── TaskRestControllerEnhancedTest.java
│   ├── ListRestControllerTest.java
│   ├── UserRestControllerTest.java
│   └── HealthCheckRestControllerTest.java
├── service/             # Service layer tests
│   ├── AuthServiceTest.java
│   ├── TaskServiceTest.java
│   ├── ListServiceTest.java
│   └── RoleServiceTest.java
└── BaseIntegrationTest.java
```

### Backend Test Categories

1. **Unit Tests**: Test individual service methods in isolation using mocks
2. **Integration Tests**: Test controller endpoints with mocked services
3. **Security Tests**: Verify authentication and authorization

### Key Backend Tests

- **AuthServiceTest**: Authentication, registration, token validation, user roles
- **TaskServiceTest**: Task CRUD operations, action management, permissions
- **ListServiceTest**: List CRUD operations, element management
- **RoleServiceTest**: Role creation, deletion, and validation
- **Controller Tests**: HTTP endpoint testing with security context

## Frontend Tests (React/Jest)

### Running Frontend Tests

```bash
cd client
npm test
```

### Running Tests in Watch Mode

```bash
npm test -- --watch
```

### Running Tests with Coverage

```bash
npm test -- --coverage --watchAll=false
```

Coverage report will be in `client/coverage/lcov-report/index.html`

### Running Specific Tests

```bash
npm test -- authService.test.js
npm test -- --testNamePattern="should successfully login"
```

### Frontend Test Structure

```
client/src/
├── services/
│   ├── authService.test.js
│   ├── taskService.test.js
│   └── listService.test.js
├── components/
│   ├── auth/
│   │   ├── LoginPage.test.js
│   │   ├── RegisterPage.test.js
│   │   └── OAuth2Login.test.js
│   └── common/
│       └── Noty.test.js
└── redux/
    └── slices/
        └── authSlice.test.js
```

### Frontend Test Categories

1. **Service Tests**: Test API calls, data transformations, and caching
2. **Component Tests**: Test UI rendering, user interactions, and state changes
3. **Redux Tests**: Test state management, actions, and reducers

### Key Frontend Tests

- **authService.test.js**: Login, register, OAuth2, token management
- **taskService.test.js**: Task CRUD, actions, caching mechanism
- **listService.test.js**: List CRUD, element management
- **LoginPage.test.js**: Login form validation and submission
- **RegisterPage.test.js**: Registration form validation
- **OAuth2Login.test.js**: OAuth2 provider integration
- **authSlice.test.js**: Redux state management for authentication

## Test Coverage

### Current Coverage Status

#### Backend (Java)
- ✅ Services: 80%+
  - AuthService: Comprehensive
  - TaskService: Comprehensive
  - ListService: Comprehensive
  - RoleService: Complete
- ✅ Controllers: 70%+
  - Auth endpoints: Complete
  - Task endpoints: Complete
  - List endpoints: Complete
  - Health check: Complete

#### Frontend (React)
- ✅ Services: 85%+
  - authService: Comprehensive
  - taskService: Complete
  - listService: Complete
- ✅ Components: 60%+
  - Login/Register: Complete
  - OAuth2: Complete
- ✅ Redux: 90%+
  - authSlice: Complete

## Writing New Tests

### Backend Test Template

```java
@ExtendWith(MockitoExtension.class)
public class YourServiceTest {
    
    @Mock
    private YourRepository repository;
    
    @InjectMocks
    private YourService service;
    
    @BeforeEach
    void setUp() {
        // Setup test data
    }
    
    @Test
    @DisplayName("Should do something when condition is met")
    void testMethodName() {
        // Arrange
        when(repository.method()).thenReturn(value);
        
        // Act
        Result result = service.method();
        
        // Assert
        assertNotNull(result);
        assertEquals(expected, result);
        verify(repository).method();
    }
}
```

### Frontend Service Test Template

```javascript
import yourService from '../yourService';
import axios from 'axios';

jest.mock('axios');

describe('yourService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should perform operation successfully', async () => {
    // Arrange
    const mockData = { id: 1, name: 'Test' };
    axios.get.mockResolvedValue({ data: mockData });

    // Act
    const result = await yourService.getData();

    // Assert
    expect(result).toEqual(mockData);
    expect(axios.get).toHaveBeenCalledWith(/* expected URL */);
  });
});
```

### Frontend Component Test Template

```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import YourComponent from '../YourComponent';

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent />);
    
    expect(screen.getByText(/expected text/i)).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    render(<YourComponent />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/result/i)).toBeInTheDocument();
    });
  });
});
```

## Best Practices

### General
- Write descriptive test names that explain what is being tested
- Follow AAA pattern: Arrange, Act, Assert
- Test one thing per test method
- Use meaningful variable names
- Keep tests independent and isolated

### Backend
- Use `@DisplayName` for clear test descriptions
- Mock external dependencies
- Test both success and failure scenarios
- Verify method calls with `verify()`
- Test security and permissions

### Frontend
- Use data-testid for stable selectors when needed
- Test user behavior, not implementation details
- Mock API calls and external services
- Test loading and error states
- Use `waitFor()` for asynchronous operations

## Continuous Integration

Tests are automatically run on:
- Pull request creation
- Push to main branch
- Before deployment

Ensure all tests pass before merging code.

## Troubleshooting

### Backend Issues

**Issue**: Tests fail due to database connection
- **Solution**: Check `application-test.properties` configuration

**Issue**: MockMvc returns 401
- **Solution**: Add `@WithMockUser` or configure security context

### Frontend Issues

**Issue**: "Cannot find module" error
- **Solution**: Run `npm install` to install dependencies

**Issue**: Tests timeout
- **Solution**: Increase timeout in jest.config.js or use `waitFor` with timeout option

**Issue**: Async tests fail
- **Solution**: Ensure proper use of `async/await` and `waitFor`

## Additional Resources

- [JUnit 5 Documentation](https://junit.org/junit5/docs/current/user-guide/)
- [Mockito Documentation](https://javadoc.io/doc/org.mockito/mockito-core/latest/org/mockito/Mockito.html)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

## Contact

For questions about testing, please contact the development team or create an issue in the repository.
