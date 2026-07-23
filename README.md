# Autoswag

[![npm version](https://img.shields.io/npm/v/autoswag.svg)](https://www.npmjs.com/package/autoswag)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

Autoswag generates OpenAPI documentation from JSDoc comments and TypeScript types.

It is designed for existing Node.js projects that want to keep API documentation close to the code without introducing decorators or maintaining OpenAPI schemas by hand.

Autoswag works with plain TypeScript types, Zod schemas (`z.infer`) and JavaScript `@typedef`s.

## Comparison

| Feature               | Autoswag | swagger-jsdoc | tsoa | NestJS Swagger | zod-openapi |
| --------------------- | -------- | ------------- | ---- | -------------- | ----------- |
| Standard JSDoc        | ✅       | ✅            | ❌   | ❌             | ❌          |
| TypeScript -> OpenAPI | ✅       | ❌            | ✅   | ✅             | ⚠️          |
| Full Zod support      | ⚠️       | ❌            | ⚠️   | ❌             | ✅          |
| No runtime decorators | ✅       | ✅            | ❌   | ❌             | ✅          |
| Framework independent | ✅       | ✅            | ⚠️   | ❌             | ✅          |
| JS typedef support    | ✅       | ❌            | ❌   | ❌             | ❌          |

## Features

- Framework agnostic (Express, Fastify, Hono, or any other Node.js framework)
- Generates OpenAPI schemas from TypeScript types
- Supports `z.infer`
- Supports JavaScript `@typedef`
- No runtime decorators
- No duplicate schema definitions

## Installation

```bash
npm install -D autoswag
```

## Works with Existing APIs

Autoswag doesn't require a custom router or decorators.

```ts
import type { User, CreateUserRequest } from './types'

/**
 * @autoswag POST /users
 * @summary Create user
 * @accept {CreateUserRequest}
 * @response {User} 201
 */
app.post('/users', createUser)
```

## Supported TypeScript types

- **Primitives & literals** - `string`, `number`, `'active' | 'pending'`
- **Objects** - Interfaces, type aliases, nested objects, optional properties
- **Arrays & tuples** - `User[]`, `[string, number]`
- **Unions** - `string | number`, discriminated unions
- **Intersections** - `Named & Aged`
- **Enums** - String and numeric enums
- **Generics** - `Response<T>`, resolved at usage
- **Records** - `Record<string, User>`

[See all supported types ->](https://autoswag.vercel.app/guide/supported-types.html)

## Quick Example

Given the following types:

```ts
// types/user.ts
export interface User {
    id: string
    name: string
    email?: string
    role: 'admin' | 'user'
}

export interface CreateUserRequest {
    name: string
    email: string
}
```

Document an endpoint:

```ts
// api/users.ts
import type { User, CreateUserRequest } from '@/types/user'

/**
 * @autoswag POST /users
 * @summary Create a new user
 * @tag Users
 * @accept {CreateUserRequest}
 * @response {User} 201 User created successfully
 * @response 400 Invalid input
 * @response 401 Unauthorized
 */
export async function createUser(req, res) {
    // Your implementation
}
```

**Autoswag generates the corresponding operation object:**

```json
{
    "summary": "Create a new user",
    "tags": ["Users"],
    "requestBody": {
        "content": {
            "application/json": {
                "schema": {
                    "type": "object",
                    "properties": {
                        "name": { "type": "string" },
                        "email": { "type": "string" }
                    },
                    "required": ["name", "email"]
                }
            }
        }
    },
    "responses": {
        "201": {
            "description": "User created successfully",
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "id": { "type": "string" },
                            "name": { "type": "string" },
                            "email": { "type": "string" },
                            "role": { "type": "string", "enum": ["admin", "user"] }
                        },
                        "required": ["id", "name", "role"]
                    }
                }
            }
        },
        "400": { "description": "Invalid input" },
        "401": { "description": "Unauthorized" }
    }
}
```

Change the TypeScript type, regenerate the OpenAPI document, and the schema stays in sync.

## Zod Generation Example

```ts
import { z } from 'zod'

export const AddressSchema = z.object({
    /** Street address */
    street: z.string(),
    city: z.string(),
    zip: z.string(),
})

export const UserSchema = z.object({
    /** @format uuid */
    id: z.uuid(),
    /** User name */
    name: z.string(),
    /** @format email */
    email: z.email(),
    age: z.number().int().optional(),
    address: AddressSchema,
    role: z.enum(['user', 'admin']),
    /** @format datetime */
    createdAt: z.iso.datetime(),
})

export type User = z.infer<typeof UserSchema>
```

**Generated OpenAPI schema for User:**

```json
{
    "type": "object",
    "properties": {
        "id": { "type": "string", "format": "uuid" },
        "name": { "type": "string", "description": "User name" },
        "email": { "type": "string", "format": "email" },
        "address": {
            "type": "object",
            "properties": {
                "street": { "type": "string", "description": "Street address" },
                "city": { "type": "string" },
                "zip": { "type": "string" }
            },
            "required": ["street", "city", "zip"]
        },
        "role": { "type": "string", "enum": ["user", "admin"] },
        "createdAt": { "type": "string", "format": "datetime" },
        "age": { "type": "number" }
    },
    "required": ["id", "name", "email", "address", "role", "createdAt"]
}
```

## Documentation

Full documentation available at [autoswag.vercel.app](https://autoswag.vercel.app/)

## What's Next?

- **[Quick Start](https://autoswag.vercel.app/guide/quick-start.html)**
- **[Supported Types](https://autoswag.vercel.app/guide/supported-types.html)**
- **[JSDoc Tags](https://autoswag.vercel.app/guide/tags-overview.html)**
- **[Examples](https://autoswag.vercel.app/guide/rest-api-example.html)**

## Contributing

Issues and PRs welcome! [GitHub repository](https://github.com/Seyves/autoswag)

## License

ISC
