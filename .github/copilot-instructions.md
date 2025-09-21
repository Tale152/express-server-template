## Project Overview

A production-ready Express.js server with TypeScript, MongoDB, and comprehensive security features. The project implements clean architecture with clear separation of layers and database-agnostic design.

### Core Technologies
- **TypeScript** (ES6, strict mode)
- **Express.js** with comprehensive security middleware
- **MongoDB** with Mongoose ODM (replaceable implementation)
- **JWT** for stateless authentication
- **TSOA** for automatic OpenAPI/Swagger generation
- **Jest** for testing (unit + integration)
- **Docker** for containerization

## Project Architecture

### Architectural Principles

1. **Clean Architecture**: Strict separation between responsibility layers
2. **Database Agnostic**: Interface-based design to allow database switching
3. **Dependency Injection**: All dependencies are injected via constructor
4. **SOLID Principles**: Single responsibility, dependency inversion, etc.
5. **Testability First**: Code designed to be easily testable

### Layer Structure

```
src/
├── controllers/     # HTTP Layer - request/response handling
├── domain/         # Business Logic Layer - domain logic and data access
├── dto/           # Data Transfer Objects - API contracts with validation
├── setup/         # Configuration Layer - middleware and configuration
└── utils/         # Utility Layer - reusable services
```

## FUNDAMENTAL Development Rules

### 1. Controller Base Classes Extension

**CRITICAL**: All controllers MUST extend one of the abstract base classes:

- **`BaseCustomController`**: For READ-ONLY operations (without database transactions)
  - Health checks, data reading, token validation
  - NEVER modifies the database

- **`TransactionAbstractController`**: For WRITE operations (with database transactions)  
  - Create, Update, Delete operations
  - Operations requiring atomicity
  - ALWAYS receives `DatabaseSession` in constructor

```typescript
// ✅ CORRECT - Read operation
export class HealthGetController extends BaseCustomController {
  constructor(envVars: EnvVars, containerDAO: ContainerDAO<unknown>) {
    super(envVars, containerDAO);
  }
}

// ✅ CORRECT - Write operation  
export class ProjectCreatePostController extends TransactionAbstractController {
  constructor(
    envVars: EnvVars,
    containerDAO: ContainerDAO<unknown>, 
    session: DatabaseSession<unknown>
  ) {
    super(envVars, containerDAO, session);
  }
}
```

### 1.1. Controller Shared Utilities

**CRITICAL**: When working with APIs that operate on the same business domain, **common patterns and operations often emerge across multiple controllers**. To maintain code quality and follow DRY principles, create shared utility classes within each domain.

#### Domain-Specific Utilities Pattern

Create utility classes like `{Domain}Utils.ts` within domain directories to centralize repeated logic:

```typescript
// ✅ CORRECT - Example: ProjectUtils.ts
export class ProjectUtils {
  /**
   * Finds a project by ID or throws a 404 error if not found
   */
  static async findProjectOr404(
    containerDAO: ContainerDAO<unknown>,
    projectId: string
  ): Promise<Project> {
    const project = await containerDAO.projectDAO.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }
    return project;
  }

  /**
   * Checks if a project is owned by the authenticated user or throws a 403 error
   */
  static isProjectOwnedByUserOr403(project: Project, user: JWTPayload): void {
    if (project.userId !== user.userId) {
      throw new AppError('Access denied', 403);
    }
  }

  /**
   * Converts a Project entity to a ProjectResponse DTO
   */
  static toProjectResponse(project: Project): ProjectResponse {
    return {
      id: project.id,
      name: project.name,
      gitUrl: project.gitUrl,
      userId: project.userId,
      createdAt: project.createdAt!,
      updatedAt: project.updatedAt!
    };
  }

  /**
   * Combined utility that finds a project and verifies ownership in one call
   */
  static async findProjectAndVerifyOwnership(
    containerDAO: ContainerDAO<unknown>,
    projectId: string,
    user: JWTPayload
  ): Promise<Project> {
    const project = await this.findProjectOr404(containerDAO, projectId);
    this.isProjectOwnedByUserOr403(project, user);
    return project;
  }
}
```

#### Common Patterns to Extract into Utilities

**Frequent operations that benefit from shared utilities:**

1. **Entity Verification**: Finding entities and validating existence (`findEntityOr404`)
2. **Access Control**: Ownership verification and permission checks (`isOwnedByUserOr403`)
3. **DTO Conversion**: Entity-to-response transformations (`toEntityResponse`)
4. **Validation Logic**: Complex business rule validations
5. **Error Handling**: Domain-specific error creation patterns
6. **Combined Operations**: Multi-step verifications (`findAndVerifyOwnership`)

#### Benefits of Shared Utilities

- **DRY Principle**: Eliminates code duplication across controllers
- **Consistency**: Uniform error messages and response formats  
- **Maintainability**: Single place to update common logic
- **Testability**: Utilities can be unit tested independently
- **Readability**: Controllers focus on their specific responsibilities

