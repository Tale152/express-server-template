# Utils Layer

- [Overview](#overview)
- [Available Utilities](#available-utilities)
  - [JWTService](#jwtservice)
  - [PasswordService](#passwordservice)
  - [TimeUtils](#timeutils)
  - [TimestampProducer](#timestampproducer)

## Overview

The utils layer provides reusable utility classes and services that handle cross-cutting concerns across the application. These utilities are designed to be:

- **Stateless**: Most utilities are static classes or pure functions
- **Testable**: All dependencies are injectable, time-dependent functions are abstracted
- **Focused**: Each utility has a single, well-defined responsibility
- **Secure**: Security-sensitive operations follow industry best practices

Unlike domain utilities which are database-agnostic and coordinate domain operations, these application utilities handle technical concerns like cryptography, time parsing, and token management.

## Available Utilities

### JWTService
> **JWT token management for authentication**

**File**: [`JWTService.ts`](./JWTService.ts)

**What it does**: 
- Generates access and refresh tokens with cryptographic entropy
- Verifies tokens using different secrets for access vs refresh
- Supports token decoding for debugging purposes

**When to use**: Authentication flows, token validation middleware, token refresh operations.

---

### PasswordService
> **Secure password hashing and verification**

**File**: [`PasswordService.ts`](./PasswordService.ts)

**What it does**:
- Hashes passwords using PBKDF2 + SHA-512 with random salt
- Verifies passwords with constant-time comparison
- Prevents rainbow table and timing attacks

**When to use**: User registration, login verification, password changes.

---

### TimeUtils
> **Human-readable time string parsing**

**File**: [`TimeUtils.ts`](./TimeUtils.ts)

**What it does**:
- Converts time strings ("15m", "7d") to milliseconds
- Supports seconds (s), minutes (m), hours (h), days (d)
- Used for JWT expiration and configuration parsing

**When to use**: JWT expiration calculation, timeout configurations, any duration parsing.

---

### TimestampProducer
> **Testable timestamp generation abstraction**

**File**: [`TimestampProducer.ts`](./TimestampProducer.ts)

**What it does**:
- Abstracts `Date.now()` for dependency injection
- Enables mocking time in tests
- Provides consistent timestamp interface

**When to use**: Time-dependent business logic, testing scenarios requiring fixed timestamps.
