---
layout: home

hero:
  name: Autoswag
  text: OpenAPI from TypeScript
  tagline: Generate OpenAPI documentation from JSDoc comments and TypeScript types. Keep your API docs in sync with your code automatically.
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
  - icon: 🎯
    title: Single Source of Truth
    details: Define types once in TypeScript, reference them in JSDoc. No duplication, no drift between code and documentation.

  - icon: ⚡
    title: TypeScript-First
    details: Automatically converts TypeScript types to OpenAPI schemas. Interfaces, unions, generics, enums - all supported out of the box.

  - icon: 📝
    title: JSDoc Powered
    details: Document endpoints using natural JSDoc comments. Simple syntax, powerful features, stays close to your implementation.
---

## Usage example

```ts
import type { User, CreateUserRequest, ErrorResponse } from '@/types/user'

/**
 * @autoswag POST /users
 * @summary Create a new user
 * @tag Users
 * @accept {CreateUserRequest}
 * @response {User} 201 User created successfully
 * @response {ErrorResponse} 400 Invalid input
 * @response 401 Unauthorized
 */
export async function createUser(req, res) {
    // Your implementation here
}
```