#### Usage in Controllers

Controllers should use these utilities to simplify their implementation:

```typescript
// ✅ CORRECT - Using shared utilities
export class ProjectGetController extends BaseCustomController {
  public async getProject(@Path() projectId: string, @Request() req: ExpressRequest): Promise<ProjectResponse> {
    const user = getAuthenticatedUser(req);
    
    // Use shared utilities instead of duplicating logic
    const project = await ProjectUtils.findProjectAndVerifyOwnership(
      this.containerDAO, 
      projectId, 
      user
    );
    
    return ProjectUtils.toProjectResponse(project);
  }
}

// ❌ WRONG - Duplicating logic across controllers
export class ProjectGetController extends BaseCustomController {
  public async getProject(@Path() projectId: string, @Request() req: ExpressRequest): Promise<ProjectResponse> {
    const user = getAuthenticatedUser(req);
    
    // This logic would be repeated in every controller
    const project = await this.containerDAO.projectDAO.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }
    if (project.userId !== user.userId) {
      throw new AppError('Access denied', 403);
    }
    
    return {
      id: project.id,
      name: project.name,
      // ... more repeated mapping logic
    };
  }
}
```

### 2. STRICT Naming Conventions

#### Controller Naming
**Pattern**: `{Domain}{Action}{HttpMethod}Controller.ts`
- `AuthLoginPostController.ts` → `POST /auth/login`
- `ProjectCreatePostController.ts` → `POST /project`
- `ProjectListGetController.ts` → `GET /project`

#### DTO Naming
- **Request Classes**: `{Action}Request` (with class-validator validation)
- **Response Interfaces**: `{Action}Response` or `{Entity}Response`
- **Parameters**: `{Entity}Params`

#### Database Entities
- Interfaces are in domain layer (`domain/interfaces/entities/`)
- MongoDB implementations are in `domain/mongodb/entities/`
- Pattern: `Omit<EntityInterface, 'id'>` to avoid conflicts with MongoDB `_id`

### 3. Dependency Injection Pattern

**ALWAYS** inject dependencies via constructor, NEVER create them directly:

```typescript
// ✅ CORRECT
constructor(
  private envVars: EnvVars,
  private containerDAO: ContainerDAO<unknown>,
  private session?: DatabaseSession<unknown>
) {}

// ❌ WRONG
const dao = new SomeDAO(); // Don't create dependencies directly
```

### 4. Database Agnostic Design

**CRITICAL**: Controllers and business logic must NEVER depend on database-specific implementations:

```typescript
// ✅ CORRECT - depends only on interfaces
const user = await this.containerDAO.userDAO.findById(session, userId);

// ❌ WRONG - depends on MongoDB specific
const user = await UserModel.findById(userId);
```

### 5. Transaction Management

#### Route Level
- **Read operations**: Use `asyncHandler`
- **Write operations**: Use `dbTransactionHandler`

```typescript
// ✅ Read operation
router.get('/project/:id', 
  authMiddleware(envVars),
  asyncHandler(async (req, res) => { /* ... */ })
);

// ✅ Write operation
router.post('/project',
  authMiddleware(envVars),
  validateRequestBody(CreateProjectRequest),
  dbTransactionHandler(databaseSessionProducer, async (session, req) => {
    // Controller receives session automatically
  })
);
```

### 6. Validation Rules

#### Input Validation
- **Request DTOs**: ALWAYS use `class-validator` decorators
- **Route Level**: Apply `validateRequestBody(DTOClass)` middleware
- **Error Messages**: Always provide clear error messages

```typescript
// ✅ CORRECT
export class CreateProjectRequest {
  @IsString({ message: 'Name must be a string' })
  @Length(1, 100, { message: 'Name must be between 1 and 100 characters' })
  name!: string;
}
```

#### Error Handling
- Use `AppError(message, statusCode)` for business errors
- Never expose internal database details
- Structured logging for debugging

#### Postman Collection Update
- **Critical**: Every DTO modification or new API creation MUST be reflected in the Postman collection
- Update the Postman collection in the /postman directory
- Include updated request/response examples
- Test the collection after every modification to ensure functionality

### 7. Security Requirements

#### Authentication
- **JWT Bearer Token** for protected endpoints
- **Refresh Token** for session renewal  
- **Rate Limiting** multi-level (general + auth endpoints)

#### Input Security
- **XSS Prevention**: Automatic sanitization with DOMPurify
- **Input Validation**: Strict validation of all inputs
- **CORS**: Environment-specific configuration

### 8. Testing Guidelines

#### Unit Tests
- **Isolation**: Mock all dependencies
- **Constructor Injection**: Facilitates mocking
- **Database Agnostic**: Test business logic without real database

#### Integration Tests  
- **MongoDB Memory Server**: For realistic testing
- **Complete Flows**: Complete end-to-end tests
- **Transaction Testing**: Verify rollback and atomicity

