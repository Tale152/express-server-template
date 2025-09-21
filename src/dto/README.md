# Data Transfer Objects (DTOs)

- [Purpose](#purpose)
- [Directory Structure](#directory-structure)
- [Naming Conventions](#naming-conventions)
- [Request vs Response DTOs](#request-vs-response-dtos)
- [Validation Guidelines](#validation-guidelines)
- [Documentation Standards](#documentation-standards)
- [Best Practices](#best-practices)

## Purpose

DTOs define the structure and validation rules for data exchanged between client and server. They serve as the API contract, ensuring type safety and proper input validation while maintaining separation from business logic.

## Directory Structure

DTOs mirror the controller directory structure to maintain consistency and discoverability:

```
src/dto/
├── {domain}/
│   ├── {action}/
│   │   ├── {Action}Request.ts
│   │   └── {Action}Response.ts
│   ├── {SharedType}Response.ts
│   └── {Domain}Params.ts
```

**Example**: `auth/login/LoginRequest.ts` corresponds to `controllers/auth/login/AuthLoginPostController.ts`

## Naming Conventions

- **Request Classes**: `{Action}Request` (e.g., `LoginRequest`, `CreateProjectRequest`)
- **Response Interfaces**: `{Action}Response` or `{Entity}Response` (e.g., `AuthResponse`, `ProjectResponse`)
- **Parameter Classes**: `{Entity}Params` (e.g., `ProjectParams`)
- **List Responses**: `{Entity}ListResponse` (e.g., `ProjectListResponse`)

## Request vs Response DTOs

### Request DTOs
- Use **classes** with `class-validator` decorators
- Include validation rules and error messages
- Handle input data from client

### Response DTOs
- Use **interfaces** for type definitions
- Define expected response structure
- No validation needed (output data)

## Validation Guidelines

1. **Use class-validator decorators** on request classes
2. **Provide clear error messages** for each validation rule
3. **Apply appropriate constraints** (length, format, required fields)
4. **Use conditional validation** (`ValidateIf`) for optional fields
5. **Validate path parameters** with dedicated parameter classes

## Documentation Standards

1. **Add JSDoc to all DTOs** with class/interface descriptions
2. **Document each field** with purpose and examples when helpful
3. **Use `@example` tags** for realistic sample values
4. **Integrate with TSOA** for automatic OpenAPI documentation

## Best Practices

1. **Mirror Controller Structure**: Keep DTOs organized like controllers for easy navigation
2. **Single Responsibility**: Each DTO should serve one specific endpoint or shared purpose
3. **Type Safety First**: Leverage TypeScript for compile-time guarantees
4. **Validate at Boundaries**: All incoming data must be validated
5. **Keep It Simple**: DTOs should only handle data structure and validation
6. **Consistent Patterns**: Follow established naming and organizational conventions
7. **Shared Types**: Create shared response DTOs when multiple endpoints return similar data
