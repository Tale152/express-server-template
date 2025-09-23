# Express Server Template

A production-ready Express.js template with TypeScript, MongoDB, and comprehensive security features. This template provides a robust foundation for building scalable REST APIs with clean architecture, automatic documentation, and enterprise-grade security.

## Table of Contents

- [Documentation & LLM Agent Support](#documentation--llm-agent-support)
- [Quick Start](#quick-start)
- [Features Overview](#features-overview)
- [Available Scripts](#-available-scripts)
- [Project Structure](#-project-structure)
- [Docker Setup](#-docker-setup)
- [Architecture Layers](#architecture-layers)
- [Testing](#-testing)
- [Continuous Integration (CI)](#continuous-integration-ci)
- [Security Implementation](#security-implementation)
- [API Documentation & Testing](#api-documentation--testing)

## Documentation & LLM Agent Support

This project contains extensive documentation designed to assist both **developers** and **LLM agents** (like GitHub Copilot, Claude, etc.) in understanding and working with the codebase effectively.

### **Developer Documentation**
- **Comprehensive README**: Complete setup, architecture, and usage instructions
- **Layer-specific Documentation**: Each architectural layer has its own detailed README
- **API Documentation**: Auto-generated Swagger/OpenAPI specifications
- **Code Comments**: Extensive JSDoc comments throughout the codebase
- **Testing Guidelines**: Unit and integration testing patterns and best practices

### **LLM Agent Optimization**
- **[.github/copilot-instructions.md](./.github/copilot-instructions.md)**: Detailed instructions specifically written for AI assistants, containing:
  - Project architecture and design principles
  - Strict development rules and conventions
  - File naming patterns and code organization
  - Common patterns and best practices
  - Security requirements and implementation guidelines
  - Testing approaches and quality standards

This documentation ensures that both human developers and AI assistants can quickly understand the project structure, follow established patterns, and contribute effectively while maintaining code quality and architectural consistency.

## Quick Start

### **Prerequisites**
- Node.js (v18+ recommended)
- MongoDB (for local development)
- Docker & Docker Compose (required for testing, optional for development)

### **Local Development Setup**

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start MongoDB with Replica Set** (Unix/macOS)
   ```bash
   # Use the provided script to start MongoDB with replica set configuration
   npm run mongo:start
   ```
   
   **Note**: The replica set is required for MongoDB transactions. On Windows, you may need to set up MongoDB manually or use Docker.

3. **Run Tests** (Optional - to verify setup)
   ```bash
   # Tests automatically start their own Docker containers if needed
   npm test
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - **API Server**: `http://localhost:8080`
   - **Health Check**: `http://localhost:8080/health`
   - **API Documentation**: `http://localhost:8080/docs`

### **Alternative: Docker Setup**
If you prefer using Docker for a complete isolated environment:

```bash
# Start everything with docker-compose (includes MongoDB)
npm run dev:compose
# Or directly with docker-compose
docker-compose up --build

# Access at http://localhost:8080
```

### **MongoDB Setup Comparison**

**Development (Local MongoDB):**
- Uses `scripts/mongo-rs.js` to manage local MongoDB replica set
- Data persisted in `scripts/mongodb/` directory
- Runs on standard port 27017
- Manual start/stop with `npm run mongo:start/stop`

**Testing (Docker Containers):**
- Uses `docker-compose.test.yml` for isolated test environment
- Temporary data (uses tmpfs for speed)
- Runs on port 27017 (separate network)
- Automatic management by test scripts
- Zero configuration required for developers

## Features Overview

### **Architecture & Design**
- **Clean Architecture**: Domain-driven design with clear separation of concerns
- **TypeScript**: Full type safety with strict configuration
- **Dependency Injection**: Testable architecture with constructor injection
- **Database Agnostic**: Interface-based design supporting multiple databases
- **Modular Structure**: Domain-based organization for scalability

### **Security Features**
- **Multi-layer Security**: Helmet with CSP, XSS protection, input sanitization
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Rate Limiting**: Multi-tier protection against brute force and DDoS attacks
- **Input Validation**: Comprehensive validation with class-validator and DTOs
- **CORS Protection**: Configurable cross-origin access control

### **Performance & Optimization**
- **Response Compression**: Automatic gzip/deflate compression for bandwidth optimization
- **Connection Pooling**: Optimized database connection management
- **Efficient Middleware Stack**: Carefully ordered middleware for optimal request processing

### **API & Documentation**
- **Auto-generated Documentation**: Swagger/OpenAPI 3.0 with TSOA integration
- **Interactive API Explorer**: Swagger UI available at `/docs` endpoint
- **Type-safe DTOs**: Request/response contracts with validation decorators
- **Health Monitoring**: Built-in health check endpoint at `/health`
- **Postman Integration**: Ready-to-use Postman collection and environment

### **Database & Transactions**
- **MongoDB Integration**: Complete MongoDB support with Mongoose
- **Transaction Support**: ACID compliance with automatic session management
- **Clean Data Access**: DAO pattern with interface-based abstraction
- **Connection Management**: Automatic connection lifecycle and graceful shutdown

### **Logging & Monitoring**
- **Structured Logging**: Winston-based logging with multiple transports
- **HTTP Request Logging**: Comprehensive request/response tracking
- **Error Tracking**: Centralized error handling with detailed logging
- **Environment-specific**: Different log levels and formats per environment

### **Development Experience**
- **Hot Reload**: Development server with automatic restart
- **Testing Suite**: Jest configuration with unit and integration tests
- **Code Quality**: ESLint, Prettier, TypeScript strict mode, and copy-paste detection
- **Docker Support**: Complete containerization with docker-compose

## Available Scripts

### **Development Scripts**
```bash
npm run dev              # Start development server with hot reload and auto-compilation
npm run dev:compose      # Start complete development environment with Docker Compose (includes MongoDB)
npm run build            # Build production-ready application (generates OpenAPI spec + compiles TypeScript)
npm start                # Start production server from compiled JavaScript files
```

### **Database Management**
```bash
npm run mongo:start      # Start local MongoDB replica set for development
npm run mongo:stop       # Stop local MongoDB replica set

npm run mongo:test:start # Start MongoDB test containers (Docker)
npm run mongo:test:stop  # Stop MongoDB test containers
```

### **Code Quality & Analysis**
```bash
npm run analyze          # Run ESLint analysis on source code
npm run fix              # Automatically fix ESLint issues where possible
npm run cpd              # Run copy-paste detection analysis with jscpd (identifies code duplication)
```

### **Testing Scripts**
All testing scripts automatically manage Docker test containers - no manual setup required!

```bash
npm test                 # Run all tests (auto-starts test containers if needed)
npm run test:unit        # Run only unit tests (auto-starts test containers if needed)
npm run test:integration # Run only integration tests (auto-starts test containers if needed)
npm run test:watch       # Run tests in watch mode (auto-starts test containers if needed)
npm run test:coverage    # Run tests with coverage report (auto-starts test containers if needed)
npm run test:ci          # Run tests in CI mode (auto-starts test containers if needed)
```

**How Auto-Test Management Works:**
- **First run**: Automatically detects missing test containers and starts them
- **Subsequent runs**: Detects running containers and proceeds immediately  
- **Zero configuration**: Just run `npm test` and everything works
- **Manual control**: Use `npm run mongo:test:start/stop` for manual container management

## Project Structure

```
├── src/
│   ├── app.ts                    # Express application factory
│   ├── index.ts                  # Application entry point
│   ├── controllers/              # HTTP layer (request/response handling)
│   │   ├── routes.ts            # Main router configuration
│   │   ├── .../                # Endpoints
│   ├── domain/                   # Business logic and data access
│   │   ├── interfaces/          # Domain interfaces and contracts
│   │   └── mongodb/             # MongoDB-specific implementations
│   ├── dto/                      # Data Transfer Objects with validation
│   ├── setup/                    # Application configuration and middleware
│   │   ├── middleware/          # Custom middleware components
│   │   ├── EnvVars.ts          # Environment variable management
│   │   ├── logger.ts           # Logging configuration
│   │   └── swagger.ts          # API documentation setup
│   └── utils/                    # Reusable utilities and services
│       ├── JWTService.ts       # JWT token management
│       ├── PasswordService.ts  # Password hashing utilities
│       └── TimestampProducer.ts # Testable time abstraction
├── scripts/                      # Development and utility scripts
│   ├── auto-test.js             # Automatic test container management
│   ├── mongo-rs.js              # Local MongoDB replica set management
│   └── mongodb/                 # Local MongoDB data directory
├── tests/                        # Test suites (unit & integration)
├── docker-compose.yml           # Development environment setup
├── docker-compose.test.yml      # Test environment with MongoDB replica set
├── Dockerfile                   # Production container configuration
└── postman/                     # API testing collections
```

## Docker Setup

This template includes complete Docker containerization with multiple configurations:

- **Dockerfile**: Production-ready container configuration for deployment in remote environments (staging, production, cloud platforms)
- **docker-compose.yml**: Development environment setup for local testing and development with MongoDB integration  
- **docker-compose.test.yml**: Isolated test environment with dedicated MongoDB replica set for testing

### **Quick Start with docker-compose**

1. **Prerequisites**
   ```bash
   # Ensure Docker and Docker Compose are installed
   docker --version
   docker-compose --version
   ```

2. **Start the entire stack**
   ```bash
   # Option 1: Build and start all services in one command (recommended for first run)
   docker-compose up --build
   
   # Option 2: Build first, then start (useful for troubleshooting)
   docker-compose build
   docker-compose up
   
   # Option 3: Run in detached mode (background)
   docker-compose up -d --build
   
   # Option 4: Force complete rebuild without cache
   docker-compose up --build --force-recreate
   ```

2. **Access the application**
   - **API Server**: `http://localhost:8080`
   - **Health Check**: `http://localhost:8080/health`
   - **API Documentation**: `http://localhost:8080/docs`
   - **MongoDB**: `localhost:27017` (for direct connection)

## Architecture Layers

This template follows clean architecture principles with clear separation between layers; you can find a README.md in every directory representing the layer.

### **[Controllers Layer](./src/controllers/README.md)**
HTTP interface layer handling requests, responses, and API contracts.
- Route-based organization mirroring business domains
- TSOA integration for automatic OpenAPI documentation
- Authentication and authorization middleware
- Request validation and error handling
- Transaction management for data operations

### **[Domain Layer](./src/domain/README.md)**
Core business logic and data access abstractions.
- Database-agnostic interfaces and contracts
- MongoDB implementation with transaction support
- Entity definitions with strong typing
- DAO pattern for clean data access
- Session management for ACID compliance

### **[DTO Layer](./src/dto/README.md)**
Data contracts with validation for type-safe API communication.
- Request/response type definitions
- class-validator decorators for input validation
- Automatic validation middleware integration
- OpenAPI documentation generation
- Strong typing across API boundaries

### **[Setup Layer](./src/setup/README.md)**
Application configuration, middleware, and infrastructure setup.
- Environment variable management and validation
- Security middleware configuration (Helmet, CORS, rate limiting)
- Response compression for bandwidth optimization
- Logging setup with Winston
- Swagger documentation configuration
- Input sanitization and error handling

### **[Utils Layer](./src/utils/README.md)**
Reusable services and utilities for cross-cutting concerns.
- JWT token management and validation
- Password hashing with PBKDF2
- Time utilities and duration parsing
- Testable timestamp abstraction
- Common validation helpers

## Testing

This template provides a comprehensive testing framework built on Jest with TypeScript support, featuring **automatic Docker container management** for seamless test execution.

### **Automatic Test Environment Management**

The testing system automatically manages Docker containers for a realistic test environment:

**Zero-Configuration Testing:**
- **Smart Detection**: Automatically detects if test containers are running
- **Auto-Start**: Launches MongoDB replica set containers if needed
- **Immediate Execution**: Proceeds directly to testing if containers are already running
- **Isolated Environment**: Uses dedicated test database (port 27017) separate from development
- **Clean State**: Database is cleared before each test run for consistent results

**Workflow:**
```bash
# First time or after container stop
npm test  # → Detects missing containers → Starts them → Runs tests

# Subsequent runs (containers still running)  
npm test  # → Detects running containers → Runs tests immediately
```

### **Test Categories**

### **Unit Testing**

Unit tests focus on testing individual components in isolation with comprehensive mocking:

**Key Features:**
- **Isolated Testing**: Each component tested independently with mocked dependencies
- **Fast Execution**: Quick feedback loop for development
- **Dependency Injection**: Constructor injection enables easy mocking

### **Integration Testing**

Integration tests verify complete API workflows using real HTTP requests with Docker-based test environment:

**Key Features:**
- **End-to-End Testing**: Full request/response cycle testing
- **Real Database**: Uses Docker MongoDB replica set for realistic testing environment
- **Automatic Setup**: Test containers auto-start when needed, no manual configuration required
- **Isolated Environment**: Dedicated test database separate from development data
- **Authentication Flows**: Complete auth scenarios including token refresh
- **Transaction Testing**: Database transaction rollback verification with real MongoDB replica set
- **Container Management**: Automatic Docker container lifecycle management

### **Coverage Reports**

The template generates comprehensive coverage reports in multiple formats:
- **HTML Report**: `coverage/lcov-report/index.html` (interactive web interface)
- **LCOV Format**: `coverage/lcov.info` (for CI/CD integration)
- **JSON Summary**: `coverage/coverage-summary.json` (programmatic access)

### **Test Environment Advantages**

**Docker-based vs In-Memory Testing:**
- **Production Parity**: Real MongoDB replica set mirrors production environment exactly
- **Transaction Testing**: Full ACID compliance testing with actual replica set
- **Performance**: Faster startup compared to in-memory alternatives
- **Reliability**: Consistent behavior across different machines and CI environments
- **Isolation**: Complete separation between test and development databases
- **Debugging**: Ability to inspect test database state with standard MongoDB tools

## Continuous Integration (CI)

This project includes a comprehensive GitHub Actions workflow for automated testing and quality assurance.

### **CI Pipeline Features**

The CI pipeline (`.github/workflows/ci.yml`) automatically runs on:
- **Push events** to `master` and `develop` branches
- **Pull requests** targeting `master` and `develop` branches

### **Automated Quality Gates**

**Build & Dependencies:**
- **Node.js 18**: Consistent runtime environment
- **Cache optimization**: npm dependencies cached for faster builds
- **TypeScript compilation**: Ensures code compiles without errors
- **OpenAPI generation**: Validates API documentation consistency

**Code Quality Checks:**
- **ESLint analysis**: Code style and quality enforcement
- **Copy-paste detection**: Identifies code duplication for refactoring opportunities
- **Build verification**: Ensures production build succeeds

**Comprehensive Testing:**
- **Docker-based testing**: Identical environment to local development
- **MongoDB replica set**: Production-like database testing
- **Full test suite**: Unit and integration tests with coverage reporting
- **Automatic cleanup**: Test containers properly cleaned up after execution

### **CI Environment Benefits**

**Consistency & Reliability:**
- **Identical Setup**: Same Docker-based MongoDB as local development
- **Isolated Environment**: Each CI run gets fresh containers
- **Zero Configuration**: No manual setup required for contributors
- **Fast Execution**: Docker containers start quickly in GitHub Actions

**Quality Assurance:**
- **Automated Testing**: Every push and PR tested automatically
- **Multiple Quality Gates**: Build, lint, duplicate detection, and tests
- **Coverage Reporting**: Comprehensive test coverage analysis
- **Fail-Fast Approach**: Early detection of issues in the development cycle

The CI system leverages the same testing infrastructure used locally, ensuring consistent behavior between development and CI environments.

## Security Implementation

### **Multi-Layer Security Approach**

1. **Input Layer Security**
   - XSS prevention with DOMPurify sanitization
   - SQL injection prevention through parameterized queries
   - Request size limits and parsing controls
   - Comprehensive input validation with DTOs

2. **Authentication & Authorization**
   - JWT-based stateless authentication
   - Secure refresh token rotation
   - Token expiration and revocation
   - Protected route authentication middleware

3. **Network Security**
   - CORS configuration with environment-specific origins
   - Security headers with Helmet (CSP, HSTS, etc.)
   - Rate limiting with multiple tiers
   - Trust proxy configuration for load balancers

4. **Data Security**
   - Password hashing with PBKDF2 and salt
   - Database transaction isolation
   - Secure error handling without information leakage
   - Environment-specific security configurations

## API Documentation & Testing

### **Auto-generated Swagger Documentation**
Once the server is running, comprehensive API documentation is automatically available at:
- **Swagger UI**: `http://localhost:3000/docs` (or your configured port)

The documentation includes:
- **Interactive API Explorer**: Test endpoints directly from the browser
- **Request/Response Schemas**: Auto-generated from TypeScript DTOs
- **Authentication Examples**: JWT token usage and refresh flow
- **Error Response Documentation**: Consistent error formats across all endpoints

### **Postman Integration**
The `postman/` directory contains ready-to-use Postman files for immediate API testing:

- **Collection**:
  - Complete set of API endpoints
  - Pre-configured requests with proper headers
  - Authentication flow examples
  - Sample request payloads

- **Environment**:
  - Development server configuration
  - Base URL and port settings
  - Authentication token variables
  - Environment-specific variables

**Import both files into Postman to start testing the API immediately!**