### 9. Code Quality Standards

#### Clean and Concise Code
- **Readability First**: Code must be clear and self-documenting
- **Single Responsibility**: Each function/class must have a single responsibility
- **DRY Principle**: Avoid code duplication
- **KISS Principle**: Keep code simple and direct

#### Copy-Paste Detection
- **Mandatory**: Run `npm run cpd` after every development iteration
- **Threshold**: Keep duplication under 5% (configured in package.json)
- **Refactoring**: If CPD detects duplications, refactor into shared functions/utilities
- **Continuous Improvement**: Use CPD reports to identify improvement opportunities

#### Documentation Requirements
- **English Only**: All code documentation MUST be in English
- **JSDoc**: Every class, method, and public function must have complete JSDoc
- **No @example Tags**: Avoid using @example in JSDoc comments to keep documentation concise
- **Inline Comments**: Explain complex logic with inline comments
- **README Updates**: Update documentation when changing behaviors
- **Type Documentation**: Document complex types and interfaces

## File Structure and Conventions

### Directory Structure
Each layer has its specific structure:

```
src/controllers/{domain}/{action}/{Domain}{Action}{Method}Controller.ts
src/dto/{domain}/{action}/{Action}Request.ts | {Action}Response.ts
src/domain/interfaces/{entities|dao|...}/
src/domain/mongodb/{entities|dao|...}/
src/setup/middleware/{middlewareName}.ts
src/utils/{ServiceName}.ts
```

### Import Patterns
- **Relative imports** within the same layer
- **Absolute imports** for cross-layer dependencies
- **Interface imports** before implementations

## Scripts and Commands

### Development
```bash
npm run dev              # Development with hot reload
npm run build            # Production build (generates OpenAPI + compiles TS)
npm start                # Start production server
```

### Database
```bash
npm run mongo:start      # Start local MongoDB replica set
npm run mongo:stop       # Stop local MongoDB
```

### Testing
```bash
npm test                 # All tests
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
npm run test:coverage    # Tests with coverage report
```

### Code Quality
```bash
npm run analyze          # ESLint analysis
npm run fix              # Auto-fix ESLint issues
npm run cpd              # Copy-paste detection (run after every development iteration)
```

## Specific ESLint Rules

The project has strict ESLint rules:

- **Indentation**: 2 spaces
- **Quotes**: Single quotes mandatory
- **Max line length**: 120 characters
- **Max file lines**: 200 lines (excluding comments)
- **Camelcase**: Mandatory
- **Semicolons**: Mandatory
- **Object spacing**: `{ key: value }` with spaces

## TypeScript Configuration

- **Strict mode**: Enabled
- **Decorators**: Enabled for class-validator and TSOA
- **Target**: ES6
- **Module**: CommonJS
- **Output**: `./build` directory

## Docker and Deployment

### Development
```bash
docker-compose up --build  # Complete environment with MongoDB
```

### Production
- **Multi-stage Dockerfile** for size optimization
- **Non-root user** for security
- **Integrated health checks**

## Security and Best Practices

### Security Layers
1. **Helmet**: Security headers (CSP, HSTS, etc.)
2. **CORS**: Cross-origin protection
3. **Rate Limiting**: Anti brute-force and DDoS
4. **Input Sanitization**: XSS prevention
5. **JWT**: Stateless authentication
6. **Password Hashing**: PBKDF2 + salt

### Performance
- **Response Compression**: Automatic gzip/deflate
- **Connection Pooling**: Optimized MongoDB  
- **Middleware Ordering**: Performance-optimized stack

## Common Mistakes to Avoid

### ❌ NEVER do:
1. Create DAOs or dependencies directly in controllers
2. Use MongoDB-specific implementations outside domain/mongodb
3. Extend classes other than BaseCustomController/TransactionAbstractController
4. Forget session in write controllers
5. Mix read/write operations in the same controller
6. Hardcode configurations (always use EnvVars)
7. Expose internal errors in responses
8. Skip input validation
9. Use `any` type in TypeScript
10. Violate naming conventions

### ✅ ALWAYS do:
1. Dependency injection via constructor
2. Extend appropriate base classes
3. Use domain interfaces for database operations
4. Apply validation middleware
5. Handle errors with AppError
6. Write tests for new features
7. Follow strict naming conventions
8. Maintain separation of concerns
9. Document APIs with TSOA decorators
10. Use TypeScript strict mode

## API Documentation

- **Swagger UI**: Available at `/docs` when server is running
- **Auto-generation**: Via TSOA from controller decorators
- **Postman Collection**: Available in `postman/` directory
- **OpenAPI 3.0**: Spec generated in `public/swagger.json`

---

**IMPORTANT**: This project follows strict clean architecture principles. Always respect layer separation and naming conventions. Violating these principles can compromise code maintainability and testability.