# Controllers

- [Architecture](#architecture)
- [Directory Structure](#directory-structure)
- [Controller Types](#controller-types)
- [Route Registration](#route-registration)
- [Authentication Patterns](#authentication-patterns)
- [Transaction Management](#transaction-management)
- [Validation and Error Handling](#validation-and-error-handling)
- [TSOA Integration](#tsoa-integration)
- [Implementation Guidelines](#implementation-guidelines)

## Architecture

Controllers follow clean architecture principles as the **interface layer**, handling HTTP concerns while delegating business logic to the domain layer. Each controller represents a single API endpoint and coordinates between:

- **HTTP Layer**: Request/response handling, validation, authentication
- **Domain Layer**: Business logic through [DAO interfaces](../domain/README.md) 
- **DTO Layer**: Request/response contracts with [validation](../dto/README.md)

Controllers remain **database-agnostic** by only depending on domain interfaces, never on specific implementations.

## Directory Structure

Controllers mirror business domains with action-based organization:

```
src/controllers/
├── routes.ts                         -> Main router configuration and registration
├── CustomController.ts               -> Base controller classes
├── {domain}/
│   ├── routes.ts                     -> Route registration module
│   ├── {action}/
│   │   └── {Domain}{Action}{Method}Controller.ts
│   └── {subdomain}/
│       └── {action}/
│           └── {Domain}{Subdomain}{Action}{Method}Controller.ts
```

**Examples**:
- `auth/login/AuthLoginPostController.ts` → `POST /auth/login`
- `project/create/ProjectCreatePostController.ts` → `POST /project`
- `auth/token/refresh/AuthTokenRefreshPostController.ts` → `POST /auth/token/refresh`

## Controller Types

### Base Controller Classes

All controllers must extend one of these abstract base classes located in [`CustomController.ts`](./CustomController.ts):

#### BaseCustomController
For simple operations that don't require database transactions:

```typescript
export class HealthGetController extends BaseCustomController {
  constructor(envVars: EnvVars, containerDAO: ContainerDAO<unknown>) {
    super(envVars, containerDAO);
  }
  
  // Read-only operations, simple business logic
}
```

**Use cases**:
- Health checks and status endpoints
- Read-only data retrieval
- Simple operations without database writes
- Authentication validation (token verification)

#### TransactionAbstractController
For operations requiring database transactions:

```typescript
export class ProjectCreatePostController extends TransactionAbstractController {
  constructor(
    envVars: EnvVars, 
    containerDAO: ContainerDAO<unknown>,
    session: DatabaseSession<unknown>
  ) {
    super(envVars, containerDAO, session);
  }
  
  // Write operations, complex business logic requiring atomicity
}
```

**Use cases**:
- Create, update, delete operations
- Multi-step database operations requiring atomicity
- Operations that must maintain data consistency
- Complex business logic involving multiple DAOs

### Dependency Injection Pattern

Both base classes enforce dependency injection through constructor parameters:

- **`envVars`**: Application configuration and environment variables
- **`containerDAO`**: Access to all DAO instances for data layer operations
- **`session`** (TransactionAbstractController only): Database session for transaction management

This pattern enables:
- **Testability**: Easy mocking of dependencies in unit tests
- **TSOA Compatibility**: Method signatures remain clean for OpenAPI generation
- **Separation of Concerns**: Infrastructure dependencies isolated from business logic

### TSOA Decorators

All controllers use TSOA decorators for automatic OpenAPI documentation:

```typescript
@Route('project')           // Base route
@Tags('Project')           // OpenAPI grouping
export class ProjectCreatePostController extends TransactionAbstractController {
  
  @Post()                  // HTTP method + sub-route
  @Security('Bearer')      // Authentication requirement
  public async createProject(@Body() request: CreateProjectRequest): Promise<ProjectResponse> {
    // Implementation
  }
}
```

## Route Registration

### Main Router Configuration

The main [`routes.ts`](./routes.ts) file in the controllers directory serves as the central router configuration that orchestrates all domain routes.

This centralized approach provides:
- **Dependency Injection**: All dependencies are passed to domain route modules
- **Modularity**: Clean separation of domain-specific route logic
- **Consistency**: Uniform registration pattern across all domains

### Modular Registration

Each domain has its own `routes.ts` module that exports a `register{Domain}Routes` function:

```typescript
export function registerProjectRoutes(
  router: Router,
  envVars: EnvVars,
  containerDAO: ContainerDAO<unknown>,
  databaseSessionProducer: DatabaseSessionProducer<unknown>,
  timestampProducer: TimestampProducer
): void {
  // Register all domain routes
}
```

### Route Patterns

**Read Operations** (no transaction):
```typescript
router.get('/endpoint', 
  authMiddleware(envVars),                    // Authentication
  asyncHandler(async (req: Request, res: Response) => {
    res.json(await new Controller().method());
  })
);
```

**Write Operations** (with transaction):
```typescript
router.post('/endpoint',
  authMiddleware(envVars),                    // Authentication  
  validateRequestBody(RequestDTO),            // Validation
  dbTransactionHandler(
    databaseSessionProducer,
    async (session, req) => {
      const data = await new Controller(session).method(req.body);
      return { statusCode: 201, data };
    }
  )
);
```

## Authentication Patterns

### Public Endpoints
- **Health checks**: No authentication required
- **User registration/login**: No authentication (creates authentication)

### Protected Endpoints  
- **Project management**: Requires Bearer token authentication
- **Token refresh**: Uses refresh token in request body (not Bearer header)

### Implementation
```typescript
// Route level
router.get('/protected', authMiddleware(envVars), /* handler */);

// Controller level (TSOA)
@Security('Bearer')
public async protectedMethod(): Promise<Response> {
  const user = getAuthenticatedUser(req);  // Extract authenticated user
  // Business logic with user context
}
```

## Transaction Management

### Transaction Requirements

**Require Transactions** (`dbTransactionHandler`):
- Create operations (user registration, project creation)
- Update operations (project updates)
- Delete operations (project deletion)
- Token operations (login, logout, refresh)

**No Transactions** (`asyncHandler`):
- Read operations (get project, list projects, health check)
- Operations that don't modify data

### Transaction Lifecycle and Database Session Management

**CRITICAL**: Each API call that requires transactions creates a **new database transaction** to ensure proper isolation and consistency.

The transaction lifecycle is automatically managed by the `dbTransactionHandler`:

```typescript
router.post('/endpoint',
  middlewares,
  dbTransactionHandler(
    databaseSessionProducer,  // Injected database-specific session producer
    async (session, req) => {
      // Fresh transaction session created for this API call
      const controller = new WriteController(envVars, containerDAO, session);
      return await controller.method(req.body);
    }
  )
);
```

Controllers receive the session and pass it to DAO operations:

```typescript
const project = await this.containerDAO.projectDAO.createProject(
  this.session,  // Database session for this specific transaction
  name,
  gitUrl,
  userId,
  timestamp
);
```

### Database Session Producer Pattern

The `DatabaseSessionProducer` provides database-agnostic session management through dependency injection. This pattern enables:

- **Transaction Isolation**: Each API call operates in its own transaction context
- **Database Technology Independence**: Session handling works across different DBMS implementations
- **Testability**: Sessions can be easily mocked in unit tests

For detailed information about session management, the database-agnostic design, and the dependency injection pattern, see the [Domain Layer documentation](../domain/README.md#database-session-management).

## Validation and Error Handling

### Input Validation
- **Route Level**: `validateRequestBody(DTOClass)` middleware
- **Path Parameters**: `validateRequestParams(DTOClass)` middleware  
- **DTO Level**: `class-validator` decorators in [DTO classes](../dto/README.md)

### Error Handling
- **Business Errors**: Throw `AppError(message, statusCode)`
- **Database Errors**: Automatically handled by transaction system
- **Validation Errors**: Automatically handled by validation middleware

```typescript
// Business logic errors
if (!project) {
  throw new AppError('Project not found', 404);
}

// Access control
if (project.userId !== user.userId) {
  throw new AppError('Access denied', 403);
}
```

## TSOA Integration

### OpenAPI Documentation
Controllers automatically generate OpenAPI documentation via TSOA:

- **@Route('path')**: Base route path
- **@Tags('Group')**: Swagger UI grouping
- **@Security('Bearer')**: Authentication requirements
- **@Get/@Post/@Put/@Delete**: HTTP methods
- **@Body/@Path/@Query**: Parameter binding

### Authentication in Swagger
The `@Security('Bearer')` decorator integrates with `tsoa.json` configuration to show Bearer token requirements in Swagger UI.

## Implementation Guidelines

### Shared Utility Methods

When working with APIs that operate on the same business domain, **common patterns and operations often emerge across multiple controllers**. To maintain code quality and follow DRY principles, create shared utility classes within each domain:

#### Domain-Specific Utilities

Create utility classes like `{Domain}Utils.ts` within domain directories to centralize repeated logic.

#### Common Patterns to Extract

**Frequent operations that benefit from shared utilities:**

1. **Entity Verification**: Finding entities and validating existence
2. **Access Control**: Ownership verification and permission checks  
3. **DTO Conversion**: Entity-to-response transformations
4. **Validation Logic**: Complex business rule validations
5. **Error Handling**: Domain-specific error creation patterns

#### Benefits of Shared Utilities

- **DRY Principle**: Eliminates code duplication across controllers
- **Consistency**: Uniform error messages and response formats
- **Maintainability**: Single place to update common logic
- **Testability**: Utilities can be unit tested independently
- **Readability**: Controllers focus on their specific responsibilities

#### Usage in Controllers

Controllers should use these utilities to simplify their implementation.

This approach keeps controllers lean, focused, and maintainable while ensuring consistent behavior across the API.

### Controller Responsibilities
1. **HTTP Concerns**: Request/response handling, status codes
2. **Authentication**: Extract and validate user context
3. **Validation**: Ensure input compliance via DTOs
4. **Orchestration**: Coordinate domain operations
5. **Error Translation**: Convert domain errors to HTTP responses

### Best Practices
1. **Appropriate Base Class**: Extend `BaseCustomController` for read operations, `TransactionAbstractController` for write operations
2. **Dependency Injection**: Inject all dependencies through constructor (never in method parameters)
3. **Database Agnostic**: Only use domain interfaces, never implementations
4. **Stateless**: Controllers should not maintain state between requests
5. **Error Handling**: Use AppError for consistent error responses
6. **Transaction Boundaries**: Use appropriate base controller for operation type
7. **Authentication Context**: Always validate user access for protected resources
8. **TSOA Documentation**: Properly annotate all endpoints for API documentation

### Integration Points
- **Domain Layer**: Business logic via [DAO interfaces](../domain/README.md)
- **DTO Layer**: Request/response contracts with [validation](../dto/README.md)
- **Middleware**: Authentication, validation, error handling, transactions
- **Routes**: Modular registration with proper middleware composition