# Setup Layer

The setup layer contains all the configuration and initialization code for the Express.js application. This layer is responsible for:

- Environment variable management and validation
- Middleware configuration and initialization
- Logging setup and configuration
- API documentation setup
- CORS configuration
- Application-wide security and validation

## Directory Structure

```
src/setup/
├── README.md                    # This documentation
├── EnvVars.ts                   # Environment variables configuration
├── init_cors.ts                 # CORS setup and configuration
├── logger.ts                    # Winston logging configuration
├── swagger.ts                   # Swagger/OpenAPI documentation setup
└── middleware/                  # Express middleware components
    ├── authMiddleware.ts        # JWT authentication middleware
    ├── classValidation.ts       # DTO validation with class-validator
    ├── compression.ts           # Response compression for bandwidth optimization
    ├── errorHandler.ts          # Centralized error handling
    ├── inputSanitization.ts     # XSS prevention and input sanitization
    └── rateLimiters.ts          # Rate limiting for API protection
```

## Core Configuration Files

### EnvVars.ts
Centralized environment variable management with validation and type safety.

**Features:**
- Environment variable validation on startup
- Type-safe configuration object
- Support for development, staging, and production environments
- Database connection string management
- JWT secret and expiration configuration
- Port and host configuration

**Usage:**
```typescript
import { getEnvVars } from './setup/EnvVars';
const envVars = getEnvVars();
```

### logger.ts
Winston-based logging system with structured logging and multiple transports.

**Features:**
- Structured JSON logging for production
- Console logging for development
- Multiple log levels (error, warn, info, debug)
- Request/response logging integration
- Error stack trace capture
- Configurable log formats

**Usage:**
```typescript
import { logger } from './setup/logger';
logger.info('Application started');
```

### init_cors.ts
Cross-Origin Resource Sharing (CORS) configuration for API security.

**Features:**
- Environment-specific CORS policies
- Configurable allowed origins
- Credential support configuration
- HTTP methods and headers control
- Preflight request handling

### swagger.ts
Swagger/OpenAPI documentation generation and serving setup.

**Features:**
- Automatic API documentation generation
- TSOA integration for controller documentation
- Swagger UI serving at `/docs` endpoint
- OpenAPI 3.0 specification
- Authentication documentation

## Middleware Components

### authMiddleware.ts
JWT-based authentication middleware for protecting API endpoints.

**Features:**
- JWT token validation
- User session verification
- Request context enhancement with user data
- Configurable token expiration
- Error handling for authentication failures

**Applied to:** Protected API endpoints requiring user authentication

### classValidation.ts
Request validation middleware using class-validator and DTOs.

**Features:**
- DTO-based request validation
- Automatic error response generation
- Type-safe request body validation
- Nested object validation support
- Custom validation decorators

**Applied to:** API endpoints with request body validation requirements

### errorHandler.ts
Centralized error handling middleware for consistent error responses.

**Features:**
- AppError handling with structured responses
- Mongoose validation error formatting
- JWT error handling
- Environment-specific error details
- Request logging for debugging
- HTTP status code management

**Applied to:** All routes as the final error handler

### compression.ts
Response compression middleware for bandwidth optimization.

**Features:**
- Gzip/deflate compression for HTTP responses
- Intelligent content-type filtering
- Size threshold optimization (1KB minimum)
- Environment-specific compression levels
- Client opt-out support
- Streaming response detection
- 70-85% bandwidth reduction for JSON APIs

**Applied to:** All routes for automatic response compression

### inputSanitization.ts
XSS prevention and input sanitization middleware.

**Features:**
- DOMPurify-based HTML sanitization
- Deep object and array sanitization
- Request body, query, and params cleaning
- XSS attack prevention
- Data type preservation during sanitization

**Applied to:** All routes for comprehensive input security

### rateLimiters.ts
Rate limiting middleware for API protection against abuse.

**Features:**
- General API rate limiting
- Stricter authentication endpoint limits
- Redis-based rate limiting (when available)
- Memory-based fallback
- Configurable time windows and limits
- Custom rate limit headers

**Applied to:** All API routes with stricter limits on auth endpoints

## Integration with Application

The setup layer is integrated into the main application through several key points:

### 1. Environment Initialization
```typescript
// app.ts
import { getEnvVars } from './setup/EnvVars';
const envVars = getEnvVars();
```

### 2. Middleware Stack Registration
```typescript
// app.ts
import { initCors } from './setup/init_cors';
import { sanitizeInput } from './setup/middleware/inputSanitization';
import { errorHandler } from './setup/middleware/errorHandler';

app.use(initCors(envVars));
app.use(sanitizeInput);
app.use(errorHandler);
```

### 3. Route-Level Middleware
```typescript
// routes.ts
import { authMiddleware } from './setup/middleware/authMiddleware';
import { validateRequestBody } from './setup/middleware/classValidation';

router.post('/protected', authMiddleware(envVars), validateRequestBody(RequestDTO), handler);
```

### 4. Documentation Setup
```typescript
// app.ts
import { setupSwagger } from './setup/swagger';
setupSwagger(app);
```

## Security Features

The setup layer implements multiple layers of security:

1. **Input Sanitization**: Prevents XSS attacks through HTML sanitization
2. **Rate Limiting**: Protects against brute force and DDoS attacks
3. **Authentication**: JWT-based secure user authentication
4. **CORS**: Controlled cross-origin access
5. **Error Handling**: Prevents information leakage through error responses
6. **Validation**: Strong input validation with type safety

## Configuration Patterns

### Environment-Specific Behavior
Most setup components adapt their behavior based on the environment:

- **Development**: Verbose logging, relaxed CORS, detailed error messages
- **Production**: Structured logging, strict CORS, minimal error details
- **Testing**: Memory-based services, disabled external dependencies

### Middleware Ordering
The middleware stack follows a specific order for security and functionality:

1. CORS configuration (first)
2. Input sanitization
3. Rate limiting
4. Authentication (route-specific)
5. Validation (route-specific)
6. Business logic
7. Error handling (last)

## Best Practices

### Adding New Middleware
1. Create the middleware file in `setup/middleware/`
2. Add comprehensive TSDoc documentation
3. Export factory functions that accept configuration
4. Handle errors appropriately
5. Add to the appropriate place in the middleware stack

### Environment Variables
1. Add new variables to `EnvVars.ts`
2. Provide validation and default values
3. Document the purpose and expected format
4. Update environment files (.env.example)

### Logging
1. Use structured logging with consistent fields
2. Include request IDs for tracing
3. Log at appropriate levels (error, warn, info, debug)
4. Avoid logging sensitive information

## Dependencies

The setup layer relies on these key dependencies:

- **express**: Web application framework
- **winston**: Logging library
- **cors**: CORS middleware
- **express-rate-limit**: Rate limiting
- **jsonwebtoken**: JWT authentication
- **class-validator**: DTO validation
- **dompurify**: XSS prevention
- **swagger-ui-express**: API documentation
- **tsoa**: OpenAPI generation

## Monitoring and Observability

The setup layer provides observability through:

- **Structured Logging**: All requests and errors are logged
- **Health Checks**: Basic application health monitoring
- **Error Tracking**: Centralized error handling and logging
- **Performance Metrics**: Request timing and rate limit monitoring
- **Security Events**: Authentication failures and suspicious activity

This setup layer provides a robust foundation for a secure, scalable Express.js application with comprehensive middleware, configuration management, and observability features.