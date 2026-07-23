---
layout: home

hero:
  name: Autoswag
  text: OpenAPI from TypeScript
  tagline: Keep your JSDoc. Reuse your TypeScript and Zod types. Generate OpenAPI without decorators or duplicate schemas.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/installation
    - theme: alt
      text: View on GitHub
      link: https://github.com/seyves/autoswag
    - theme: alt
      text: Introduction
      link: /guide/introduction

features:
  - title: No Duplicate Schemas
    details: Define types once in TypeScript or Zod, reference them in JSDoc. No duplication, no drift. Change your type, documentation updates automatically.

  - title: Works with Existing APIs
    details: Plain Express, Fastify, Hono—no wrappers needed. No framework lock-in. Millions of existing Node.js APIs don't need rewrites.

  - title: Comprehensive Type Support
    details: Unions, discriminated unions, generics, enums, intersections, arrays, tuples, records. Zod schemas with automatic format inference. Everything you need.
---

## Quick Example

Define types once in TypeScript:

```ts
// types/user.ts
export interface User {
    id: string
    name: string
    email?: string
}

export interface CreateUserRequest {
    name: string
    email: string
}
```

Document endpoints with JSDoc:

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
 */
export async function createUser(req, res) {
    // Your implementation
}
```

**Generates complete OpenAPI documentation:**

```json
{
  "paths": {
    "/users": {
      "post": {
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
                    "email": { "type": "string" }
                  },
                  "required": ["id", "name"]
                }
              }
            }
          },
          "400": { "description": "Invalid input" }
        }
      }
    }
  }
}
```
